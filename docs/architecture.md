# Arquitetura e pontos de atenção

## Mapa do código

| Local | Responsabilidade |
| --- | --- |
| `src/main.js` | Registra `paginate-content` via `defineCustomElement` e incorpora estilos. |
| `src/App.ce.vue` | Props, slots, montagem e recálculo após mudanças de viewport, conteúdo e preferências. |
| `src/components/ReaderWrapper.vue` | Deslocamento horizontal e navegação por gesto. |
| `src/composables/usePagination.js` | Página atual, teclado, roda e passagem entre capítulos por URL. |
| `src/composables/useEstimatePages.js` | Estima páginas pela razão entre largura do conteúdo e viewport. |
| `src/composables/useTextContent.js` | JSON de conteúdo, carregamento HTML, sumário e contexto de capítulo. |
| `src/composables/useReaderSettings.js` | Preferências reativas, bloqueio e persistência. |
| `src/composables/useStyles.js` | CSS fornecido pelo consumidor e carregamento de fontes. |
| `src/composables/useReferences.js`, `useFootnotes.js` | Referências e notas, com interfaces em `ReferencePopup.vue` e `FootnotesAside.vue`. |
| `src/components/HeaderSlot/` | Cabeçalho, sumário e opções de leitura. |
| `src/components/FooterSlot.vue` | Indicador e slider de páginas. |
| `src/assets/main.css` | Estilos do leitor, incluindo regras de colunas. |
| `tailwind.config.js`, `src/tailwind.css` | Configuração e saída gerada do Tailwind. |
| `demo/slot/`, `demo/summary/` | Exemplos executáveis de conteúdo em slot e capítulos carregados por arquivo. |
| `vite.config.js`, `dist/` | Build de biblioteca ES e artefatos distribuídos. |

## Contrato e fluxo

A importação do módulo registra o elemento no navegador. `App.ce.vue` inicializa paginação, preferências e estilos. `BookContent.vue` inicializa o conteúdo: um `slot="content"` fornece HTML da página hospedeira; alternativamente, `book-content` recebe JSON com `summary` e seus arquivos HTML. O primeiro arquivo é carregado na inicialização; o sumário pode trocar conteúdo ou navegar por links.

Props declaradas na raiz: `bookTitle`, `bookContent`, `readerSettings`, `readerBlocked`, `rootClass`, `cssFile` e `cssString`. Em HTML são usadas como `book-title`, `book-content`, `reader-settings`, `reader-blocked`, `root-class`, `css-file` e `css-string`. Os dois atributos de configuração/conteúdo recebem strings JSON, não objetos JavaScript diretamente.

Slots expostos pela raiz: `content`, `header`, `summaryTop`, `summaryBottom`, `optionsTop`, `optionsBottom`. Preserve a grafia. Um slot em um componente interno não é automaticamente uma API do custom element: o `footer` interno, por exemplo, não é encaminhado pela raiz.

A interface vive no Shadow DOM; conteúdo em slot permanece no DOM da página hospedeira. CSS externo pode estilizar o conteúdo fornecido por slot. Para a interface, existem `css-string`, `css-file` e `reader-settings.cssString`. Fontes externas são inseridas no documento. Os seletores de customização também são parte prática da integração pública.

Preferências são persistidas em `localStorage` sob `readerSettings`. Valores salvos podem sobrescrever tamanho, colunas, modo e a escolha de retomada configurados inicialmente. A retomada é opt-in por `reader-settings.readingProgress`; `useReadingProgress.js` guarda percentuais por obra/contexto sob a chave versionada `paginar:reading-progress:v1`, atualiza o registro na navegação e novamente ao ocultar ou sair da página, e restaura somente depois de uma paginação válida. Quando viewport, fonte, tamanho, colunas ou conteúdo provocam repaginação, o percentual anterior é capturado antes do cálculo e convertido para a página mais próxima no novo total. A paginação usa colunas CSS e deslocamento horizontal, não uma árvore de páginas independentes. Abaixo de 1024 px, a raiz muda a opção dupla para simples; o gesto de navegação é condicionado a largura inferior a 600 px.

## Limitações observadas no código

Estas observações orientam investigação; não são tarefas obrigatórias para cada alteração.

- Vários composables exportam estado único no escopo do módulo, e há seletores globais de conteúdo. Não presumir isolamento entre múltiplos leitores.
- Há uso direto de `window`, `document`, `navigator` e `customElements`, inclusive durante importação. Não presumir suporte a SSR ou importação repetida de bundles distintos.
- `usePagination.init` instala listener global e intervalo sem limpeza correspondente. Ao trabalhar com montagem/desmontagem, verificar duplicação e retenção de estado.
- Configurações e conteúdo são inicializados na montagem; o watcher de props trata `readerBlocked`. Não prometer atualização dinâmica de todos os atributos.
- HTML carregado é renderizado com `v-html` e CSS pode ser injetado. Não existe sanitização geral implementada; integrações devem fornecer conteúdo confiável.
- O sumário é fornecido no JSON. A lista histórica de funcionalidades do README não comprova geração automática a partir de títulos HTML nem parsing de Markdown.
- `useBrowser.isSafari` usa detecção de dispositivos Apple móveis/iPad por heurística, não uma detecção completa de Safari desktop. Verificar plataformas reais quando alterar esse ramo.
- `package.json` ainda aponta o repositório/homepage para `educkf/paginar`, enquanto o remoto deste checkout é `sabia-publisher/paginar`. Revisar os metadados numa release, sem confundir URL antiga com destino atual de push.

Veja [desenvolvimento](development.md) e [decisões](decisions.md). Ajuste esta lista quando uma limitação for resolvida.
