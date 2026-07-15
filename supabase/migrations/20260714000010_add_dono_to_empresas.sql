-- Adicionar vínculo com o usuário do Supabase Auth na tabela de empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS dono_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Habilitar RLS em todas as tabelas (caso ainda não estejam ativas)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornadas_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionario_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para a tabela EMPRESAS
DROP POLICY IF EXISTS "Leitura publica de empresas" ON empresas;
CREATE POLICY "Leitura publica de empresas" ON empresas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dono gerencia sua propria empresa" ON empresas;
CREATE POLICY "Dono gerencia sua propria empresa" ON empresas
  FOR ALL TO authenticated
  USING (dono_id = auth.uid())
  WITH CHECK (dono_id = auth.uid());

-- 2. Políticas para a tabela SERVICOS
DROP POLICY IF EXISTS "Leitura publica de servicos" ON servicos;
CREATE POLICY "Leitura publica de servicos" ON servicos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dono gerencia servicos da empresa" ON servicos;
CREATE POLICY "Dono gerencia servicos da empresa" ON servicos
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT id FROM empresas WHERE dono_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT id FROM empresas WHERE dono_id = auth.uid()));

-- 3. Políticas para a tabela FUNCIONARIOS
DROP POLICY IF EXISTS "Leitura publica de funcionarios" ON funcionarios;
CREATE POLICY "Leitura publica de funcionarios" ON funcionarios
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dono gerencia funcionarios da empresa" ON funcionarios;
CREATE POLICY "Dono gerencia funcionarios da empresa" ON funcionarios
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT id FROM empresas WHERE dono_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT id FROM empresas WHERE dono_id = auth.uid()));

-- 4. Políticas para a tabela JORNADAS_TRABALHO
DROP POLICY IF EXISTS "Leitura publica de jornadas" ON jornadas_trabalho;
CREATE POLICY "Leitura publica de jornadas" ON jornadas_trabalho
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dono gerencia jornadas da empresa" ON jornadas_trabalho;
CREATE POLICY "Dono gerencia jornadas da empresa" ON jornadas_trabalho
  FOR ALL TO authenticated
  USING (funcionario_id IN (
    SELECT f.id FROM funcionarios f 
    JOIN empresas e ON f.tenant_id = e.id 
    WHERE e.dono_id = auth.uid()
  ))
  WITH CHECK (funcionario_id IN (
    SELECT f.id FROM funcionarios f 
    JOIN empresas e ON f.tenant_id = e.id 
    WHERE e.dono_id = auth.uid()
  ));

-- 5. Políticas para a tabela FUNCIONARIO_SERVICOS (tabela pivot)
DROP POLICY IF EXISTS "Leitura publica de vinculo servicos" ON funcionario_servicos;
CREATE POLICY "Leitura publica de vinculo servicos" ON funcionario_servicos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dono gerencia vinculo servicos da empresa" ON funcionario_servicos;
CREATE POLICY "Dono gerencia vinculo servicos da empresa" ON funcionario_servicos
  FOR ALL TO authenticated
  USING (funcionario_id IN (
    SELECT f.id FROM funcionarios f 
    JOIN empresas e ON f.tenant_id = e.id 
    WHERE e.dono_id = auth.uid()
  ))
  WITH CHECK (funcionario_id IN (
    SELECT f.id FROM funcionarios f 
    JOIN empresas e ON f.tenant_id = e.id 
    WHERE e.dono_id = auth.uid()
  ));

-- 6. Políticas para a tabela AGENDAMENTOS
DROP POLICY IF EXISTS "Leitura publica de agendamentos" ON agendamentos;
CREATE POLICY "Leitura publica de agendamentos" ON agendamentos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escrita publica para novos agendamentos" ON agendamentos;
CREATE POLICY "Escrita publica para novos agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Dono gerencia agendamentos da empresa" ON agendamentos;
CREATE POLICY "Dono gerencia agendamentos da empresa" ON agendamentos
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT id FROM empresas WHERE dono_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT id FROM empresas WHERE dono_id = auth.uid()));
