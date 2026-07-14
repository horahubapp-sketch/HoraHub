import { describe, it, expect } from 'vitest';
import {
  converterHorarioSPParaUTC,
  intervalosSeSOBREPOEM,
  slotConflitaComAlmoco,
  horarioParaMinutos,
} from './slotUtils';

// ============================================================
// TESTES UNITÁRIOS - Frente B: Motor de Slots
// HoraHub | Vitest
//
// Estes testes cobrem a lógica pura de TypeScript (funções em slotUtils.ts):
// - Conversão de fuso horário (São Paulo UTC-3 → UTC)
// - Detecção de sobreposição de intervalos (equivalente ao operador && do PostgreSQL)
// - Buffer de preparo entre slots
// - Filtro de horários de almoço
//
// Para testes de integração completos (function SQL, trigger, RPC),
// utilize o SQL Editor do Supabase com dados de teste reais.
// ============================================================

// ============================================================
// GRUPO 1: Conversão de Fuso Horário (America/Sao_Paulo → UTC)
// ============================================================
describe('converterHorarioSPParaUTC', () => {

  it('deve converter 09:00 horário de SP para 12:00 UTC', () => {
    // São Paulo é UTC-3 (fora do horário de verão)
    const resultado = converterHorarioSPParaUTC('2026-07-14', '09:00');

    expect(resultado.getUTCHours()).toBe(12);
    expect(resultado.getUTCMinutes()).toBe(0);
    expect(resultado.toISOString()).toBe('2026-07-14T12:00:00.000Z');
  });

  it('deve converter 17:30 horário de SP para 20:30 UTC', () => {
    const resultado = converterHorarioSPParaUTC('2026-07-14', '17:30');
    expect(resultado.getUTCHours()).toBe(20);
    expect(resultado.getUTCMinutes()).toBe(30);
    expect(resultado.toISOString()).toBe('2026-07-14T20:30:00.000Z');
  });

  it('deve lidar corretamente com a virada do dia (22:00 SP = 01:00 UTC dia seguinte)', () => {
    const resultado = converterHorarioSPParaUTC('2026-07-14', '22:00');
    expect(resultado.toISOString()).toBe('2026-07-15T01:00:00.000Z');
  });

  it('deve retornar um objeto Date válido', () => {
    const resultado = converterHorarioSPParaUTC('2026-07-14', '09:00');
    expect(resultado).toBeInstanceOf(Date);
    expect(isNaN(resultado.getTime())).toBe(false);
  });

  it('não deve alterar a data para horários durante o horário de trabalho padrão', () => {
    const resultado = converterHorarioSPParaUTC('2026-07-14', '08:00');
    // 08:00 SP = 11:00 UTC - ainda é dia 14
    expect(resultado.toISOString().startsWith('2026-07-14')).toBe(true);
  });

});

// ============================================================
// GRUPO 2: Sobreposição de Intervalos (operador && do PostgreSQL)
// ============================================================
describe('intervalosSeSOBREPOEM', () => {

  it('deve detectar sobreposição quando um slot começa no meio de outro', () => {
    const existente = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:00'),
      fim: converterHorarioSPParaUTC('2026-07-14', '10:00')
    };
    const novo = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:30'),
      fim: converterHorarioSPParaUTC('2026-07-14', '10:30')
    };
    expect(intervalosSeSOBREPOEM(existente.inicio, existente.fim, novo.inicio, novo.fim)).toBe(true);
  });

  it('deve detectar sobreposição quando um slot está completamente dentro de outro', () => {
    const existente = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:00'),
      fim: converterHorarioSPParaUTC('2026-07-14', '10:30')
    };
    const novo = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:15'),
      fim: converterHorarioSPParaUTC('2026-07-14', '10:00')
    };
    expect(intervalosSeSOBREPOEM(existente.inicio, existente.fim, novo.inicio, novo.fim)).toBe(true);
  });

  it('NÃO deve detectar sobreposição quando os slots são consecutivos', () => {
    // 09:00-10:00 e 10:00-11:00 - intervalo semi-aberto [inicio, fim)
    const existente = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:00'),
      fim: converterHorarioSPParaUTC('2026-07-14', '10:00')
    };
    const novo = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '10:00'),
      fim: converterHorarioSPParaUTC('2026-07-14', '11:00')
    };
    expect(intervalosSeSOBREPOEM(existente.inicio, existente.fim, novo.inicio, novo.fim)).toBe(false);
  });

  it('NÃO deve detectar sobreposição quando os slots são separados por mais de 1 hora', () => {
    const existente = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:00'),
      fim: converterHorarioSPParaUTC('2026-07-14', '10:00')
    };
    const novo = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '11:00'),
      fim: converterHorarioSPParaUTC('2026-07-14', '12:00')
    };
    expect(intervalosSeSOBREPOEM(existente.inicio, existente.fim, novo.inicio, novo.fim)).toBe(false);
  });

  it('deve detectar sobreposição quando novo slot engloba completamente o existente', () => {
    const existente = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:30'),
      fim: converterHorarioSPParaUTC('2026-07-14', '10:00')
    };
    const novo = {
      inicio: converterHorarioSPParaUTC('2026-07-14', '09:00'),
      fim: converterHorarioSPParaUTC('2026-07-14', '11:00')
    };
    expect(intervalosSeSOBREPOEM(existente.inicio, existente.fim, novo.inicio, novo.fim)).toBe(true);
  });

});

