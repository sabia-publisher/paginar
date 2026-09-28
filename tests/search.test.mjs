import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

// The package ships a browser ES module without declaring Node's module type.
const source = await readFile(new URL('../src/search.js', import.meta.url), 'utf8')
const { normalizeSearchText, findSearchMatches } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
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
