-- =========================================================================
-- FASE 1: IMPLEMENTAÇÃO DO ROW LEVEL SECURITY (RLS) MULTI-TENANT & PRIVILÉGIOS
-- =========================================================================

-- 1. Inserir o tenant (empresa) mockado local para satisfazer chaves estrangeiras
INSERT INTO empresas (id, nome, email, plano_status)
VALUES ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Barbearia HoraHub Local', 'contato@horahub.local', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- 2. Conceder privilégios explícitos de acesso para as roles do Supabase/PostgREST
-- Isso previne o erro de 'permission denied for table' a nível de privilégios do PostgreSQL.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Garantir que o RLS está reativado em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornadas_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionario_servicos ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Acesso proprio tenant empresa" ON empresas;
DROP POLICY IF EXISTS "Isolamento multi-tenant de funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Isolamento multi-tenant de jornadas" ON jornadas_trabalho;
DROP POLICY IF EXISTS "Isolamento multi-tenant de servicos" ON servicos;
DROP POLICY IF EXISTS "Isolamento multi-tenant de agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Isolamento multi-tenant de funcionario_servicos" ON funcionario_servicos;

-- 5. Criar novas políticas baseadas no JWT (Produção) com fallback para o tenant mockado (Local/Desenvolvimento)
-- O padrão extrai o tenant_id dos metadados do JWT do usuário logado (Supabase Auth).
-- Caso o JWT esteja vazio (requisições anônimas locais no localhost), utiliza o MOCK_TENANT_ID.

-- Políticas para 'empresas'
CREATE POLICY "Acesso proprio tenant empresa" ON empresas
  FOR ALL
  TO anon, authenticated, service_role
  USING (id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid))
  WITH CHECK (id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid));

-- Políticas para 'funcionarios'
CREATE POLICY "Isolamento multi-tenant de funcionarios" ON funcionarios
  FOR ALL
  TO anon, authenticated, service_role
  USING (tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid))
  WITH CHECK (tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid));

-- Políticas para 'servicos'
CREATE POLICY "Isolamento multi-tenant de servicos" ON servicos
  FOR ALL
  TO anon, authenticated, service_role
  USING (tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid))
  WITH CHECK (tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid));

-- Políticas para 'agendamentos'
CREATE POLICY "Isolamento multi-tenant de agendamentos" ON agendamentos
  FOR ALL
  TO anon, authenticated, service_role
  USING (tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid))
  WITH CHECK (tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid));

-- Políticas para 'jornadas_trabalho' (Vinculadas a funcionarios)
CREATE POLICY "Isolamento multi-tenant de jornadas" ON jornadas_trabalho
  FOR ALL
  TO anon, authenticated, service_role
  USING (EXISTS (
    SELECT 1 FROM funcionarios f
    WHERE f.id = funcionario_id
      AND f.tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM funcionarios f
    WHERE f.id = funcionario_id
      AND f.tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid)
  ));

-- Políticas para 'funcionario_servicos' (Vinculadas a funcionarios)
CREATE POLICY "Isolamento multi-tenant de funcionario_servicos" ON funcionario_servicos
  FOR ALL
  TO anon, authenticated, service_role
  USING (EXISTS (
    SELECT 1 FROM funcionarios f
    WHERE f.id = funcionario_id
      AND f.tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM funcionarios f
    WHERE f.id = funcionario_id
      AND f.tenant_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid, 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid)
  ));
