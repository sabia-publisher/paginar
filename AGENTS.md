# Guia para agentes

Paginar é uma biblioteca pública de leitura paginada, feita em Vue 3 e entregue como o Web Component `<paginate-content>`. Não é um aplicativo com backend. O pacote npm se chama `paginar`; o código público está em https://github.com/sabia-publisher/paginar.

## Comece aqui

1. Leia este arquivo e confira `git status --short` para preservar trabalho existente.
2. Consulte [arquitetura](docs/architecture.md) para localizar a mudança e suas limitações conhecidas.
3. Use [desenvolvimento](docs/development.md) para executar e verificar a alteração.
4. Consulte [publicação](docs/releasing.md) somente quando mexer na distribuição ou preparar uma versão.

O código e `package.json` são a fonte de verdade. Se uma instrução estiver desatualizada, confira a implementação e corrija a documentação junto da tarefa.

## Fluxo para demandas pequenas

- Entenda o resultado pedido, leia os arquivos envolvidos, faça a menor mudança coerente e valide o comportamento afetado.
- Spec Kit / Specify é opcional. Não exija spec, branch de feature, plano, checklist ou `tasks.md` para correções e melhorias pequenas. Use o fluxo quando solicitado ou quando a complexidade justificar, sem transformar isso em pré-requisito universal.
- Não reformate o projeto inteiro, atualize dependências ou corrija problemas vizinhos sem necessidade para a tarefa.
- Preserve alterações preexistentes. Não inclua automaticamente `.agents/` e `.specify/` em commits; revise seu conteúdo e escopo como qualquer arquivo novo.
- Ao concluir, informe o que mudou, como foi verificado e o que não foi possível verificar. Não afirme que um build verifica comportamento visual.

## Convenções e compatibilidade

- JavaScript e Vue SFC com Composition API; siga o estilo local e `.editorconfig` (UTF-8, LF, tabs). Não introduza TypeScript ou ferramentas novas por padrão.
- Preserve o nome `paginate-content`, os atributos, slots, formatos JSON e seletores CSS públicos usados pelos consumidores. Alterações incompatíveis precisam ser explícitas.
- Edite fontes em `src/`; nunca corrija diretamente `dist/` ou `src/tailwind.css`. Ambos têm arquivos gerados e rastreados pelo Git.
- Para mudanças de runtime/estilo, execute `npm run build`, revise os artefatos gerados e valide a demo pertinente no navegador. Para documentação, verifique links, caminhos e comandos; não há necessidade de regenerar o bundle.
- Não há scripts de teste, lint ou CI versionados. Não invente comandos nem declare verificações inexistentes. Acrescente testes proporcionais quando a mudança justificar uma infraestrutura nova.

## Comandos essenciais

```sh
yarn install --frozen-lockfile
npm run dev
npm run build
```

O lockfile é do Yarn Classic (1.x). Não crie `package-lock.json` nem migre o gerenciador incidentalmente. No PowerShell, use `npm.cmd` e `yarn.cmd` se a política bloquear os wrappers `.ps1`. As demos e os detalhes de verificação estão em [desenvolvimento](docs/development.md).

## Como o projeto é publicado

- `package.json` define nome e versão; `main` e `module` apontam para `dist/index.es.js`.
- `npm run build` gera a biblioteca ES via Vite. `dist/` também está versionado e é consumido por CDN baseada no GitHub.
- Não há workflow de publicação nem hook `prepublishOnly`/`prepack` neste checkout. Um push ou uma tag não demonstram que houve publicação npm. O procedimento manual documentado é: atualizar versão, construir, testar, revisar `npm pack --dry-run`, empacotar e publicar o tarball revisado com `npm publish`.
- Siga [o roteiro completo de release](docs/releasing.md), inclusive verificação da versão no registry e conferência do conteúdo público. Não publique no npm, envie tags ou faça push apenas por ter concluído uma tarefa local; execute essas ações quando fizerem parte do pedido autorizado.

## Repositório e pacote públicos

- Documente apenas conhecimento técnico compartilhável. Não grave conversas, dados de clientes, caminhos absolutos da máquina, identificadores privados, tokens, credenciais ou configurações pessoais.
- Não leia nem imprima `.env`, configurações de autenticação npm ou variáveis de ambiente para descobrir o projeto. Se forem indispensáveis, limite a inspeção ao necessário e nunca reproduza valores sensíveis em docs, logs ou respostas.
- `.env` já estava rastreado na base deste trabalho. Regras de ignore não removem arquivos do Git nem do histórico. Não suponha que esse arquivo seja privado; não acrescente segredos e não reescreva o histórico como manutenção incidental.
- O campo `files` de `package.json` limita o pacote a `dist/`, além dos metadados incluídos pelo npm. Revise o dry-run em cada release. Source maps podem incluir fontes: tudo que entra no bundle e nos mapas precisa ser público.

## Memória que deve evoluir

Atualize o documento correspondente quando mudar arquitetura, contrato público, comandos, validação ou release. Registre decisões duráveis com motivo e consequência em [decisões](docs/decisions.md). Correções pequenas não exigem uma entrada. Não mantenha diários por sessão ou copie o código para a documentação. Pendências devem indicar evidência e condição de revisão, sem apresentar hipóteses como requisitos.
