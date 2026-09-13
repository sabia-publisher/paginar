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

As origens (`source`) conhecidas são `next-button`, `previous-button`, `slider`,
`keyboard`, `wheel`, `swipe`, `summary`, `api`, `reading-progress`,
`repagination` e `go-to-page`.

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
		readingProgressEnabled
	},
	content: { bookTitle, chapterTitle, chapter }
}
```

Veja o [exemplo interativo](../demo/events/index.html), que exibe o estado e o
histórico de eventos ao vivo.
