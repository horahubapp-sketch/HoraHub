-- =========================================================================
-- CORREÇÃO DE SEGURANÇA: Limpeza de RLS e Vazamento de Dados Multi-Tenant
-- Execute este SQL no Supabase Dashboard → SQL Editor (PRD)
--
-- Por que o "vazamento" aconteceu (funcionários de outra empresa aparecendo):
-- As migrations antigas _007 e _010 criaram políticas duplicadas com nomes diferentes.
-- A política da _007 tinha um fallback automático que salvava e lia tudo do
-- Tenant ID mockado ('e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7').
-- Por isso, os profissionais cadastrados pela "Barbearia João Cortes" foram gravados
-- com o ID da "Empresa Testes Encaixe".
-- =========================================================================

-- ====== PASSO 1: REMOVER DEFINITIVAMENTE TODAS AS POLICIES DUPLICADAS DA MIGRATION _007 ======

DROP POLICY IF EXISTS "Isolamento multi-tenant de funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Isolamento multi-tenant de servicos" ON servicos;
DROP POLICY IF EXISTS "Isolamento multi-tenant de agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Isolamento multi-tenant de jornadas" ON jornadas_trabalho;
DROP POLICY IF EXISTS "Isolamento multi-tenant de funcionario_servicos" ON funcionario_servicos;

-- ====== PASSO 2: CORRIGIR OS DADOS JÁ CADASTRADOS NO TENANT INCORRETO ======
-- Move os funcionários da Barbearia João Cortes para o tenant correto
-- Tenant ID da Barbearia João Cortes: '7fd1c117-97e5-4d4a-a785-675ff2cb5546'
-- Tenant ID da Empresa Testes Encaixe: 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'

-- 1. Atualiza os funcionários
UPDATE funcionarios
SET tenant_id = '7fd1c117-97e5-4d4a-a785-675ff2cb5546'::uuid
WHERE tenant_id = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid
  AND nome IN ('João Lucas', 'Pedro');

-- 2. Atualiza os serviços associados (caso tenham sido gravados com o tenant de testes)
UPDATE servicos
SET tenant_id = '7fd1c117-97e5-4d4a-a785-675ff2cb5546'::uuid
WHERE tenant_id = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid
  AND nome IN ('Corte Degradê', 'Corte e Barba', 'Barboterapia');

-- 3. Atualiza os agendamentos correspondentes
UPDATE agendamentos
SET tenant_id = '7fd1c117-97e5-4d4a-a785-675ff2cb5546'::uuid
WHERE tenant_id = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7'::uuid
  AND funcionario_id IN (
    SELECT id FROM funcionarios WHERE tenant_id = '7fd1c117-97e5-4d4a-a785-675ff2cb5546'::uuid
  );

-- ====== PASSO 3: FORÇAR RECARREGAMENTO DO CACHE ======
NOTIFY pgrst, 'reload schema';

-- ====== PASSO 4: VERIFICAR RESULTADO ======
-- Deve listar João Lucas e Pedro apenas no tenant 7fd1c117...
SELECT id, nome, tenant_id FROM funcionarios;
