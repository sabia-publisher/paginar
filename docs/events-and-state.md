# Eventos e estado público

O `<paginate-content>` oferece eventos DOM e métodos no próprio elemento. Os
eventos são `CustomEvent`, propagam pela árvore e atravessam o Shadow DOM. Todos
incluem um snapshot completo em `event.detail.state`.

| Evento | Quando ocorre | Outros dados em `detail` |
| --- | --- | --- |
| `paginar:ready` | A API está disponível | — |
| `paginar:page-change` | A página muda | `page`, `previousPage`, `source` |
| `paginar:settings-change` | Fonte, tamanho, colunas, tema ou retomada muda | `changes` |
| `paginar:summary-toggle` | O sumário abre ou fecha | `open` |
| `paginar:options-toggle` | O menu de opções abre ou fecha | `open` |
| `paginar:chapter-change` | Um capítulo por arquivo é escolhido | `chapter` |
| `paginar:search` | Consulta executada, limpa ou fechada; conteúdo alterado com busca aberta | `query`, `requestId`, `open`, `results` (locais) |
| `paginar:search-select` | Leitor escolhe uma ocorrência por clique, setas ou Enter | `query`, `requestId`, `index`, `result` |

As origens (`source`) conhecidas são `next-button`, `previous-button`, `slider`,
`keyboard`, `wheel`, `swipe`, `summary`, `api`, `reading-progress`,
`repagination`, `search` e `go-to-page`.

```js
const reader = document.querySelector('paginate-content')

reader.addEventListener('paginar:page-change', event => {
	const { page, previousPage, source, state } = event.detail
	console.log({ page, previousPage, source, state })
})

reader.addEventListener('paginar:settings-change', event => {
	// Exemplo: { fontSize: { previous: 16, value: 17 } }
	console.log(event.detail.changes)
})
```

Registre listeners logo após inserir o elemento. Depois de `paginar:ready`, estes
métodos estão disponíveis:

```js
reader.addEventListener('paginar:ready', () => {
	console.log(reader.getState())
	reader.goToPage(3)
	reader.nextPage()
	reader.previousPage()
})
```

`getState()` retorna um objeto novo com este formato; alterá-lo não muda o leitor:

```js
{
	pagination: { currentPage, totalPages, progress }, // progress entre 0 e 1
	settings: {
		baseFont, textFont, fontSize, columns, mode, blocked,
		readingProgressEnabled, searchEnabled
	},
	content: { bookTitle, chapterTitle, chapter }
}
```

Veja o [exemplo interativo](../demo/events/index.html), que exibe o estado e o
histórico de eventos ao vivo.

## Atualizar conteúdo após a montagem

`reader.refresh()` relê o atributo atual `book-content`, atualiza as coleções
de `footnotes` e `references` e recalcula a paginação sem remontar o elemento.
Chame depois de o aplicativo terminar de atualizar o slot e o atributo:

```js
reader.setAttribute('book-content', JSON.stringify({
	footnotes: updatedFootnotes,
	references: updatedReferences
}))
reader.refresh()
```

O método não recebe argumentos e retorna `undefined`. A medição é imediata,
mas a sincronização de progresso e a geometria da busca terminam em `nextTick`
e `requestAnimationFrame`. `await reader.refresh()` não garante layout estável.
Chamadas sobrepostas usam a revisão mais recente para concluir a sincronização.

Arrays vazios limpam as coleções. Campos ausentes ou valores falsos (`null`,
`false`, `0`, `""`) preservam as coleções anteriores. Por compatibilidade, os
setters recebem qualquer valor verdadeiro sem validação adicional; o formato
recomendado continua sendo um array. JSON inválido preserva as coleções e não
impede o recálculo. A nova API não atualiza `summary`, não reescreve referências
no HTML e não reinicializa as configurações ou os listeners de conteúdo.

