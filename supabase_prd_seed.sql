-- ============================================================
-- SCRIPT DE LIMPEZA E SEEDING DE PRODUÇÃO (SUPABASE CLOUD PRD)
-- Encaixe / HoraHub - Versão de Deploy
-- ============================================================
-- ATENÇÃO: Execute este script no SQL Editor do seu Dashboard Supabase Cloud PRD.
-- Ele irá zerar os dados de teste em PRD e recriar a Empresa Master do SuperAdmin.
-- ============================================================

-- 1. LIMPEZA CONTROLADA DAS TABELAS LEGADAS DE PRODUÇÃO
TRUNCATE TABLE agendamentos CASCADE;
TRUNCATE TABLE funcionario_servicos CASCADE;
TRUNCATE TABLE jornadas_trabalho CASCADE;
TRUNCATE TABLE funcionarios CASCADE;
TRUNCATE TABLE servicos CASCADE;
TRUNCATE TABLE empresas CASCADE;

-- (Opcional) Limpar contas registradas no Supabase Auth caso queira zerar emails antigos:
-- TRUNCATE auth.users CASCADE;

-- 2. CRIAÇÃO DA EMPRESA PADRÃO DO SUPERADMIN (EMPRESA TESTES ENCAIXE)
INSERT INTO empresas (
  id,
  nome,
  email,
  slug,
  cpf_cnpj,
  cor_primaria,
  cor_secundaria,
  logo_url,
  plano_nome,
  plano_status,
  valor_mensalidade,
  saldo_devedor,
  data_renovacao,
  created_at
) VALUES (
  'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'Empresa Testes Encaixe',
  'horahubapp@gmail.com',
  'encaixe-teste',
  '00.000.000/0001-00',
  '#00E676',
  '#121214',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
  'Bronze',
  'ativo',
  99.90,
  0.00,
  '2026-08-15 00:00:00+00',
  NOW()
);

-- 3. CRIAÇÃO DE SERVIÇOS INICIAIS DA EMPRESA MASTER
INSERT INTO servicos (
  id,
  tenant_id,
  nome,
  duracao_minutos,
  preco,
  created_at
) VALUES 
(
  'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb1',
  'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'Corte de Cabelo Masculino',
  45,
  50.00,
  NOW()
),
(
  'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb2',
  'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'Barba Completa com Toalha Quente',
  30,
  35.00,
  NOW()
),
(
  'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb3',
  'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'Combo Corte + Barba Premium',
  60,
  75.00,
  NOW()
);

-- 4. CRIAÇÃO DE PROFISSIONAIS INICIAIS DA EMPRESA MASTER
INSERT INTO funcionarios (
  id,
  tenant_id,
  nome,
  especialidade,
  foto_url,
  created_at
) VALUES 
(
  'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1',
  'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'Carlos Barbeiro',
  'Master Barber',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  NOW()
),
(
  'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2',
  'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'Lucas Stylist',
  'Especialista em Visagismo',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  NOW()
);

-- 5. VINCULAÇÃO DE PROFISSIONAIS AOS SERVIÇOS (TABELA PIVOT COM TENANT_ID)
INSERT INTO funcionario_servicos (tenant_id, funcionario_id, servico_id) VALUES
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb1'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb2'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb3'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb1'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb3');

-- 6. JORNADAS DE TRABALHO PADRÃO (SEGUNDA A SÁBADO, 08:00 ÀS 18:00)
INSERT INTO jornadas_trabalho (funcionario_id, dia_semana, hora_inicio, hora_fim, almoco_inicio, almoco_fim) VALUES
-- Carlos (Segunda a Sábado = 1 a 6)
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 1, '08:00', '18:00', '12:00', '13:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 2, '08:00', '18:00', '12:00', '13:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 3, '08:00', '18:00', '12:00', '13:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 4, '08:00', '18:00', '12:00', '13:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 5, '08:00', '18:00', '12:00', '13:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 6, '08:00', '18:00', '12:00', '13:00'),
-- Lucas (Segunda a Sábado = 1 a 6)
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 1, '09:00', '19:00', '13:00', '14:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 2, '09:00', '19:00', '13:00', '14:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 3, '09:00', '19:00', '13:00', '14:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 4, '09:00', '19:00', '13:00', '14:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 5, '09:00', '19:00', '13:00', '14:00'),
('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 6, '09:00', '19:00', '13:00', '14:00');
