-- ============================================================
-- MIGRATION PRD: Remoção do campo obsoleto intervalo_preparo_minutos
-- Data: 2026-07-28
-- Descrição: Remove exclusivamente a coluna obsoleta sem afetação
-- de IDs, nomes, preços ou histórico de agendamentos.
-- ============================================================

ALTER TABLE IF EXISTS public.servicos 
DROP COLUMN IF EXISTS intervalo_preparo_minutos;
