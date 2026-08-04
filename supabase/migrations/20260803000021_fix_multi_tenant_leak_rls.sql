-- =========================================================================
-- MIGRATION 021: Fix de segurança RLS multi-tenant (duplicidade da _007)
-- Remove as policies herdadas da _007 que causavam vazamento de dados
-- por conta do fallback automático ao tenant mockado local.
-- =========================================================================

DROP POLICY IF EXISTS "Isolamento multi-tenant de funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Isolamento multi-tenant de servicos" ON servicos;
DROP POLICY IF EXISTS "Isolamento multi-tenant de agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Isolamento multi-tenant de jornadas" ON jornadas_trabalho;
DROP POLICY IF EXISTS "Isolamento multi-tenant de funcionario_servicos" ON funcionario_servicos;
