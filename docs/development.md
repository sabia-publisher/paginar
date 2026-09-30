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
- Na [demo de busca](../demo/search/index.html), teste `acao`, `lietura`, `sao paulo` e `jabuticabeira`: contagem, primeira ocorrência distante, Enter/Shift+Enter, Ctrl+F/Cmd+F, clique fora e Esc. Confira o slider, destaque, uma/duas colunas, resize, fonte e tema; a busca não deve alterar o total de páginas. Repita com `search` ausente e confirme ausência da lupa e preservação do Ctrl+F nativo. Para HTML por arquivo, habilite `search: true` na demo de sumário e troque de capítulo com uma consulta aberta.
- Ao buscar `leitura`, confirme as três ocorrências por coluna: a selecionada tem fundo forte e contorno, e as demais têm fundo suave. Navegue também pelo slider, confira os destaques nos dois temas e confirme que limpar/fechar a busca os remove. O dropdown usa fundo branco, como Opções/Sumário, e botões de navegação com SVG.
- Na busca, confira hover, pressionado e foco por Tab nos botões de ícone, inclusive no X de limpar. Limpar deve manter o dropdown aberto, remover os destaques e devolver o foco ao campo. Sem resultados, as setas ficam desabilitadas. O contêiner do dropdown não tem borda nem cantos arredondados.
- Alterações de layout ou detecção de plataforma: verificar Chromium e, quando disponível, Safari/iOS. Registre navegadores/dispositivos efetivamente usados e qualquer cobertura pendente.
- Na [demo de painel](../demo/search/index.html?view=panel), busque `sao paulo` e `lietura`: confira contexto, destaque original, clique em ocorrência distante, seleção, página, rolagem da lista sem virar páginas e alternância para compacto. Verifique Esc, limpar, foco, tema escuro e viewport estreito. Abrir o painel não deve mudar o total de páginas.
- Ao abrir a busca ou alternar de compacto para painel, o campo deve receber foco. Clique em um trecho e use ↑/↓: seleção, foco e página acompanham o item, com rolagem para mantê-lo visível e circulação entre primeiro/último. No campo, essas setas não devem selecionar resultados.
- Na [demo de busca no livro](../demo/search-book/index.html), busque `memória`: aparecem locais e, após a latência simulada, externos com títulos de capítulo. Selecione a segunda ocorrência do capítulo 2 e confira a retomada correspondente. `oceano` mostra apenas externos no capítulo 1; `inexistente` mostra lista vazia. Desative “Incluir outros capítulos” e confira somente locais.
- Para a API de busca, capture `requestId`, troque consulta e tente injetar a resposta anterior antes e depois do debounce: deve retornar `false`. Repita após limpar/fechar e alterar conteúdo. Confira listas externas vazias, IDs duplicados, texto contendo HTML literal e snapshots sem referências mutáveis. Falhas de serviço não devem remover os resultados locais.

O teste da lógica de busca usa somente o runner nativo do Node, sem dependências
adicionais: `node --test tests/search.test.mjs`. Ele verifica normalização,
offsets Unicode, expressões, tolerância a erros e ausência de duplicatas.
Também cobre contexto dos trechos e validação/cópia de resultados externos.
Não substitui a validação no navegador do DOM, atalhos, layout e paginação.
Depois do build, abra `/tests/search-browser.html` pelo servidor de
desenvolvimento para executar as verificações de integração contra `dist/`.
O título e o relatório devem terminar em `PASS`/`CONCLUÍDO`. O teste usa um iframe
com as demos, sem dependências adicionais, e cobre painel, navegação, snapshots,
respostas antigas, injeção externa, viewport estreito e retomada entre capítulos.
Execute em uma origem/perfil de teste, pois as demos usam as preferências do leitor.
Não há script npm de testes, linter ou verificação de tipos configurados. Um build
bem-sucedido comprova compilação, não correção da paginação.

## Comparação dos patches de integração

Execute `node --test tests/search.test.mjs tests/upstream.test.mjs` para testar
busca, navegabilidade do sumário e o predicado de proteção de eventos.

`tests/upstream-browser.mjs` serve páginas de teste em uma porta local temporária
e inicia um Chromium headless com perfil isolado. Requer Node 22 ou superior
pelas APIs nativas `fetch` e `WebSocket` (requisito do runner, não da biblioteca).
Forneça caminhos locais para o bundle de referência e o build de navegador do
Vue hospedeiro; os arquivos externos são apenas lidos e não entram em `dist/`:

```sh
node tests/upstream-browser.mjs --reference /path/to/reference/index.es.js --host-vue /path/to/vue/dist/vue.esm-browser.prod.js --browser /path/to/chromium
```

O runner compara documentos separados, com viewport e armazenamento inicial
iguais, e grava relatório JSON, HTML e screenshot em uma pasta temporária
informada na saída. Aguarda frames reais, pois orçamento de tempo virtual pode
concluir antes dos callbacks de `requestAnimationFrame` da repaginação.
O teste cobre ordem e dados dos eventos, snapshots, gravação de progresso,
`refresh()` em crescimento/redução/chamadas sobrepostas, notas/referências,
URLs explícitas, campos em slots/Shadow DOM, DOM/estilos do sumário, sequência
com itens indisponíveis e atualização/desmontagem pelo Vue hospedeiro.
O destino inválido histórico de vizinhos apenas com `file` é caracterizado,
sem ser corrigido implicitamente. A comparação original usa o bundle de
referência `0.3.7-2` e Vue hospedeiro 3.5.40.

Para executar o teste da busca pelo mesmo runner, acrescente
`--page /tests/search-browser.html`. Ele também confere as variáveis de cor
nos modos claro/escuro e a ausência da faixa esquerda na seleção.
Para validar o pacote extraído de um tarball, acrescente `--dist /path/to/package/dist`;
o servidor usará esse diretório para todas as requisições de `/dist/`.

Depois de mudar o build, procure `NODE_ENV` no JS gerado: não deve haver acesso
a `process` nem a expressão `{}.NODE_ENV !== "production"`. Verifique também
`npm pack --dry-run --json` e os arquivos efetivamente incluídos no pacote.

Para documentação, revise caminhos, links relativos, consistência com o código e `git diff --check`. Para mudanças de empacotamento, execute também `npm pack --dry-run --json` e confira a lista de arquivos.
