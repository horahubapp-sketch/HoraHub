-- =========================================================================
-- CORREÇÃO URGENTE: Fix completo das policies RLS conflitantes
-- Execute este SQL no Supabase Dashboard → SQL Editor (PRD)
-- Problema: migration _010 e _017 criaram policies conflitantes na tabela empresas
-- Solução: limpar TODAS as policies de empresas e recriar de forma correta e única
-- =========================================================================

-- ====== PASSO 1: REMOVER TODAS AS POLICIES EXISTENTES DA TABELA EMPRESAS ======
-- (garante que não há conflito)

DROP POLICY IF EXISTS "Acesso proprio tenant empresa" ON empresas;
DROP POLICY IF EXISTS "empresa_dono_ou_superadmin" ON empresas;
DROP POLICY IF EXISTS "Dono gerencia sua propria empresa" ON empresas;
DROP POLICY IF EXISTS "leitura_publica_empresa" ON empresas;
DROP POLICY IF EXISTS "insercao_publica_empresa" ON empresas;
DROP POLICY IF EXISTS "Leitura publica de empresas" ON empresas;

-- ====== PASSO 2: RECRIAR POLICIES CORRETAS E ÚNICAS ======

-- Policy 1: Leitura pública (clientes na página de agendamento, anon)
CREATE POLICY "empresas_select_publico" ON empresas
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: INSERT público (cadastro de nova empresa via formulário)
CREATE POLICY "empresas_insert_publico" ON empresas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 3: UPDATE/DELETE - dono da empresa OU SuperAdmin
-- Cobre 3 casos:
--   a) dono_id = auth.uid() → empresa criada normalmente com dono vinculado
--   b) email = auth.jwt()->>'email' → fallback para empresas sem dono_id preenchido
--   c) email do SuperAdmin → admin pode atualizar qualquer empresa
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

-- Policy 4: DELETE - somente dono ou admin
CREATE POLICY "empresas_delete_dono_ou_admin" ON empresas
  FOR DELETE
  TO authenticated
  USING (
    dono_id = auth.uid()
    OR email = (auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@horahub.com', 'admin@encaixe.com', 'horahubapp@gmail.com')
  );

-- ====== PASSO 3: VERIFICAR RESULTADO ======
-- Esta query deve retornar as 4 policies criadas acima:
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'empresas'
ORDER BY policyname;

-- ====== PASSO 4: VERIFICAR SE Dono_ID ESTÁ PREENCHIDO NAS EMPRESAS ======
-- Esta query mostra quais empresas têm dono_id NULL:
SELECT id, nome, email, slug, dono_id,
  CASE WHEN dono_id IS NULL THEN '⚠️ SEM DONO_ID' ELSE '✅ TEM DONO_ID' END as status_dono
FROM empresas
ORDER BY nome;
