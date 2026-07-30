-- Função RPC para permitir que o SuperAdmin redefina a senha de um usuário
CREATE OR REPLACE FUNCTION reset_user_password(target_dono_id UUID, new_password TEXT DEFAULT '@Mudar.123')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Permite apenas solicitações do Super Admin
  IF auth.jwt() ->> 'email' NOT IN ('admin@encaixe.com', 'admin@horahub.com') THEN
    RAISE EXCEPTION 'Acesso negado: Apenas o Super Admin pode redefinir senhas de usuários.';
  END IF;

  IF target_dono_id IS NULL THEN
    RAISE EXCEPTION 'ID do usuário não fornecido.';
  END IF;

  -- Atualiza a senha no schema auth do Supabase usando pgcrypto (bcrypt)
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_dono_id;

  RETURN FOUND;
END;
$$;
