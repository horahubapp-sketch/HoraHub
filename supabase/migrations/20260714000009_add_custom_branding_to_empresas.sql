-- Adicionar campos de branding e identidade visual corporativa na tabela de empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cor_primaria VARCHAR(7) DEFAULT '#00E676';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cor_secundaria VARCHAR(7) DEFAULT '#121214';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Garantir que a empresa de testes local tenha as cores iniciais padrão preenchidas
UPDATE empresas
SET cor_primaria = '#00E676', cor_secundaria = '#121214'
WHERE id = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7' AND (cor_primaria IS NULL OR cor_primaria = '');
