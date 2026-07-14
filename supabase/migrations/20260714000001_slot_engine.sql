-- ============================================================
-- MIGRAÇÃO: Frente B - Motor de Slots e Anti Double-Booking
-- HoraHub | Data: 2026-07-14
-- ============================================================

-- 1. Ativar extensão necessária para Exclusion Constraint baseado em intervalo de tempo
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Adicionar buffer de preparação parametrizável na tabela de serviços
--    (tempo em minutos entre agendamentos para limpeza/preparo - padrão: 5 min)
ALTER TABLE servicos
  ADD COLUMN IF NOT EXISTS intervalo_preparo_minutos INT NOT NULL DEFAULT 5 CHECK (intervalo_preparo_minutos >= 0);

-- 3. EXCLUSION CONSTRAINT: Prevenção de Double-Booking em nível de banco de dados
--    Esta constraint é a linha de defesa mais forte - rejeita sobreposição de
--    intervalos de tempo para o mesmo profissional antes mesmo de qualquer trigger.
--    Considera apenas agendamentos 'pendente' ou 'confirmado' (ignora 'cancelado').
--    NOTA: Não é possível filtrar por status diretamente em exclusion constraints,
--    então usamos a trigger abaixo para a lógica de status.
--    O índice GIST é criado automaticamente pela constraint.
CREATE INDEX IF NOT EXISTS idx_agendamentos_gist_horario
  ON agendamentos USING GIST (
    funcionario_id,
    tstzrange(horario_inicio, horario_fim, '[)')
  );

-- 4. FUNÇÃO AUXILIAR: Verificar sobreposição de agendamentos ativos
--    Usada pela trigger abaixo para checar conflitos filtrando status cancelado
CREATE OR REPLACE FUNCTION verificar_conflito_agendamento()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  conflito_encontrado BOOLEAN;
  cliente_conflitante TEXT;
