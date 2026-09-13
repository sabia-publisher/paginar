# Desenvolvimento e validação

## Preparar e executar

O projeto usa Vue 3, Vite 3 e Tailwind 3, com `yarn.lock` no formato Classic. Não há versão de Node fixada, campo `engines` ou matriz de CI. Confira `node --version` e `yarn --version`; use Yarn 1.x para respeitar o lockfile. Não trate a versão disponível na máquina como requisito oficial.

```sh
yarn install --frozen-lockfile
npm run dev
```

`dev` executa o watcher do Tailwind e o Vite. Use a URL mostrada no terminal (normalmente `http://localhost:5173`). `vite.config.js` define `server.host: true`, expondo o servidor nas interfaces de rede. Para desenvolvimento restrito à máquina, execute em dois terminais:

```sh
npm run start:css
npm run start -- --host 127.0.0.1
```

No PowerShell com scripts bloqueados, substitua `npm`/`yarn` por `npm.cmd`/`yarn.cmd`; não é necessário alterar a política de execução.

Não há variável de ambiente obrigatória referenciada pelo código em `src/`. O desenvolvimento não exige descobrir credenciais ou copiar um `.env` de produção.

## Build e arquivos gerados

```sh
npm run build
git diff --stat
git diff --check
```

O build primeiro gera `src/tailwind.css`, depois `dist/index.es.js`, seu source map e os demais arquivos de distribuição via Vite. `dist/` e o CSS gerado são rastreados. Revise essas diferenças quando alterar runtime ou estilos; para uma mudança só de documentação, evite alterações incidentais nos gerados.

`npm run preview` serve a saída do build na porta 4173, mas esse build é uma biblioteca e não inclui o índice e as demos como aplicativo. Para testar o artefato, crie uma página HTML temporária pública/sem dados privados, servida por HTTP, com `<script type="module" src="/dist/index.es.js"></script>` e um `<paginate-content>` com conteúdo suficiente. Pode-se servir essa página pelo servidor de desenvolvimento, confirmando na aba Network que o módulo carregado vem de `dist/`, e não de `src/`. Remova apenas o arquivo temporário criado para essa verificação ao terminar.

## Verificação manual proporcional

Abra `/demo/slot/slot-chapter1.html` para conteúdo em slot, `/demo/summary/index.html` para conteúdo buscado via HTTP e `/demo/events/index.html` para a API pública. As demos importam `dist/index.es.js`, como consumidores reais e como o GitHub Pages; execute `npm run build` antes de validá-las. A página `/` contém atalhos para as demos.

Para mudanças de comportamento, selecione os cenários afetados; antes de release, percorra todos:

- Conteúdo aparece sem erro novo no console; arquivos de capítulo carregam sem falha de rede.
- Próxima/anterior pelos botões, setas, slider e roda; início/fim e passagem entre capítulos por link, incluindo retorno com `origin=next`.
- Redimensionamento entre desktop e celular; uma/duas colunas, mudança de fonte e tamanho, número de páginas coerente e ausência de cortes no texto. Gesto em viewport menor que 600 px.
- Sumário, opções, referências e notas abrem/fecham; bloqueio de navegação durante os estados pertinentes.
- Tema e preferências persistem ao recarregar. Para comparar os padrões, remova apenas a chave `readerSettings` no armazenamento da origem de teste.
- Na demo `/demo/events/`, confirme que ações por botão, teclado, roda, gesto, slider e API atualizam o estado e emitem a origem esperada; confira também eventos de sumário, opções e preferências.
- Com `readingProgress` configurado, avance, recarregue e confirme retorno com diferença máxima de uma página da posição proporcional. Repita após alterar viewport, fonte e colunas; teste a desativação pelo menu e isole a limpeza à chave `paginar:reading-progress:v1`.
- Slots de customização e CSS do consumidor continuam funcionando. Teste também o bundle construído antes da publicação.
- Alterações de layout ou detecção de plataforma: verificar Chromium e, quando disponível, Safari/iOS. Registre navegadores/dispositivos efetivamente usados e qualquer cobertura pendente.

Não há suíte automatizada, linter ou verificação de tipos configurados. Um build bem-sucedido comprova compilação, não correção da paginação. Se uma correção justificar teste automatizado, escolha um teste que reproduza a falha e documente o comando introduzido aqui.

Para documentação, revise caminhos, links relativos, consistência com o código e `git diff --check`. Para mudanças de empacotamento, execute também `npm pack --dry-run --json` e confira a lista de arquivos.
