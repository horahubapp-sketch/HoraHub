-- ============================================================
-- MIGRAÇÃO: Frente C - Tabela de Relacionamento Funcionário x Serviço (N:N)
-- HoraHub | Data: 2026-07-14
-- ============================================================

CREATE TABLE IF NOT EXISTS funcionario_servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Garante que não haverá duplicidade de vínculo
    CONSTRAINT uq_funcionario_servico UNIQUE (funcionario_id, servico_id)
);

-- Índices para otimizar buscas e joins
CREATE INDEX IF NOT EXISTS idx_func_serv_tenant_id ON funcionario_servicos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_func_serv_funcionario ON funcionario_servicos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_func_serv_servico ON funcionario_servicos(servico_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE funcionario_servicos ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE funcionario_servicos IS 'Tabela pivot que mapeia quais serviços cada profissional está apto a realizar.';