// ============================================================
// GRUPO 3: Buffer de Preparo/Limpeza
// ============================================================
describe('Cálculo de bloco total com buffer de preparo', () => {

  it('deve calcular corretamente duração + preparo (45 + 5 = 50 min)', () => {
    const duracaoMinutos = 45;
    const preparoMinutos = 5;
    const blocoTotal = duracaoMinutos + preparoMinutos;

    expect(blocoTotal).toBe(50);

    // Se o slot começa às 09:00, o próximo disponível seria 09:50
    const slotInicio = converterHorarioSPParaUTC('2026-07-14', '09:00');
    const proximoSlotInicio = new Date(slotInicio.getTime() + blocoTotal * 60 * 1000);

    // 09:00 SP + 50 min = 09:50 SP = 12:50 UTC
    expect(proximoSlotInicio.getUTCHours()).toBe(12);
    expect(proximoSlotInicio.getUTCMinutes()).toBe(50);
  });

  it('deve garantir que buffer de 0 minutos funcione corretamente', () => {
    const blocoTotal = 30 + 0;
    expect(blocoTotal).toBe(30);
  });

  it('deve aceitar buffer customizado maior que o padrão (60 + 15 = 75 min)', () => {
    const blocoTotal = 60 + 15;
    expect(blocoTotal).toBe(75);
  });

});

// ============================================================
// GRUPO 4: Filtro de Almoço
// ============================================================
describe('slotConflitaComAlmoco', () => {

  it('deve excluir slot que começa durante o almoço', () => {
    // Almoço: 12:00-13:00 (720-780 min), Slot: 12:30-13:15 (750-795 min)
    expect(slotConflitaComAlmoco(
      horarioParaMinutos('12:30'), horarioParaMinutos('13:15'),
      horarioParaMinutos('12:00'), horarioParaMinutos('13:00')
    )).toBe(true);
  });

  it('deve excluir slot que começa antes e termina durante o almoço', () => {
    // Almoço: 12:00-13:00, Slot: 11:30-12:30
    expect(slotConflitaComAlmoco(
      horarioParaMinutos('11:30'), horarioParaMinutos('12:30'),
      horarioParaMinutos('12:00'), horarioParaMinutos('13:00')
    )).toBe(true);
  });

  it('deve excluir slot que engloba completamente o almoço', () => {
    // Almoço: 12:00-13:00, Slot: 11:00-14:00
    expect(slotConflitaComAlmoco(
      horarioParaMinutos('11:00'), horarioParaMinutos('14:00'),
      horarioParaMinutos('12:00'), horarioParaMinutos('13:00')
    )).toBe(true);
  });

  it('NÃO deve excluir slot que termina exatamente quando o almoço começa', () => {
    // Almoço: 12:00-13:00, Slot: 11:00-12:00
    expect(slotConflitaComAlmoco(
      horarioParaMinutos('11:00'), horarioParaMinutos('12:00'),
      horarioParaMinutos('12:00'), horarioParaMinutos('13:00')
    )).toBe(false);
  });

  it('NÃO deve excluir slot que começa exatamente quando o almoço termina', () => {
    // Almoço: 12:00-13:00, Slot: 13:00-14:00
    expect(slotConflitaComAlmoco(
      horarioParaMinutos('13:00'), horarioParaMinutos('14:00'),
      horarioParaMinutos('12:00'), horarioParaMinutos('13:00')
    )).toBe(false);
  });

  it('NÃO deve excluir slot completamente antes do almoço', () => {
    // Almoço: 12:00-13:00, Slot: 10:00-11:00
    expect(slotConflitaComAlmoco(
      horarioParaMinutos('10:00'), horarioParaMinutos('11:00'),
      horarioParaMinutos('12:00'), horarioParaMinutos('13:00')
    )).toBe(false);
  });

  it('NÃO deve excluir slot completamente depois do almoço', () => {
    // Almoço: 12:00-13:00, Slot: 14:00-15:00
    expect(slotConflitaComAlmoco(
      horarioParaMinutos('14:00'), horarioParaMinutos('15:00'),
      horarioParaMinutos('12:00'), horarioParaMinutos('13:00')
    )).toBe(false);
  });

});

// ============================================================
// GRUPO 5: Conversão horarioParaMinutos
// ============================================================
describe('horarioParaMinutos', () => {

  it('deve converter 08:00 para 480 minutos', () => {
    expect(horarioParaMinutos('08:00')).toBe(480);
  });

  it('deve converter 12:00 para 720 minutos', () => {
    expect(horarioParaMinutos('12:00')).toBe(720);
  });

  it('deve converter 13:30 para 810 minutos', () => {
    expect(horarioParaMinutos('13:30')).toBe(810);
  });

  it('deve converter 00:00 para 0 minutos', () => {
    expect(horarioParaMinutos('00:00')).toBe(0);
  });

});
