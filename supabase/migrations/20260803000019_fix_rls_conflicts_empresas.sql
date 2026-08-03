-- =========================================================================
-- MIGRATION 019: Fix definitivo de policies RLS conflitantes na tabela empresas
-- Problema: migrations _007, _010 e _017 criaram policies sobrepostas e conflitantes,
-- bloqueando UPDATE de logo_url e outras configs mesmo com dono_id preenchido.
-- Solução: limpar tudo e recriar 4 policies claras e sem sobreposição.
-- =========================================================================

-- Remover TODAS as policies antigas conflitantes
DROP POLICY IF EXISTS "Acesso proprio tenant empresa" ON empresas;
DROP POLICY IF EXISTS "empresa_dono_ou_superadmin" ON empresas;
DROP POLICY IF EXISTS "Dono gerencia sua propria empresa" ON empresas;
DROP POLICY IF EXISTS "leitura_publica_empresa" ON empresas;
DROP POLICY IF EXISTS "insercao_publica_empresa" ON empresas;
DROP POLICY IF EXISTS "Leitura publica de empresas" ON empresas;

-- Policy 1: SELECT público (clientes e donos leem dados da empresa)
CREATE POLICY "empresas_select_publico" ON empresas
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: INSERT público (cadastro de nova empresa)
CREATE POLICY "empresas_insert_publico" ON empresas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 3: UPDATE — dono (por dono_id ou email) OU SuperAdmin
CREATE POLICY "empresas_update_dono_ou_admin" ON empresas
  FOR UPDATE
  TO authenticated
  USING (
    dono_id = auth.uid()
    OR email = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@horahub.com', 'admin@encaixe.com', 'horahubapp@gmail.com')
  )
  WITH CHECK (
    dono_id = auth.uid()
    OR email = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@horahub.com', 'admin@encaixe.com', 'horahubapp@gmail.com')
  );

-- Policy 4: DELETE — dono ou SuperAdmin
CREATE POLICY "empresas_delete_dono_ou_admin" ON empresas
  FOR DELETE
  TO authenticated
  USING (
    dono_id = auth.uid()
    OR email = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@horahub.com', 'admin@encaixe.com', 'horahubapp@gmail.com')
  );
