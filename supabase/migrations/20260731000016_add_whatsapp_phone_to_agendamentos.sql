-- ============================================================
-- MIGRAÇÃO: Suporte a Telefone / WhatsApp para Notificações (n8n)
-- Encaixe | Data: 2026-07-31
-- ============================================================

-- Adicionar coluna cliente_telefone na tabela agendamentos
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS cliente_telefone VARCHAR(20);
