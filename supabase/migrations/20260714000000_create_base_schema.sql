-- 1. Tabela de Empresas (Tenants)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    plano_status VARCHAR(50) DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(255),
    comissao_percentual DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para otimização multi-tenant
CREATE INDEX IF NOT EXISTS idx_funcionarios_tenant_id ON funcionarios(tenant_id);

-- 3. Tabela de Jornadas de Trabalho
CREATE TABLE IF NOT EXISTS jornadas_trabalho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0: Domingo, 1: Segunda... 6: Sábado
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    almoco_inicio TIME,
    almoco_fim TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_jornada_horas CHECK (hora_inicio < hora_fim),
    CONSTRAINT chk_almoco_horas CHECK (almoco_inicio < almoco_fim)
);

CREATE INDEX IF NOT EXISTS idx_jornadas_funcionario_id ON jornadas_trabalho(funcionario_id);

-- 4. Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    duracao_minutos INT NOT NULL CHECK (duracao_minutos > 0),
    preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para otimização multi-tenant
CREATE INDEX IF NOT EXISTS idx_servicos_tenant_id ON servicos(tenant_id);

-- 5. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    cliente_name VARCHAR(255) NOT NULL,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    horario_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    horario_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    custo_operacional DECIMAL(10, 2) DEFAULT 0.00 CHECK (custo_operacional >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_agendamento_horas CHECK (horario_inicio < horario_fim)
);

-- Índices para otimização multi-tenant e buscas de agenda do dia
CREATE INDEX IF NOT EXISTS idx_agendamentos_tenant_id ON agendamentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_funcionario_data ON agendamentos(funcionario_id, horario_inicio);

-- 6. Habilitar RLS (Row Level Security) para isolamento multi-tenant básico
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornadas_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
