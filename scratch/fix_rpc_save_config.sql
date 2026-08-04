-- Recria save_empresa_config sem a coluna profissional_indicado_padrao_id
-- (coluna não existe na tabela empresas em PRD)
DROP FUNCTION IF EXISTS save_empresa_config(uuid, jsonb);
CREATE OR REPLACE FUNCTION save_empresa_config(
  p_empresa_id UUID,
  p_payload JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT;
  v_caller_uid UUID;
  v_empresa RECORD;
BEGIN
  v_caller_email := auth.jwt() ->> 'email';
  v_caller_uid := auth.uid();

  SELECT id, email, dono_id INTO v_empresa
  FROM empresas WHERE id = p_empresa_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Empresa não encontrada: ' || p_empresa_id);
  END IF;

  IF v_empresa.dono_id IS DISTINCT FROM v_caller_uid
     AND v_empresa.email IS DISTINCT FROM v_caller_email
     AND v_caller_email NOT IN ('admin@horahub.com', 'admin@encaixe.com', 'horahubapp@gmail.com') THEN
    RETURN json_build_object('success', false, 'error',
      'Sem permissão. uid=' || COALESCE(v_caller_uid::text, 'null') ||
      ' dono_id=' || COALESCE(v_empresa.dono_id::text, 'null') ||
      ' email=' || COALESCE(v_caller_email, 'null'));
  END IF;

  UPDATE empresas SET
    nome           = COALESCE(p_payload->>'nome', nome),
    email          = COALESCE(p_payload->>'email', email),
    slug           = COALESCE(p_payload->>'slug', slug),
    cpf_cnpj       = CASE WHEN p_payload ? 'cpf_cnpj'       THEN p_payload->>'cpf_cnpj'       ELSE cpf_cnpj       END,
    cor_primaria   = COALESCE(p_payload->>'cor_primaria',   cor_primaria),
    cor_secundaria = COALESCE(p_payload->>'cor_secundaria', cor_secundaria),
    logo_url       = CASE WHEN p_payload ? 'logo_url'       THEN p_payload->>'logo_url'        ELSE logo_url       END,
    regra_sem_preferencia = COALESCE(p_payload->>'regra_sem_preferencia', regra_sem_preferencia),
    plano_status   = COALESCE(p_payload->>'plano_status',  plano_status),
    plano_nome     = COALESCE(p_payload->>'plano_nome',    plano_nome),
    valor_mensalidade = CASE WHEN p_payload ? 'valor_mensalidade' THEN (p_payload->>'valor_mensalidade')::NUMERIC ELSE valor_mensalidade END,
    saldo_devedor     = CASE WHEN p_payload ? 'saldo_devedor'     THEN (p_payload->>'saldo_devedor')::NUMERIC     ELSE saldo_devedor     END,
    data_renovacao    = CASE WHEN p_payload ? 'data_renovacao'    THEN (p_payload->>'data_renovacao')::TIMESTAMPTZ ELSE data_renovacao   END
  WHERE id = p_empresa_id;

  RETURN (
    SELECT json_build_object('success', true, 'data', row_to_json(e))
    FROM empresas e WHERE e.id = p_empresa_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION save_empresa_config(UUID, JSONB) TO authenticated;
