-- Mudar o status padrão da coluna plano_status para 'pendente' na tabela empresas
ALTER TABLE empresas ALTER COLUMN plano_status SET DEFAULT 'pendente';

-- Garantir que a empresa de testes local seedada continue ativa por padrão para não quebrar testes locais do desenvolvedor
UPDATE empresas
SET plano_status = 'ativo'
WHERE id = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7';
