-- Adicionar coluna foto_url na tabela funcionarios
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS foto_url VARCHAR(1000);
