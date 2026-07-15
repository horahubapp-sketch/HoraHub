-- Seed de Dados Iniciais para Desenvolvimento Local no HoraHub
-- Tenant Mockado
INSERT INTO empresas (id, nome, email, plano_status, slug)
VALUES ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Barbearia HoraHub Local', 'contato@horahub.local', 'ativo', 'barbearia-local')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug;

-- Funcionários (IDs em formato UUID válidos - 'f' é hexadecimal válido)
INSERT INTO funcionarios (id, tenant_id, nome, especialidade, comissao_percentual, foto_url)
VALUES 
  ('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Bruno Silva', 'Cabelo & Barba Sênior', 50.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150'),
  ('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Lucas Nogueira', 'Corte Moderno & Tintura', 40.00, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'),
  ('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb3', 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Ana Costa', 'Barba Clássica & Visagismo', 45.00, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150'),
  ('f1a3bc08-cb86-4e55-926c-d2c6c06a3eb4', 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Mateus Santos', 'Cortes Clássicos & Infantil', 50.00, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150&h=150')
ON CONFLICT (id) DO NOTHING;

-- Serviços (Substituindo a primeira letra 's' por 'c', que é hexadecimal válido)
INSERT INTO servicos (id, tenant_id, nome, duracao_minutos, preco)
VALUES 
  ('c1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Corte Degradê', 45, 60.00),
  ('c2a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Barboterapia', 30, 45.00),
  ('c3a3bc08-cb86-4e55-926c-d2c6c06a3eb3', 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'Corte Degradê + Barba', 60, 95.00)
ON CONFLICT (id) DO NOTHING;

-- Relacionamentos de Serviços por Funcionário (N:N)
INSERT INTO funcionario_servicos (tenant_id, funcionario_id, servico_id)
VALUES 
  -- Bruno Silva faz todos
  ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'c1a3bc08-cb86-4e55-926c-d2c6c06a3eb1'),
  ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'c2a3bc08-cb86-4e55-926c-d2c6c06a3eb2'),
  ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', 'c3a3bc08-cb86-4e55-926c-d2c6c06a3eb3'),
  -- Lucas Nogueira faz Corte Degradê
  ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb2', 'c1a3bc08-cb86-4e55-926c-d2c6c06a3eb1'),
  -- Ana Costa faz Barboterapia
  ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb3', 'c2a3bc08-cb86-4e55-926c-d2c6c06a3eb2'),
  -- Mateus Santos faz Corte Degradê
  ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7', 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb4', 'c1a3bc08-cb86-4e55-926c-d2c6c06a3eb1')
ON CONFLICT (funcionario_id, servico_id) DO NOTHING;

-- Jornadas de Trabalho (Segunda a Sexta para todos, 09h às 18h)
INSERT INTO jornadas_trabalho (funcionario_id, dia_semana, hora_inicio, hora_fim, almoco_inicio, almoco_fim)
SELECT f.id, d, '09:00:00', '18:00:00', '12:00:00', '13:00:00'
FROM funcionarios f, generate_series(1, 5) d
ON CONFLICT DO NOTHING;
