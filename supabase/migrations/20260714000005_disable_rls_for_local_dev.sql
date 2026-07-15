-- Desabilitar RLS temporariamente no banco de desenvolvimento local
-- Isso permite o uso livre de inserts e selects no Docker sem erros de permissão negada
-- Na Fase 1 (Segurança), implementaremos as regras RLS e policies multi-tenant corretas.

ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE jornadas_trabalho DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;
