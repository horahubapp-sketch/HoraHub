-- Adicionar colunas de cobrança na tabela de empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS plano_nome TEXT DEFAULT 'Bronze';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS valor_mensalidade NUMERIC(10, 2) DEFAULT 99.90;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS saldo_devedor NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS data_renovacao TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days');

-- Criar política de super administrador para permitir gerenciar qualquer empresa
CREATE POLICY "Superadmin gerencia todas as empresas" ON empresas
FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@horahub.com');
