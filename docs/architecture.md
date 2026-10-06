# Arquitetura e pontos de atenção

## Mapa do código

| Local | Responsabilidade |
| --- | --- |
| `src/main.js` | Registra `paginate-content` via `defineCustomElement` e incorpora estilos. |
| `src/App.ce.vue` | Props, slots, montagem e recálculo após mudanças de viewport, conteúdo e preferências. |
| `src/components/ReaderWrapper.vue` | Deslocamento horizontal por `transform` e navegação por gesto. |
| `src/composables/usePagination.js` | Página atual, teclado, roda, repaginação por `ResizeObserver` e passagem entre capítulos por URL. |
| `src/composables/useEstimatePages.js` | Estima páginas pela razão entre largura do conteúdo e viewport. |
| `src/composables/useTextContent.js` | JSON de conteúdo, carregamento HTML, sumário e contexto de capítulo. |
| `src/composables/useReaderSettings.js` | Preferências reativas, bloqueio e persistência. |
| `src/composables/useSearch.js`, `src/search.js` | Busca opt-in, índice de texto normalizado com offsets DOM, fuzzy match e navegação por ocorrência. |
| `src/composables/useStyles.js` | CSS fornecido pelo consumidor e carregamento de fontes. |
| `src/composables/useReferences.js`, `useFootnotes.js` | Referências e notas, com interfaces em `ReferencePopup.vue` e `FootnotesAside.vue`. |
| `src/components/HeaderSlot/` | Cabeçalho, sumário e opções de leitura. |
| `src/components/FooterSlot.vue`, `PageSlider.vue` | Indicador e slider de páginas (`<input type="range">`, estilos em `src/assets/page-slider.css`). |
| `src/components/VueformPageSlider.vue`, `src/assets/vueform-slider.css` | Slider anterior (`@vueform/slider`), fora do bundle; mantido para reversão. |
| `src/assets/main.css` | Estilos do leitor, incluindo regras de colunas. |
| `tailwind.config.js`, `src/tailwind.css` | Configuração e saída gerada do Tailwind. |
| `demo/slot/`, `demo/summary/` | Exemplos executáveis de conteúdo em slot e capítulos carregados por arquivo. |
| `vite.config.js`, `dist/` | Build de biblioteca ES minificado, variante `vue-external` e artefatos distribuídos. |

## Contrato e fluxo

A importação do módulo registra o elemento no navegador. `App.ce.vue` inicializa paginação, preferências e estilos. `BookContent.vue` inicializa o conteúdo: um `slot="content"` fornece HTML da página hospedeira; alternativamente, `book-content` recebe JSON com `summary` e seus arquivos HTML. O primeiro arquivo é carregado na inicialização; o sumário pode trocar conteúdo ou navegar por links.

Props declaradas na raiz: `bookTitle`, `bookContent`, `readerSettings`, `readerBlocked`, `rootClass`, `cssFile` e `cssString`. Em HTML são usadas como `book-title`, `book-content`, `reader-settings`, `reader-blocked`, `root-class`, `css-file` e `css-string`. Os dois atributos de configuração/conteúdo recebem strings JSON, não objetos JavaScript diretamente.

Slots expostos pela raiz: `content`, `header`, `summaryTop`, `summaryBottom`, `optionsTop`, `optionsBottom`. Preserve a grafia. Um slot em um componente interno não é automaticamente uma API do custom element: o `footer` interno, por exemplo, não é encaminhado pela raiz.

A API JavaScript pública é instalada na instância do elemento após a montagem:
`getState()`, `goToPage()`, `nextPage()`, `previousPage()` e `refresh()`. Eventos com prefixo
`paginar:` comunicam prontidão, navegação, preferências e abertura de menus. O
contrato completo está em [eventos e estado público](events-and-state.md).

`refresh()` relê notas e referências do atributo `book-content` e reutiliza a
rotina de repaginação, com revisão para descartar callbacks anteriores. Não
reinicializa o sumário. A contagem de páginas depende apenas das dimensões de
`#reader-component` e `#content-area`; um `ResizeObserver` sobre os dois agenda a
mesma rotina no frame seguinte quando fontes, imagens ou o conteúdo mudam esses
tamanhos. Sem `ResizeObserver`, o intervalo histórico de 5 s é usado. O hospedeiro
ainda chama `refresh()` para atualizar notas/referências.
`summary.js` compartilha a regra de navegabilidade entre sumário e contexto;
itens indisponíveis permanecem na lista, mas são pulados pelos vizinhos.
`paginationEvents.js` protege campos e regiões `data-paginar-ignore` nos
handlers globais de setas e roda, usando o caminho composto dos eventos.

Na primeira restauração de progresso, a presença literal de `origin=` na query
ou fragmento não vazio marca a restauração como resolvida sem aplicar o valor
salvo, preservando a prioridade da navegação explícita.

O build define `process.env.NODE_ENV` como `production`, eliminando ramos de
desenvolvimento e dispensando `process` global. O runtime Vue 3.5.21 foi
preservado: `main.js` acrescenta hooks vazios `_beginPatch`/`_endPatch` somente
quando ausentes no custom element, para hospedeiros Vue a partir de 3.5.22.

O bundle é minificado: o Vite 3 preserva espaços em bibliotecas ES, então um
plugin em `vite.config.js` executa `minifyWhitespace` após o passo do Vite,
mantendo licenças no fim do arquivo e o source map encadeado. Uma segunda
execução (`vite build --mode vue-external`) gera `dist/index.vue-external.es.js`,
com `vue` externo, para aplicações Vue 3.5+ que já carregam o runtime. `main` e
`module` continuam apontando para `dist/index.es.js`.

