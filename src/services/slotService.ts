import { createClient } from '@supabase/supabase-js';

// ============================================================
// Inicialização do cliente Supabase
// ============================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'HoraHub: Variáveis de ambiente do Supabase não configuradas. ' +
    'Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// Tipos de Dados
// ============================================================

export interface SlotDisponivel {
  horario: string; // formato 'HH:MM'
}

export interface CriarAgendamentoParams {
  tenantId: string;
  funcionarioId: string;
  clienteNome: string;
  servicoId: string;
  horarioInicio: Date; // objeto Date em UTC
  horarioFim: Date;    // objeto Date em UTC
  custoOperacional?: number;
}

export interface AgendamentoCreado {
  id: string;
  status: string;
  horarioInicio: string;
  horarioFim: string;
}

// ============================================================
// FUNÇÃO 1: Buscar Slots Disponíveis
// Chama a PostgreSQL Function `get_slots_disponiveis`
// via RPC do Supabase
// ============================================================

/**
 * Retorna array de horários livres para um profissional em uma data,
 * dado um serviço específico. Os horários são retornados no formato
 * 'HH:MM' no timezone America/Sao_Paulo.
 *
 * @param funcionarioId - UUID do profissional
 * @param dataDesejada  - Data no formato 'YYYY-MM-DD'
 * @param servicoId     - UUID do serviço desejado
 * @returns Array de strings com horários livres (ex: ['09:00', '09:45', '10:30'])
 */
export async function getSlotsDisponiveis(
  funcionarioId: string,
  dataDesejada: string, // 'YYYY-MM-DD'
  servicoId: string
): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_slots_disponiveis', {
    p_funcionario_id: funcionarioId,
    p_data_desejada: dataDesejada,
    p_servico_id: servicoId,
  });

  if (error) {
    console.error('[HoraHub] Erro ao buscar slots disponíveis:', error.message);
    throw new Error(`Não foi possível buscar os horários disponíveis: ${error.message}`);
  }

  // A function retorna TEXT[] que o Supabase converte para string[]
  return (data as string[]) ?? [];
}

// ============================================================
// FUNÇÃO 2: Criar Agendamento com tratamento de Double-Booking
// ============================================================

/**
 * Cria um novo agendamento no banco de dados.
 * Captura automaticamente o erro de double-booking lançado pela trigger
 * e relança com uma mensagem amigável para o usuário.
 *
 * Estratégia de Fuso Horário:
 * - Recebe objetos Date em UTC (padrão JS)
 * - O Supabase/PostgreSQL armazena internamente em UTC (TIMESTAMPTZ)
 * - A função `get_slots_disponiveis` converte para America/Sao_Paulo na exibição
 *
 * @param params - Dados do agendamento a ser criado
 * @returns O agendamento criado com id e status
 */
export async function criarAgendamento(
  params: CriarAgendamentoParams
): Promise<AgendamentoCreado> {
  const { data, error } = await supabase
    .from('agendamentos')
    .insert({
      tenant_id: params.tenantId,
      funcionario_id: params.funcionarioId,
      cliente_name: params.clienteNome,
      servico_id: params.servicoId,
      horario_inicio: params.horarioInicio.toISOString(),
      horario_fim: params.horarioFim.toISOString(),
      custo_operacional: params.custoOperacional ?? 0,
      status: 'pendente',
    })
    .select('id, status, horario_inicio, horario_fim')
    .single();

  if (error) {
    // Detectar erro de double-booking lançado pela trigger
    // A trigger usa ERRCODE 'unique_violation' (código 23505)
    if (
      error.code === '23505' ||
      error.message.includes('DOUBLE_BOOKING') ||
      error.message.includes('Horário já ocupado')
    ) {
      // Extrair mensagem amigável da trigger (se disponível)
      const mensagemAmigavel = error.message.includes('Horário já ocupado')
        ? error.message.replace('DOUBLE_BOOKING:', '').trim()
        : 'Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário.';

      throw new Error(mensagemAmigavel);
    }

    // Outros erros de banco de dados
    console.error('[HoraHub] Erro ao criar agendamento:', error);
    throw new Error(`Não foi possível criar o agendamento: ${error.message}`);
  }

  return {
    id: data.id,
    status: data.status,
    horarioInicio: data.horario_inicio,
    horarioFim: data.horario_fim,
  };
}

// ============================================================
// FUNÇÃO AUXILIAR: Converter data local (SP) para horário UTC
// ============================================================

/**
 * Converte uma string de data + horário no timezone de São Paulo
 * para um objeto Date em UTC (padrão JavaScript).
 *
 * @param data       - 'YYYY-MM-DD'
 * @param horario    - 'HH:MM' (no timezone America/Sao_Paulo)
 * @returns          - Date em UTC
 *
 * @example
 * // 09:00 em São Paulo (UTC-3) = 12:00 UTC
 * converterHorarioSPParaUTC('2026-07-14', '09:00')
 * // => Date('2026-07-14T12:00:00.000Z')
 */
export function converterHorarioSPParaUTC(data: string, horario: string): Date {
  // Criar uma string ISO com o offset explícito de São Paulo (-03:00)
  // Isso funciona corretamente durante horário padrão e horário de verão
  const isoComOffset = `${data}T${horario}:00-03:00`;
  return new Date(isoComOffset);
}