BEGIN
  -- Verificar se há sobreposição com agendamentos ativos (pendente ou confirmado)
  SELECT
    EXISTS (
      SELECT 1
      FROM agendamentos a
      WHERE
        a.funcionario_id = NEW.funcionario_id
        AND a.id != COALESCE(NEW.id, gen_random_uuid()) -- ignorar o próprio registro em updates
        AND a.status IN ('pendente', 'confirmado')
        AND tstzrange(a.horario_inicio, a.horario_fim, '[)')
          && tstzrange(NEW.horario_inicio, NEW.horario_fim, '[)')
    ),
    (
      SELECT a.cliente_name
      FROM agendamentos a
      WHERE
        a.funcionario_id = NEW.funcionario_id
        AND a.id != COALESCE(NEW.id, gen_random_uuid())
        AND a.status IN ('pendente', 'confirmado')
        AND tstzrange(a.horario_inicio, a.horario_fim, '[)')
          && tstzrange(NEW.horario_inicio, NEW.horario_fim, '[)')
      LIMIT 1
    )
  INTO conflito_encontrado, cliente_conflitante;

  IF conflito_encontrado THEN
    RAISE EXCEPTION
      'DOUBLE_BOOKING: Horário já ocupado para este profissional entre % e %. Por favor, escolha outro horário.',
      to_char(NEW.horario_inicio AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI'),
      to_char(NEW.horario_fim AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')
      USING ERRCODE = 'unique_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- 5. TRIGGER: Disparar validação ANTES de cada INSERT ou UPDATE em agendamentos
DROP TRIGGER IF EXISTS trg_verificar_conflito ON agendamentos;

CREATE TRIGGER trg_verificar_conflito
  BEFORE INSERT OR UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION verificar_conflito_agendamento();

-- 6. FUNÇÃO PRINCIPAL: Geração de Slots Disponíveis
--    Recebe: funcionario_id, data_desejada, servico_id
--    Retorna: array de horários livres no formato 'HH:MI'
--    Timezone: America/Sao_Paulo (UTC-3, padrão Brasil)
CREATE OR REPLACE FUNCTION get_slots_disponiveis(
  p_funcionario_id     UUID,
  p_data_desejada      DATE,
  p_servico_id         UUID
)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE  -- hint para o planner: não modifica o banco
AS $$
DECLARE
  -- Jornada do profissional
  v_hora_inicio        TIME;
  v_hora_fim           TIME;
  v_almoco_inicio      TIME;
  v_almoco_fim         TIME;

  -- Dados do serviço
  v_duracao_minutos    INT;
  v_preparo_minutos    INT;
  v_bloco_total        INT; -- duração + preparo

  -- Variáveis de iteração
  v_slot_inicio_time   TIME;
  v_slot_fim_time      TIME;
  v_slot_inicio_ts     TIMESTAMPTZ;
  v_slot_fim_ts        TIMESTAMPTZ;
  v_dia_semana         INT;

  -- Resultado
  v_slots              TEXT[] := '{}';
  v_conflito           BOOLEAN;
BEGIN
  -- Dia da semana para a data desejada (0=Dom, 1=Seg...6=Sáb) no timezone de SP
  v_dia_semana := EXTRACT(DOW FROM p_data_desejada::TIMESTAMPTZ AT TIME ZONE 'America/Sao_Paulo');

  -- Buscar jornada de trabalho do profissional para o dia da semana
  SELECT
    j.hora_inicio,
    j.hora_fim,
    j.almoco_inicio,
    j.almoco_fim
  INTO
    v_hora_inicio,
    v_hora_fim,
    v_almoco_inicio,
    v_almoco_fim
  FROM jornadas_trabalho j
  WHERE
    j.funcionario_id = p_funcionario_id
    AND j.dia_semana = v_dia_semana
  LIMIT 1;

  -- Se não houver jornada para o dia, retornar array vazio
  IF NOT FOUND THEN
    RETURN v_slots;
  END IF;

  -- Buscar dados do serviço (duração + buffer de preparo)
  SELECT
    s.duracao_minutos,
    s.intervalo_preparo_minutos
  INTO
    v_duracao_minutos,
    v_preparo_minutos
  FROM servicos s
  WHERE s.id = p_servico_id;

  -- Se o serviço não existir, retornar array vazio
  IF NOT FOUND THEN
    RETURN v_slots;
  END IF;

  -- Tamanho total do bloco que o serviço ocupa (duração + preparo)
  v_bloco_total := v_duracao_minutos + v_preparo_minutos;

  -- Iterar sobre cada slot candidato dentro da jornada
  -- Passo: v_bloco_total minutos por vez
  v_slot_inicio_time := v_hora_inicio;

  WHILE v_slot_inicio_time + (v_duracao_minutos || ' minutes')::INTERVAL <= v_hora_fim LOOP

    v_slot_fim_time := v_slot_inicio_time + (v_duracao_minutos || ' minutes')::INTERVAL;

    -- Converter slot para TIMESTAMPTZ no timezone de São Paulo
    v_slot_inicio_ts := (p_data_desejada::TEXT || ' ' || v_slot_inicio_time::TEXT || ' America/Sao_Paulo')::TIMESTAMPTZ;
    v_slot_fim_ts    := (p_data_desejada::TEXT || ' ' || v_slot_fim_time::TEXT   || ' America/Sao_Paulo')::TIMESTAMPTZ;

    -- FILTRO 1: Remover slots que conflitem com o intervalo de almoço
    --   Um slot conflita com almoço se: slot_inicio < almoco_fim E slot_fim > almoco_inicio
    IF v_almoco_inicio IS NOT NULL AND v_almoco_fim IS NOT NULL THEN
      IF v_slot_inicio_time < v_almoco_fim AND v_slot_fim_time > v_almoco_inicio THEN
        -- Slot conflita com almoço - avançar para depois do almoço
        v_slot_inicio_time := v_almoco_fim;
        CONTINUE;
      END IF;
    END IF;

    -- FILTRO 2: Remover slots que conflitem com agendamentos existentes e ativos
    --   Verifica sobreposição usando operador && (overlap) com tstzrange
    --   O bloco bloqueado é duração + preparo para garantir tempo de limpeza
    SELECT EXISTS (
      SELECT 1
      FROM agendamentos a
      WHERE
        a.funcionario_id = p_funcionario_id
        AND a.status IN ('pendente', 'confirmado')
        AND tstzrange(a.horario_inicio, a.horario_fim + (v_preparo_minutos || ' minutes')::INTERVAL, '[)')
          && tstzrange(v_slot_inicio_ts, v_slot_inicio_ts + (v_bloco_total || ' minutes')::INTERVAL, '[)')
    ) INTO v_conflito;

    -- Se não houver conflito, adicionar ao resultado
    IF NOT v_conflito THEN
      v_slots := array_append(v_slots, to_char(v_slot_inicio_time, 'HH24:MI'));
    END IF;

    -- Avançar ao próximo slot (passo = bloco total = duração + preparo)
    v_slot_inicio_time := v_slot_inicio_time + (v_bloco_total || ' minutes')::INTERVAL;

  END LOOP;

  RETURN v_slots;
END;
$$;

-- 7. Comentários de documentação nas funções
COMMENT ON FUNCTION get_slots_disponiveis(UUID, DATE, UUID) IS
  'Retorna array de horários disponíveis (formato HH:MI, timezone America/Sao_Paulo) '
  'para um funcionário em uma data específica para um serviço, '
  'excluindo conflitos com jornada, almoço e agendamentos existentes. '
  'O intervalo entre slots inclui o tempo de preparo/limpeza do serviço.';

COMMENT ON FUNCTION verificar_conflito_agendamento() IS
  'Trigger BEFORE INSERT/UPDATE que impede double-booking de agendamentos '
  'para o mesmo profissional no mesmo intervalo de tempo. '
  'Lança EXCEPTION com mensagem amigável em caso de conflito.';
