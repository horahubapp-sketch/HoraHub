-- =========================================================================
-- MIGRATION 017: Corrige RLS da tabela empresas para usar dono_id = auth.uid()
-- A policy anterior usava user_metadata.tenant_id que nunca é populado
-- automaticamente no JWT do Supabase Auth → UPDATE silenciosamente falhava.
-- =========================================================================

-- 1. Remover as policies antigas incorretas
DROP POLICY IF EXISTS "Acesso proprio tenant empresa" ON empresas;

-- 2. Policy correta: empresa acessível pelo dono (dono_id = auth.uid())
--    OU pelo SuperAdmin (verificado pelo email no JWT)
CREATE POLICY "empresa_dono_ou_superadmin" ON empresas
  FOR ALL
  TO authenticated
  USING (
    dono_id = auth.uid()
    OR auth.jwt() ->> 'email' IN ('admin@horahub.com', 'admin@encaixe.com')
  )
  WITH CHECK (
    dono_id = auth.uid()
    OR auth.jwt() ->> 'email' IN ('admin@horahub.com', 'admin@encaixe.com')
  );

-- 3. Policy de leitura pública para a página de agendamento (/agendar/:slug)
--    Permite que usuários anônimos (clientes) leiam dados da empresa pelo slug
DROP POLICY IF EXISTS "leitura_publica_empresa" ON empresas;
CREATE POLICY "leitura_publica_empresa" ON empresas
  FOR SELECT
  TO anon
  USING (true);

-- 4. Policy de inserção pública (necessária para o cadastro de novas empresas)
DROP POLICY IF EXISTS "insercao_publica_empresa" ON empresas;
CREATE POLICY "insercao_publica_empresa" ON empresas
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Garantir que o bucket 'avatars' existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Garantir policies do storage para o bucket avatars
DROP POLICY IF EXISTS "Permitir leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir inserção pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON storage.objects;

CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "avatars_update_auth" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_delete_auth" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');
