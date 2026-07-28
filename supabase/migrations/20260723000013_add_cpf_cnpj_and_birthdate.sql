-- ============================================================
-- MIGRAÇÃO: Suporte a CPF/CNPJ, Data de Nascimento e Profissional Indicado
-- Encaixe | Data: 2026-07-23
-- ============================================================

-- 1. Colunas na tabela de empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS profissional_indicado_padrao_id UUID REFERENCES funcionarios(id) ON DELETE SET NULL;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS regra_sem_preferencia TEXT DEFAULT 'algoritmo';

-- 2. Colunas na tabela de agendamentos para cadastro estendido de clientes
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS cliente_cpf_cnpj TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS cliente_data_nascimento DATE;