A interface vive no Shadow DOM; conteúdo em slot permanece no DOM da página hospedeira. CSS externo pode estilizar o conteúdo fornecido por slot. Para a interface, existem `css-string`, `css-file` e `reader-settings.cssString`. Fontes externas são inseridas no documento. Os seletores de customização também são parte prática da integração pública.

Preferências são persistidas em `localStorage` sob `readerSettings`. Valores salvos podem sobrescrever tamanho, colunas, modo e a escolha de retomada configurados inicialmente. A retomada é opt-in por `reader-settings.readingProgress`; `useReadingProgress.js` guarda percentuais por obra/contexto sob a chave versionada `paginar:reading-progress:v1`, atualiza o registro na navegação e novamente ao ocultar ou sair da página, e restaura somente depois de uma paginação válida. Quando viewport, fonte, tamanho, colunas ou conteúdo provocam repaginação, o percentual anterior é capturado antes do cálculo e convertido para a página mais próxima no novo total. A paginação usa colunas CSS e deslocamento horizontal, não uma árvore de páginas independentes. O deslocamento é um `transform: translateX(...)` em `.columnsArea` a partir da página 2; mudar `margin-left` refazia o layout do capítulo inteiro a cada página. Por isso, desde a página 2 `.columnsArea` cria contexto de empilhamento e serve de bloco de contenção para descendentes `position: fixed`. Abaixo de 1024 px, a raiz muda a opção dupla para simples; o gesto de navegação é condicionado a largura inferior a 600 px.

## Busca e paginação

`reader-settings.search: true` ativa a busca apenas nesta montagem; a opção não
é salva em `localStorage`. `useSearch` cria estado por instância e o fornece aos
controles do cabeçalho via `provide/inject`. O índice percorre texto renderizado,
incluindo nós atribuídos ao slot, e preserva offsets para criar `Range`s sem
envolver o texto em elementos. Conteúdo oculto, scripts e estilos são ignorados.
Uma consulta normaliza caixa, diacríticos, espaços e pontuação; termos com cinco
ou mais caracteres aceitam uma edição ou transposição adjacente por palavra.

Cada resultado é mapeado para uma página pela posição do `Range` relativa à
origem das colunas e pela largura do viewport. A navegação usa
`usePagination.set(page, 'search')`, sincronizando slider, eventos e retomada.
Os destaques ficam em uma camada absoluta fora do fluxo de colunas: as ocorrências
visíveis têm fundo suave e a atual tem fundo mais forte e contorno. A geometria é
medida na consulta e na repaginação; apenas as páginas atual e adjacentes geram
elementos de destaque, atualizados também na navegação pelo slider. O deslocamento
tem animação curta, respeitando `prefers-reduced-motion`. A repaginação atualiza
a geometria do destaque. Um observador invalida o índice quando o texto muda,
inclusive ao trocar de capítulo; a pesquisa abrange somente o conteúdo carregado.
Listeners, observador e debounce da busca são removidos na desmontagem.

`SearchButton.vue` alterna a mesma interface entre dropdown e painel lateral,
sem mudar as dimensões das colunas. `useSearch` mantém descritores de trechos
locais e resultados externos por instância; apenas locais possuem `Range`.
`searchResults: 'panel'` escolhe a apresentação inicial. A API da raiz encaminha
`search`, `getSearchState` e `setSearchResults`. O evento `paginar:search` fornece
consulta, identificador da requisição e resultados locais; o consumidor devolve
externos associados ao identificador. Alterações de consulta ou conteúdo e
fechamento invalidam respostas pendentes. `paginar:search-select` delega à
aplicação o carregamento/navegação para capítulos externos. Trechos são texto,
sem `v-html`, e não alteram o DOM do livro. Veja o
[contrato completo](events-and-state.md#busca-painel-de-trechos-e-resultados-externos).

## Limitações observadas no código

Estas observações orientam investigação; não são tarefas obrigatórias para cada alteração.

- Vários composables exportam estado único no escopo do módulo, e há seletores globais de conteúdo. Não presumir isolamento entre múltiplos leitores.
- Há uso direto de `window`, `document`, `navigator` e `customElements`, inclusive durante importação. Não presumir suporte a SSR ou importação repetida de bundles distintos.
- `usePagination.init` instala listener global de roda sem limpeza correspondente; o `ResizeObserver` é desconectado na desmontagem. Ao trabalhar com montagem/desmontagem, verificar duplicação e retenção de estado.
- Configurações e conteúdo são inicializados na montagem; o watcher de props trata `readerBlocked`. Não prometer atualização dinâmica de todos os atributos.
- `refresh()` atualiza somente notas/referências e layout. A navegação sequencial ainda exige `link` nos vizinhos, embora o sumário aceite itens apenas com `file`; essa limitação foi preservada por compatibilidade.
- HTML carregado é renderizado com `v-html` e CSS pode ser injetado. Não existe sanitização geral implementada; integrações devem fornecer conteúdo confiável.
- O sumário é fornecido no JSON. A lista histórica de funcionalidades do README não comprova geração automática a partir de títulos HTML nem parsing de Markdown.
- `useBrowser.isSafari` usa detecção de dispositivos Apple móveis/iPad por heurística, não uma detecção completa de Safari desktop. Verificar plataformas reais quando alterar esse ramo.

Veja [desenvolvimento](development.md) e [decisões](decisions.md). Ajuste esta lista quando uma limitação for resolvida.
