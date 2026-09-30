import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

// The package ships a browser ES module without declaring Node's module type.
const source = await readFile(new URL('../src/search.js', import.meta.url), 'utf8')
const { normalizeSearchText, findSearchMatches, searchExcerpt, externalSearchResults } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const find = (text, query) => findSearchMatches(normalizeSearchText(text), query)
const excerpts = (text, query) => find(text, query).map(hit => text.slice(hit.start, hit.end))

test('accents, cedilla, case, decomposed Unicode and original offsets', () => {
	assert.deepEqual(excerpts('😀 AÇÃO ação ação', 'ACAO'), ['AÇÃO', 'ação', 'ação'])
	assert.deepEqual(excerpts('O café cafe\u0301!', 'cafe'), ['café', 'cafe\u0301'])
})

test('phrases tolerate whitespace and punctuation', () => {
	assert.deepEqual(excerpts('São\n  Paulo; são—paulo', 'sao paulo'), ['São\n  Paulo', 'são—paulo'])
	assert.equal(find('arte\u00a0contemporânea', 'arte contemporanea').length, 1)
})

test('one typo in longer words: deletion, insertion, substitution, transposition', () => {
	for (const query of ['leitura', 'leitua', 'leittura', 'leituraa', 'leitira', 'lietura'])
		assert.deepEqual(excerpts('Uma leitura atenta.', query), ['leitura'])
	assert.deepEqual(excerpts('Uma leitura atenta.', 'lietura atenta'), ['leitura atenta'])
	assert.equal(find('leitura', 'lxxtura').length, 0)
	assert.equal(find('casa', 'caza').length, 0)
})

test('exact and fuzzy hits occur once each and stay in reading order', () => {
	assert.deepEqual(excerpts('leitira leitura leitua leitura', 'leitura'), ['leitira', 'leitura', 'leitua', 'leitura'])
	assert.deepEqual(excerpts('banana banana', 'ana'), ['ana', 'ana'])
	assert.deepEqual(excerpts('releitura leitura', 'leitura'), ['leitura', 'leitura'])
})

test('empty queries, punctuation-only queries and missing terms', () => {
	for (const query of ['', '   ', '---', 'inexistente'])
		assert.deepEqual(find('ação e leitura', query), [])
})

test('excerpts preserve original accents, phrase text and surrounding whitespace', () => {
	const text = 'Antes de São\n Paulo, seguimos depois.'
	const [match] = find(text, 'sao paulo')
	assert.deepEqual(searchExcerpt(text, match), {
		before: 'Antes de ', match: 'São Paulo', after: ', seguimos depois.'
	})
	assert.deepEqual(searchExcerpt('ação', { start: 0, end: 4 }), { before: '', match: 'ação', after: '' })
})

test('excerpts truncate context at word boundaries and retain literal markup', () => {
	const text = 'um dois três quatro alvo cinco seis sete oito'
	assert.deepEqual(searchExcerpt(text, find(text, 'alvo')[0], 2), {
		before: '… três quatro ', match: 'alvo', after: ' cinco seis …'
	})
	const literal = '<img onerror=alert(1)> alvo <script>'
	assert.equal(searchExcerpt(literal, find(literal, 'alvo')[0]).before, '<img onerror=alert(1)> ')
})

test('external results are copied, typed and unique, with caller fields excluded', () => {
	const input = [{ id: 'ch2:1', match: '<b>ação</b>', page: 99, source: 'local' }]
	const result = externalSearchResults(input)
	assert.deepEqual(result, [{ id: 'ch2:1', source: 'external', chapterTitle: '',
		before: '', match: '<b>ação</b>', after: '', href: '' }])
	input[0].match = 'changed'
	assert.equal(result[0].match, '<b>ação</b>')
	for (const invalid of [null, {}, [null], [{ id: '', match: 'x' }],
		[{ id: 'x', match: ' ' }], [{ id: 'x', match: 'x', href: {} }], [...input, ...input]])
		assert.equal(externalSearchResults(invalid), null)
	assert.deepEqual(externalSearchResults([]), [])
})
