// Exemplo de aplicação hospedeira: o leitor não conhece este índice nem as URLs.
const reader = document.querySelector('paginate-content')
const log = document.querySelector('#log')
const params = new URLSearchParams(location.search)
const chapter = ['1', '2', '3'].includes(params.get('chapter')) ? params.get('chapter') : '1'
const titles = { 1: 'A partida', 2: 'O jardim', 3: 'O litoral' }
document.querySelector('#chapter-title').textContent = titles[chapter]
const response = await fetch(`./chapter${chapter}.html`)
if (!response.ok) throw new Error('Não foi possível carregar o capítulo')
document.querySelector('#chapter').innerHTML = await response.text()

let controller
reader.addEventListener('paginar:search', async ({ detail }) => {
	controller?.abort()
	const { query, requestId, open, results } = detail
	log.textContent = `paginar:search #${requestId}: “${query}” · ${results.length} locais`
	if (!open || !query.trim() || !document.querySelector('#external').checked) return
	controller = new AbortController()
	const { signal } = controller
	try {
		// Substitua pelo seu endpoint, passando query e o identificador do livro.
		// Aqui, um índice estático simula o serviço; capítulos externos não entram no DOM.
		const response = await fetch('./search-index.json', { signal })
		if (!response.ok) throw new Error('Falha na busca externa')
		const index = await response.json()
		await new Promise(resolve => setTimeout(resolve, 600)) // simula latência
		if (signal.aborted) return
		const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
		const needle = normalize(query.trim())
		if (!needle) return
		const external = []
		for (const item of index) {
			if (item.chapter === chapter) continue
			let occurrence = 0
			for (const text of item.excerpts) {
				let start = normalize(text).indexOf(needle)
				while (start >= 0) {
					const href = new URL('./index.html', location.href)
					href.search = new URLSearchParams({ chapter: item.chapter, query, occurrence })
					external.push({
						id: `${item.chapter}:${occurrence++}`, chapterTitle: item.title,
						before: text.slice(0, start), match: text.slice(start, start + needle.length),
						after: text.slice(start + needle.length), href: href.href
					})
					start = normalize(text).indexOf(needle, start + needle.length)
				}
			}
		}
		const accepted = reader.setSearchResults({ requestId, results: external })
		log.textContent = `setSearchResults #${requestId}: ${external.length} externos · ${accepted ? 'aceitos' : 'resposta antiga descartada'}`
	} catch (error) {
		if (!signal.aborted) log.textContent = `${error.message}. Os resultados locais continuam disponíveis.`
	}
})

reader.addEventListener('paginar:search-select', ({ detail }) => {
	const { result } = detail
	log.textContent = `paginar:search-select: ${result.source} · ${result.id}`
	if (result.source === 'external') {
		// A aplicação controla o destino; valide URLs recebidas de serviços externos.
		const destination = new URL(result.href, location.href)
		if (destination.origin === location.origin && destination.pathname === location.pathname)
			location.assign(destination.href)
	}
})

reader.addEventListener('paginar:ready', () => {
	log.textContent = 'Pronto. Os eventos e a aceitação dos resultados aparecem aqui.'
	if (params.has('query')) reader.search(params.get('query'), {
		view: 'panel', resultIndex: Number(params.get('occurrence')) || 0
	})
})
document.querySelectorAll('[data-query]').forEach(button => {
	button.addEventListener('click', () => reader.search(button.dataset.query, { view: 'panel' }))
})
document.querySelector('#external').addEventListener('change', () => {
	reader.search(reader.getSearchState().query, { view: 'panel' })
})
await import('../../dist/index.es.js')