A política existente de progresso é preservada: com retomada habilitada e
contexto já restaurado, a página 5 de 9 passa à 9 de 17. Reduzir conteúdo limita
a página ao novo total, inclusive com a retomada desativada. Os ajustes podem
produzir eventos intermediários; não há evento de conclusão de `refresh`.
Sem mudança de página, a chamada não emite `paginar:page-change`.

## Campos, navegação explícita e capítulos indisponíveis

Os atalhos globais ←/→ e a roda ignoram eventos cujo caminho composto inclua
`input`, `textarea`, `select`, `[contenteditable]:not([contenteditable="false"])`
ou `[data-paginar-ignore]`. O handler retorna sem cancelar o evento. O marcador
protege também descendentes, inclusive em slots e Shadow DOM, qualquer que
seja seu valor:

```html
<section data-paginar-ignore>
	<input type="text">
	<textarea></textarea>
</section>
```

Na primeira restauração de cada contexto, a presença literal de `origin=` na
query (`/[?&]origin=/`) ou um fragmento não vazio prioriza a navegação explícita
sobre o progresso salvo. Isso inclui `?origin=` e valores diferentes de
`next`/`prev`, mas não `?origin`, `?Origin=...` ou nomes codificados. A decisão
fica resolvida para os próximos recálculos. Esse comportamento não implementa
resolução de âncoras; mantém o tratamento de navegação já existente.

Itens de `summary` sem `link`/`file`, ou com `disabled` verdadeiro, continuam
visíveis como `span[aria-disabled="true"]`, sem ação nem tabulação. Título,
autor, ordem e a classe `summary-menu-dropdown-item-disabled` são preservados;
a aparência padrão usa opacidade `0.4` e cursor `default`. Use booleanos em
`disabled`; por compatibilidade, outros valores verdadeiros também desabilitam.

```js
const summary = [
	{ title: 'Introdução', link: '/livro/introducao' },
	{ title: 'Parte I' },
	{ title: 'Indisponível', link: '/livro/indisponivel', disabled: true },
	{ title: 'Continuação', link: '/livro/continuacao' }
]
```

Anterior/próximo pulam itens indisponíveis. O clique no sumário aceita `file`
sem `link`; a navegação sequencial histórica ainda monta o destino por `link`
e pode produzir `undefined?origin=...` se o vizinho só tiver `file`. Essa
limitação foi preservada no port de compatibilidade. Para sequência entre
capítulos, forneça `link`; o tratamento de arquivos nesse fluxo requer mudança
separada. Itens com os dois campos continuam como links que também carregam o
arquivo no clique.

## Busca, painel de trechos e resultados externos

Habilite com `reader-settings='{"search":true}'`. O botão **Ver trechos** alterna
entre o dropdown e o painel lateral, preservando consulta e seleção. Para abrir
diretamente no painel, acrescente `"searchResults":"panel"` às configurações.
Essas opções valem para a montagem e não são persistidas. O painel sobrepõe a
leitura sem repaginar; em telas pequenas ocupa a largura disponível. A lista
rola independentemente e permanece aberta ao selecionar uma ocorrência.
Ao abrir, o foco fica no campo de texto. Clicar em um trecho transfere o foco
para ele; nesse estado, ↑/↓ selecionam o anterior/seguinte, movem o foco e
mantêm o item visível, circulando entre fim e início. Essas setas no campo de
texto não alteram a seleção da lista. Selecionar externos pelas setas emite o
mesmo evento de seleção que o clique, permitindo à aplicação abrir o destino.
Consulte [cores, variáveis CSS e classes](search-customization.md) para
personalizar o painel e seus resultados.

Métodos disponíveis depois de `paginar:ready`:

| Método | Contrato |
| --- | --- |
| `search(query, { view, resultIndex } = {})` | Abre e executa imediatamente. `view`: `panel` ou `compact`; `resultIndex`: índice local a partir de zero (padrão 0; valores além do total circulam). Retorna `false` se desabilitada, bloqueada ou consulta não textual. |
| `getSearchState()` | Snapshot independente: `query`, `requestId`, `open`, `view`, `pending`, `activeIndex` (−1 sem seleção) e `results` (locais seguidos dos externos). |
| `setSearchResults({ requestId, results })` | Substitui somente a lista externa da consulta identificada; `[]` a limpa. Retorna `true` quando aceita e `false` para resposta antiga, busca fechada/limpa/desabilitada/em debounce ou formato inválido. |

`paginar:search` ocorre após o debounce de 180 ms da digitação, imediatamente
na API, ao reabrir e após reindexar conteúdo alterado. Limpar e fechar emitem o
evento com lista vazia; ao fechar, `open` é `false` e a consulta permanece para
reabertura. `requestId` é um inteiro crescente por instância, opaco (pode pular
números). Uma edição, limpeza, fechamento ou mudança de conteúdo invalida a
requisição anterior imediatamente, antes do próximo debounce. Repaginar não
refaz a consulta. Receber resultados externos não dispara outra busca.

Resultados locais têm `{ id, source: 'local', before, match, after, page }`.
Os trechos usam até oito palavras de contexto em cada lado, reticências quando
truncados e a grafia original da ocorrência, inclusive em buscas aproximadas.
`page` é a página medida (ou `null` sem geometria); pode mudar após repaginar.

Para resultados externos, envie objetos com `id` (string não vazia e única na
lista) e `match` (string não vazia). `chapterTitle`, `before`, `after` e `href`
são strings opcionais. Campos extras são ignorados; o leitor acrescenta
`source: 'external'`. Todo trecho é renderizado como texto, inclusive quando
contém marcação HTML. A API copia os objetos; mutar argumentos ou snapshots não
modifica os resultados internos. Chamadas sucessivas substituem os externos;
para acumular lotes ou provedores, reúna-os na aplicação e envie a lista completa.

```js
let controller
reader.addEventListener('paginar:search', async ({ detail }) => {
	controller?.abort()
	const { query, requestId, open } = detail
	if (!open || !query.trim()) return
	controller = new AbortController()
	const { signal } = controller
	try {
		const response = await fetch(`/api/book/search?q=${encodeURIComponent(query)}`, { signal })
		if (!response.ok) throw new Error('Falha na busca')
		const results = await response.json()
		reader.setSearchResults({ requestId, results })
	} catch (error) {
		if (!signal.aborted) console.error('Busca externa indisponível', error)
	}
})

reader.addEventListener('paginar:search-select', ({ detail }) => {
	if (detail.result.source === 'external') {
		// Sua aplicação escolhe a rota, valida o destino e carrega o capítulo.
		openChapter(detail.result.id, detail.query)
	}
})
```

O leitor navega sozinho somente para ocorrências locais. `href` é um dado opaco:
nenhum link é aberto ou conteúdo carregado automaticamente. O evento de seleção
externa permite à aplicação mudar a rota ou carregar conteúdo; na montagem de
destino, `search(query, { view: 'panel', resultIndex })` retoma a ocorrência.
O posicionamento automático na primeira ocorrência não emite `search-select`.
Enter, Shift+Enter e setas percorrem a lista combinada; externos só são abertos
se a aplicação tratar o evento. Sem ocorrências locais, os externos aparecem
sem seleção automática. A aplicação deve excluir resultados do capítulo atual
para evitar duplicação; o leitor não conhece a identidade dos outros capítulos.

Exemplos executáveis: [compacto](../demo/search/index.html),
[painel local](../demo/search/index.html?view=panel) e
[busca no livro](../demo/search-book/index.html). O último simula um serviço
com índice estático e latência, mostra os eventos, alterna resultados externos
e navega entre três capítulos. Seu provedor de exemplo faz busca literal sem
acentos; tolerância a erros e ranking externos ficam a cargo do serviço real.
