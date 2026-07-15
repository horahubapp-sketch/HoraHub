-- Adicionar coluna slug única na tabela empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Atualizar o slug da empresa padrão de testes local
UPDATE empresas 
SET slug = 'barbearia-local'
WHERE id = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7' AND (slug IS NULL OR slug = '');
