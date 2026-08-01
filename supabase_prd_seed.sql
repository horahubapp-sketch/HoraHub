-- ============================================================
-- SCRIPT DE LIMPEZA E SEEDING DE PRODUÇÃO (SUPABASE CLOUD PRD)
-- Encaixe / HoraHub - Versão de Deploy
-- ============================================================
-- ATENÇÃO: Execute este script no SQL Editor do seu Dashboard Supabase Cloud PRD.
-- Ele irá zerar os dados de teste em PRD e recriar a Empresa Master e o Usuário do SuperAdmin.
-- ============================================================

-- 1. LIMPEZA CONTROLADA DAS TABELAS LEGADAS DE PRODUÇÃO
TRUNCATE TABLE agendamentos CASCADE;
TRUNCATE TABLE funcionario_servicos CASCADE;
TRUNCATE TABLE jornadas_trabalho CASCADE;
TRUNCATE TABLE funcionarios CASCADE;
TRUNCATE TABLE servicos CASCADE;
TRUNCATE TABLE empresas CASCADE;

-- 2. LIMPEZA E RE-CRIAÇÃO LIMPA DA CONTA DO SUPERADMIN NO SUPABASE AUTH
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove qualquer usuário legado conflitante em auth.users por ID ou Email
DELETE FROM auth.users WHERE id = 'a1a3bc08-cb86-4e55-926c-d2c6c06a3eb7' OR email = 'admin@horahub.com';

-- Insere a conta oficial do SuperAdmin (admin@horahub.com / Hor@.hub.123)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'authenticated',
  'authenticated',
  'admin@horahub.com',
  crypt('Hor@.hub.123', gen_salt('bf', 10)),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nome_dono":"Super Admin"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 3. CRIAÇÃO DA EMPRESA PADRÃO DO SUPERADMIN (EMPRESA TESTES ENCAIXE)
INSERT INTO empresas (
  id,
  dono_id,
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
  'a1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
  'Empresa Testes Encaixe',
  'admin@horahub.com',
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

-- 4. CRIAÇÃO DE SERVIÇOS INICIAIS DA EMPRESA MASTER
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

-- 5. CRIAÇÃO DE PROFISSIONAIS INICIAIS DA EMPRESA MASTER
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

-- 6. VINCULAÇÃO DE PROFISSIONAIS AOS SERVIÇOS (TABELA PIVOT COM TENANT_ID)
INSERT INTO funcionario_servicos (tenant_id, funcionario_id, servico_id) VALUES
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb1'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb2'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb3'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb1'),
('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 'b1a3bc08-cb86-4e55-926c-d2c6c06a3eb3');

-- 7. JORNADAS DE TRABALHO PADRÃO (SEGUNDA A SÁBADO, 08:00 ÀS 18:00)
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
