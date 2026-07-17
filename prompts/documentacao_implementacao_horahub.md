# Documentação de Implementação e Evolução — HoraHub

Este documento consolida todo o planejamento técnico, histórico de implementações entregues e o roadmap de evolução futura do **HoraHub** para servir de base e documentação de referência no NotebookLM.

---

## ?? Índice
1. [Histórico e Escopo do Projeto](#1-histórico-e-escopo-do-projeto)
2. [Plano de Implementação: Super Admin, Planos e Suspensão Financeira](#2-plano-de-implementação-super-admin-planos-e-suspensão-financeira)
3. [Walkthrough: Relatório de Implementação e Validação](#3-walkthrough-relatório-de-implementação-e-validação)
4. [Ajustes Recentes de Produção (Deploy e Infraestrutura)](#4-ajustes-recentes-de-produção-deploy-e-infraestrutura)
5. [Estimativa de Tempo por Feature (Breakdown de Horas)](#5-estimativa-de-tempo-por-feature-breakdown-de-horas)
6. [Roadmap de Evolução e Oportunidades do Produto](#6-roadmap-de-evolução-e-oportunidades-do-produto)

---

## 1. Histórico e Escopo do Projeto

O **HoraHub** é um sistema de agendamento online B2B SaaS White Label (focado inicialmente em barbearias, salões de beleza e clínicas de estética). Ele opera em um modelo multi-tenant isolado por banco de dados onde cada empresa cadastrada possui sua própria agenda pública (/agendar/[slug]) e seu painel administrativo (/admin).

A arquitetura utiliza:
*   **Frontend**: React (TypeScript), Vite, React Router, CSS customizado (sem Tailwind para maior controle visual).
*   **Backend/Banco de Dados**: Supabase (PostgreSQL), utilizando Row Level Security (RLS) baseado em JWT para isolamento estrito de tenants.
*   **Hospedagem Frontend**: Netlify.

---

## 2. Plano de Implementação: Super Admin, Planos e Suspensão Financeira

Este plano detalhou a criação do painel mestre de governança e as travas financeiras de inadimplência.

### 2.1 Banco de Dados (Supabase Migration)
*   **Tabela `empresas`**:
    *   `plano_nome` (text, default `'Bronze'`) - Tipo do plano (Bronze, Prata, Ouro).
    *   `valor_mensalidade` (numeric, default `99.90`) - Valor mensal da assinatura.
    *   `saldo_devedor` (numeric, default `0.00`) - Faturas vencidas.
    *   `data_renovacao` (timestamp, default `now() + interval '30 days'`) - Próxima cobrança.
*   **RLS Bypass para o Super Admin**:
    ```sql
    CREATE POLICY "Superadmin gerencia todas as empresas" ON empresas
    FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@horahub.com');
    ```

### 2.2 Rotas e Layouts Protegidos
*   **ProtectedRoute**: Injeção da propriedade `requireSuperAdmin` para bloquear usuários comuns na rota `/superadmin`.
*   **SuperAdminPage**: Tela master com métricas consolidadas (Total de Clientes, Ativos, Pendentes, Inadimplentes e MRR) e gerenciador de status dos tenants (Ativar, Bloquear, e modal de alteração de faturamento).
*   **Barreira Financeira**: Intercepção no `Layout` principal. Se `plano_status === 'bloqueado'`, renderiza uma tela vermelha opaca de bloqueio com aviso e contatos do suporte, desfocando o restante do painel.

---

## 3. Walkthrough: Relatório de Implementação e Validação

Entregas realizadas e validadas localmente com sucesso:

### 3.1 Painel Master de Governança
*   Implementado design premium de controle centralizado no arquivo `SuperAdminPage.tsx`.
*   Inserção do botão verde neon exclusivo de "Super Admin" no rodapé esquerdo da sidebar para o usuário `admin@horahub.com`.

### 3.2 Travas de Segurança & Suspensão
*   Desenvolvimento do card visual premium de suspensão de acesso no `App.tsx` que monitora as sessões em tempo real.
*   Reativação ágil do tenant assim que o status da empresa retorna para `ativo` a partir de uma ação no Super Admin.

### 3.3 Ícones Customizados
*   Injeção dinâmica dos ícones locais em formato PNG transparente (`users-loyalty.png`, `schedule.png`, `people-poll.png`) aplicando máscaras de cor CSS Mask. Isso permite aplicar a paleta bege `#D7C9B7` em estados hover/active sem carregar múltiplos arquivos.

---

## 4. Ajustes Recentes de Produção (Deploy e Infraestrutura)

Durante o processo de subida local de teste para o ambiente real de Produção, identificamos e resolvemos os seguintes gargalos:

### 4.1 Erro de "Invalid API Key" no Netlify
*   **Problema**: O build em produção do Netlify não continha as variáveis de ambiente locais do Vite, caindo nas chaves simuladas (mock) do Supabase e retornando erro no login.
*   **Solução**: Configuração manual das variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` diretamente no painel de administração do Netlify (Settings -> Environment Variables) e execução de novo deploy limpando caches.

### 4.2 Bloqueio de Cadastro por RLS na Produção
*   **Problema**: A criação automática da empresa no banco de dados falhava no cadastro inicial público, pois o usuário ainda não estava logado (considerado usuário anônimo pelo RLS).
*   **Solução**: Criação e aplicação da migration de segurança:
    ```sql
    DROP POLICY IF EXISTS "Permitir insercao publica de empresas" ON empresas;
    CREATE POLICY "Permitir insercao publica de empresas" ON empresas
      FOR INSERT TO anon, authenticated
      WITH CHECK (true);
    ```
    Isso permitiu o registro público e seguro da nova empresa de forma síncrona com o cadastro de usuário.

### 4.3 Limites de Requisições ("email rate limit exceeded")
*   **Problema**: Erro nativo do Supabase que bloqueia novas tentativas consecutivas de cadastro a partir de um único IP por segurança.
*   **Solução**: Ajuste das regras de "Rate Limits" do projeto Supabase e desativação temporária da obrigatoriedade do fluxo de confirmação por e-mail na aba **Sign In / Providers -> Email -> Confirm email** no painel da Supabase.

---

## 5. Estimativa de Tempo por Feature (Breakdown de Horas)

Breakdown de esforço estimado para as próximas sprints baseando-se no ritmo assistido por IA:

| # | Funcionalidade | Complexidade | Estimativa | Detalhes Principais |
|---|---|---|---|---|
| 1 | **Dashboard Financeiro** | Média | **3–4h** | Migrar estatísticas do LocalStorage para Supabase por `tenant_id`. |
| 2 | **Onboarding Wizard** | Baixa | **2–3h** | Modal passo a passo interativo para novas empresas. |
| 3 | **PWA (App Mobile)** | Baixa | **1–2h** | Configuração do service worker para instalação na tela inicial. |
| 4 | **Notificações por E-mail** | Média | **3–4h** | Envio automático via API externa (Resend/SendGrid) + Cron para lembretes. |
| 5 | **Sistema de Avaliações** | Média | **4–5h** | Avaliações do serviço (1-5 estrelas) acoplado ao profissional. |
| 6 | **Anamnese + Prontuários** | Alta | **8–10h** | Fichas clínicas customizadas por drag-and-drop e histórico do cliente. |
| 7 | **WhatsApp Integrado** | Alta | **5–7h** | Disparos transacionais por APIs parceiras (Evolution, Z-API). |
| 8 | **Faturamento SaaS (Cobrança)**| Alta | **5–6h** | Geração de cobranças via Asaas/Stripe integradas a travamentos do RLS. |
| 9 | **Pagamento Online** | Alta | **7–9h** | Exigência de sinal/PIX no portal público de agendamento. |
| 10| **Autenticação 2FA** | Média | **3–4h** | Injeção do MFA do Supabase Auth para donos e admins. |
| 11| **Google Agenda Sync** | Alta | **6–8h** | Sincronia bidirecional via OAuth da API do Google Calendar. |
| 12| **Multi-idioma (i18n)** | Média | **4–5h** | Configuração do react-i18next (Português, Espanhol, Inglês). |

---

## 6. Roadmap de Evolução e Oportunidades do Produto

Roadmap sugerido estruturado de acordo com o retorno de valor e barreira técnica:

```
Sprint 1  ?  Migração do Dashboard Financeiro para o Supabase (Dívida Técnica principal)
Sprint 2  ?  Integração de Notificações transacionais por WhatsApp e E-mail (Aumento de retenção)
Sprint 3  ?  Fichas de Anamnese e Prontuários (Abertura para o segmento de alto valor de clínicas)
Sprint 4  ?  Faturamento SaaS Automático (Assinaturas recorrentes via Asaas)
Sprint 5  ?  Pagamentos e Sinais Antecipados no Agendamento Online
```

### Oportunidades de Preços SaaS (Estudo de Monetização):
*   **Plano Bronze (R$ 99/mês)**: Gestão de agenda, equipe de até 3 profissionais e White Label.
*   **Plano Prata (R$ 149/mês)**: Bronze + Disparo de Notificações WhatsApp + Relatórios Financeiros.
*   **Plano Ouro (R$ 249/mês)**: Prata + Recebimento de Sinais + Prontuário Clínico Completo.
