-- =========================================================================
-- MIGRATION 018: Recria a RPC reset_user_password com permissões corretas
-- O problema anterior: função criada sem GRANT EXECUTE e sem owner correto
-- para acessar auth.users no Supabase Cloud.
-- =========================================================================

-- 1. Garantir extensão pgcrypto disponível (necessária para crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Remover a versão antiga da função
DROP FUNCTION IF EXISTS reset_user_password(uuid, text);

-- 3. Recriar com permissões corretas
CREATE OR REPLACE FUNCTION reset_user_password(
  target_dono_id UUID,
  new_password TEXT DEFAULT '@Mudar.123'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_email TEXT;
  rows_affected INTEGER;
BEGIN
  -- Extrair email do chamador
  caller_email := auth.jwt() ->> 'email';

  -- Verificar se é SuperAdmin
  IF caller_email NOT IN ('admin@encaixe.com', 'admin@horahub.com') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Acesso negado: apenas SuperAdmin pode redefinir senhas.'
    );
  END IF;

  -- Validar parâmetro
  IF target_dono_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ID do usuário não fornecido (dono_id é NULL).'
    );
  END IF;

  -- Atualizar a senha no schema auth
  UPDATE auth.users
  SET
    encrypted_password = crypt(new_password, gen_salt('bf', 10)),
    updated_at = now()
  WHERE id = target_dono_id;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  IF rows_affected = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado com o ID fornecido: ' || target_dono_id::text
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Senha redefinida com sucesso.',
    'rows_affected', rows_affected
  );
END;
$$;

-- 4. Garantir permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO authenticated;

-- 5. Helper: buscar dono_id de uma empresa pelo email (SuperAdmin usa isso
--    quando a empresa não tem dono_id preenchido)
CREATE OR REPLACE FUNCTION get_dono_id_by_empresa_email(empresa_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result_id UUID;
  caller_email TEXT;
BEGIN
  caller_email := auth.jwt() ->> 'email';

  IF caller_email NOT IN ('admin@encaixe.com', 'admin@horahub.com') THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  SELECT id INTO result_id
  FROM auth.users
  WHERE email = empresa_email
  LIMIT 1;

  RETURN result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dono_id_by_empresa_email(TEXT) TO authenticated;
