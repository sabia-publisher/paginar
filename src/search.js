// Plain text only: consumers render each part as text, never as HTML.
export function searchExcerpt(text, { start, end }, contextWords = 8) {
	// Walk only nearby words; do not tokenize the entire chapter for every hit.
	function boundary(offset, direction) {
		let words = 0
		let inWord = false
		while (offset >= 0 && offset < text.length) {
			const isWord = /\S/u.test(text[offset])
			if (isWord && !inWord && ++words > contextWords) break
			inWord = isWord
			offset += direction
		}
		return offset
	}
	const left = boundary(start - 1, -1)
	const right = boundary(end, 1)
	const compact = value => value.replace(/\s+/gu, ' ')
	return {
		before: (left >= 0 ? '… ' : '') + compact(text.slice(left + 1, start)).trimStart(),
		match: compact(text.slice(start, end)),
		after: compact(text.slice(end, right)).trimEnd() + (right < text.length ? ' …' : '')
	}
}

export function externalSearchResults(results) {
	if (!Array.isArray(results)) return null
	const ids = new Set()
	const items = []
	for (const result of results) {
		if (!result || typeof result.id !== 'string' || !result.id || ids.has(result.id) ||
			typeof result.match !== 'string' || !result.match.trim()) return null
		ids.add(result.id)
		const item = { id: result.id, source: 'external' }
		for (const key of ['chapterTitle', 'before', 'match', 'after', 'href']) {
			if (result[key] !== undefined && typeof result[key] !== 'string') return null
			item[key] = result[key] || ''
		}
		items.push(item)
	}
	return items
}

// Keep offsets into the original UTF-16 text so matches can become DOM Ranges.
export function normalizeSearchText(value) {
	let text = ''
	const starts = []
	const ends = []
	let offset = 0
	for (const character of value) {
		const end = offset + character.length
		const normalized = character.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
		if (!normalized && ends.length)
			ends[ends.length - 1] = end
		for (const part of normalized) {
			const next = /[\p{L}\p{N}]/u.test(part) ? part : ' '
			if (next === ' ' && text.endsWith(' ')) {
				ends[ends.length - 1] = end
				continue
			}
			text += next
			for (let index = 0; index < next.length; index++) {
				starts.push(offset)
				ends.push(end)
			}
		}
		offset = end
	}
	return { text, starts, ends }
}

// At most one insertion, deletion, substitution or adjacent transposition.
function nearWord(left, right) {
	if (left === right)
		return true
	if (left.length < 5 || Math.abs(left.length - right.length) > 1)
		return false
	let index = 0
	while (index < Math.min(left.length, right.length) && left[index] === right[index])
		index++
	if (left.length === right.length) {
		return left.slice(index + 1) === right.slice(index + 1) || (
			left[index] === right[index + 1] && left[index + 1] === right[index] &&
			left.slice(index + 2) === right.slice(index + 2)
		)
	}
	return left.length > right.length
		? left.slice(index + 1) === right.slice(index)
		: left.slice(index) === right.slice(index + 1)
}

export function findSearchMatches(index, query) {
	const needle = normalizeSearchText(query).text.trim()
	if (!needle)
		return []
	const hits = []
	let position = index.text.indexOf(needle)
	while (position !== -1) {
		hits.push({ start: position, end: position + needle.length })
		position = index.text.indexOf(needle, position + needle.length)
	}
	const words = needle.split(' ')
	const tokens = Array.from(index.text.matchAll(/[\p{L}\p{N}]+/gu))
	const exactCount = hits.length
	let exactIndex = 0
	for (let offset = 0; offset <= tokens.length - words.length; offset++) {
		const start = tokens[offset].index
		const last = tokens[offset + words.length - 1]
		const end = last.index + last[0].length
		while (exactIndex < exactCount && hits[exactIndex].end <= start)
			exactIndex++
		if (exactIndex < exactCount && hits[exactIndex].start < end)
			continue
		if (words.every((word, part) => nearWord(word, tokens[offset + part][0])))
			hits.push({ start, end, approximate: true })
	}
	return hits.sort((left, right) => left.start - right.start)
		.map(hit => ({ start: index.starts[hit.start], end: index.ends[hit.end - 1] }))
}
