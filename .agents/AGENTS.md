# Diretrizes de Desenvolvimento e Release do HoraHub / Encaixe

* **Desenvolvimento Local First**: Todo o desenvolvimento, testes e validações de build devem ser executados localmente (`localhost:5173`) no workspace do usuário.
* **Isolamento Rígido de Banco de Dados (Dev vs. PRD)**: 
  - **Homologação (`localhost:5173`)**: Opera 100% isolado em LocalStorage/Mock por empresa (`tenantId`). NUNCA lê nem grava dados na nuvem de Produção.
  - **Produção (PRD)**: URL `https://horahub.netlify.app` conectada ao Supabase Cloud.
* **Navegação Responsiva Separada (Mobile/Celular vs. Desktop/Notebook)**: 
  - A interface, configurações e componentes de navegação devem possuir layouts e comportamentos especificamente adaptados para **Dispositivos Móveis (Celulares)** e **Telas Grandes (Notebooks/Desktops)**.
  - **No Celular (Mobile)**: Utilizar navegação simplificada e acessível com o polegar (ex: barra inferior de navegação `bottom-nav`, menu drawer lateral expansível e botões touch-friendly).
  - **No Notebook/Desktop**: Utilizar navegação completa (cabeçalho `navbar` horizontal, menus laterais estendidos `sidebar`, tabelas responsivas e painéis de métricas lado a lado).
  - Qualquer alteração na navegação deve ser testada e validada para funcionar de forma fluida tanto no Mobile quanto no Desktop.
* **Validação de Build Obrigatória (`npm run build`)**: Antes de propor qualquer envio de código para o repositório remoto, o comando `npm run build` deve ser executado localmente para garantir 0 erros de compilação.
* **Aprovação Explícita para Deploy/Push**: NUNCA efetuar `git push` de forma automática para o repositório remoto GitHub (`origin main`). Todas as alterações devem ser commitadas localmente primeiro e enviadas ao repositório remoto **apenas após a aprovação explícita do usuário no chat**.
* **Proteção Contra Regressão**: Toda nova versão a ser subida para PRD deve passar por validação prévia de compilação e teste de rotas críticas no `localhost:5173`.
