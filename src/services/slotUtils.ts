// ============================================================
// slotUtils.ts - Funções utilitárias puras de tempo e slots
// Sem dependência de Supabase - 100% testáveis de forma unitária
// ============================================================

/**
 * Converte uma string de data + horário no timezone de São Paulo
 * para um objeto Date em UTC (padrão JavaScript).
 *
 * Estratégia: usa o offset explícito -03:00 na string ISO,
 * que é válido tanto no horário padrão quanto no horário de verão
 * (quando SP opera em -02:00, o usuário deve ajustar o offset
 * para -02:00 nessa época do ano).
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
  const isoComOffset = `${data}T${horario}:00-03:00`;
  return new Date(isoComOffset);
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem.
 * Equivalente ao operador && (overlap) do PostgreSQL com tstzrange.
 * Utiliza intervalos semi-abertos [inicio, fim), ou seja:
 * - O início está INCLUÍDO
 * - O fim está EXCLUÍDO
 *
 * Dois intervalos [A, B) e [C, D) se sobrepõem quando: A < D && C < B
 *
 * @example
 * // 09:00-10:00 e 09:30-10:30 se sobrepõem
 * intervalosSeSOBREPOEM(09:00, 10:00, 09:30, 10:30) => true
 *
 * // 09:00-10:00 e 10:00-11:00 são consecutivos, NÃO se sobrepõem
 * intervalosSeSOBREPOEM(09:00, 10:00, 10:00, 11:00) => false
 */
export function intervalosSeSOBREPOEM(
  aInicio: Date, aFim: Date,
  bInicio: Date, bFim: Date
): boolean {
  return aInicio < bFim && bInicio < aFim;
}

/**
 * Verifica se um slot de horário conflita com o intervalo de almoço.
 * Recebe e retorna em minutos desde meia-noite para facilitar os cálculos.
 *
 * @param slotInicioMin   - Início do slot em minutos desde meia-noite
 * @param slotFimMin      - Fim do slot em minutos desde meia-noite
 * @param almocoInicioMin - Início do almoço em minutos desde meia-noite
 * @param almocoFimMin    - Fim do almoço em minutos desde meia-noite
 * @returns true se há conflito
 */
export function slotConflitaComAlmoco(
  slotInicioMin: number, slotFimMin: number,
  almocoInicioMin: number, almocoFimMin: number
): boolean {
  return slotInicioMin < almocoFimMin && slotFimMin > almocoInicioMin;
}

/**
 * Converte uma string de horário 'HH:MM' para minutos desde meia-noite.
 * Útil para cálculos aritméticos de tempo sem precisar de objetos Date.
 *
 * @param horario - 'HH:MM'
 * @returns número de minutos desde 00:00
 *
 * @example
 * horarioParaMinutos('09:30') => 570
 * horarioParaMinutos('12:00') => 720
 */
export function horarioParaMinutos(horario: string): number {
  const [h, m] = horario.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converte minutos desde meia-noite para string de horário 'HH:MM'.
 *
 * @param minutos - número de minutos desde 00:00
 * @returns string no formato 'HH:MM'
 *
 * @example
 * minutosParaHorario(570) => '09:30'
 * minutosParaHorario(720) => '12:00'
 */
export function minutosParaHorario(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
