import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const load = async file => import(`data:text/javascript;base64,${Buffer.from(await readFile(new URL(file, import.meta.url))).toString('base64')}`)
const { isNavigable, nearestNavigable } = await load('../src/summary.js')
const { isPaginarIgnoredEvent } = await load('../src/paginationEvents.js')

test('summary navigability preserves historical truthiness', () => {
	for (const item of [null, {}, { disabled: true, link: '/x' }, { disabled: 'false', file: 'x' }])
		assert.equal(isNavigable(item), false)
	for (const item of [{ link: '/x' }, { file: 'x' }, { disabled: 0, link: ' ' }])
		assert.equal(isNavigable(item), true)
})

test('neighbors skip consecutive unavailable entries in the full summary', () => {
	const chapters = [{ title: 'Heading' }, { link: '/a' }, {}, { link: '/hidden', disabled: true }, { file: 'b.html' }, {}]
	assert.equal(nearestNavigable(chapters, 2, 1), chapters[4])
	assert.equal(nearestNavigable(chapters, 3, -1), chapters[1])
	assert.equal(nearestNavigable(chapters, 0, -1), null)
	assert.equal(nearestNavigable(chapters, 5, 1), null)
	assert.equal(nearestNavigable([], 0, 1), null)
	assert.equal(nearestNavigable([{}, { disabled: true, link: '/x' }], 0, 1), null)
})

test('ignored events use only element nodes in composedPath, without target fallback', () => {
	const match = { nodeType: 1, matches: () => true }
	assert.equal(isPaginarIgnoredEvent({ composedPath: () => [null, {}, { nodeType: 3 }, match] }), true)
	assert.equal(isPaginarIgnoredEvent({ composedPath: () => [{ nodeType: 1, matches: () => false }] }), false)
	assert.equal(isPaginarIgnoredEvent({ target: match }), false)
})
