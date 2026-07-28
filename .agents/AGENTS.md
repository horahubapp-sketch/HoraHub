# Diretrizes de Desenvolvimento do HoraHub

* **Desenvolvimento Local First**: Todo o desenvolvimento, testes e validações de build devem ser executados localmente (`localhost`) no workspace do usuário.
* **Aprovação de Push**: Não efetuar `git push` para o repositório remoto GitHub (`origin main`) de forma automática após cada alteração. As alterações devem ser commitadas localmente e enviadas ao repositório remoto apenas após a validação e aprovação explícita do usuário no chat.
Sempre tenha cuidado para tratar o slug do ambiente de prod e dev, pois ele é diferente. Em prod é `horahub.com.br` e em dev é `localhost:5173`.
