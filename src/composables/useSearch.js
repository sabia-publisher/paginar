import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import usePagination from './usePagination'
import useReaderSettings from './useReaderSettings'
import { externalSearchResults, findSearchMatches, normalizeSearchText, searchExcerpt } from '../search'

export const searchKey = Symbol('paginarSearch')

// Walk the rendered slot tree as well as HTML loaded inside the shadow root.
function indexContent(root) {
	let text = ''
	const nodes = []
	function visit(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			nodes.push({ node, start: text.length, end: text.length + node.length })
			text += node.data
			return
		}
		if (node.nodeType !== Node.ELEMENT_NODE)
			return
		if (node.matches('script, style, template, noscript, [hidden], [aria-hidden="true"]'))
			return
		const style = getComputedStyle(node)
		if (style.display === 'none' || style.visibility === 'hidden')
			return
		const separator = node.tagName === 'BR' || !['inline', 'contents'].includes(style.display)
		if (separator) text += ' '
		const children = node.tagName === 'SLOT'
			? node.assignedNodes({ flatten: true })
			: node.childNodes
		for (const child of children.length ? children : node.childNodes)
			visit(child)
		if (separator) text += ' '
	}
	visit(root)
	return { ...normalizeSearchText(text), original: text, nodes }
}

function rangeForMatch(index, match) {
	// Binary search keeps mapping a common word in a long chapter inexpensive.
	function findNode(offset) {
		let low = 0
		let high = index.nodes.length - 1
		while (low <= high) {
			const middle = (low + high) >> 1
			const item = index.nodes[middle]
			if (offset < item.start) high = middle - 1
			else if (offset >= item.end) low = middle + 1
			else return item
		}
	}
	const first = findNode(match.start)
	const last = findNode(match.end - 1)
	if (!first || !last || first.node.getRootNode() !== last.node.getRootNode())
		return null
	const range = document.createRange()
	range.setStart(first.node, match.start - first.start)
	range.setEnd(last.node, match.end - last.start)
	return range
}

export default function useSearch(root, viewport, content, emit) {
	const enabled = ref(false)
	const open = ref(false)
	const query = ref('')
	const input = ref(null)
	const button = ref(null)
	const active = ref(-1)
	const panel = ref(false)
	const localResults = shallowRef([])
	const externalResults = shallowRef([])
	const results = computed(() => [...localResults.value, ...externalResults.value])
	const total = computed(() => results.value.length)
	let requestId = 0
	const geometry = shallowRef([])
	const pageWidth = ref(0)
	const rectangles = computed(() => {
		if (!open.value) return []
		// Include adjacent pages so highlights accompany the sliding text.
		const left = (usePagination.currentPage.value - 2) * pageWidth.value
		const right = (usePagination.currentPage.value + 1) * pageWidth.value
		return geometry.value.filter(rect => rect.left < right && rect.right > left)
			.map(rect => ({ ...rect, active: rect.match === active.value }))
	})
	const pending = ref(false)
	let ranges = []
	let index = null
	let timer = null
	let observer = null
	let host = null

	function init(settingsString) {
		const settings = settingsString ? JSON.parse(settingsString) : {}
		enabled.value = settings.search === true
		panel.value = settings.searchResults === 'panel'
	}

	function getState() {
		return {
			query: query.value, requestId, open: open.value, view: panel.value ? 'panel' : 'compact',
			pending: pending.value, activeIndex: active.value,
			results: results.value.map(result => ({ ...result }))
		}
	}

	function notifySearch() {
		emit('search', { query: query.value, requestId, open: open.value,
			results: localResults.value.map(result => ({ ...result })) })
	}

	function setResults(response) {
		if (!enabled.value || !open.value || pending.value || !query.value.trim() ||
			response?.requestId !== requestId) return false
		const items = externalSearchResults(response.results)
		if (!items) return false
		const selected = results.value[active.value]
		externalResults.value = items
		if (selected?.source === 'external')
			active.value = results.value.findIndex(item => item.source === 'external' && item.id === selected.id)
		return true
	}

	function measure() {
		const columns = viewport.value?.querySelector('.columnsArea')
		if (!open.value || !ranges.length || !columns) {
			geometry.value = []
			return
		}
		const origin = columns.getBoundingClientRect()
		pageWidth.value = viewport.value.getBoundingClientRect().width
		const measured = []
		const firstRects = new Map()
		ranges.forEach((range, match) => {
			if (!range.startContainer.isConnected) return
			const seen = new Set()
			for (const rect of range.getClientRects()) {
				if (!rect.width || !rect.height) continue
				const key = `${rect.left},${rect.top},${rect.width},${rect.height}`
				// Inline elements can yield the same rectangle as their text node.
				if (seen.has(key)) continue
				seen.add(key)
				const rectangle = {
					key: `${match}:${key}`, match,
					left: rect.left - origin.left, right: rect.right - origin.left,
					style: {
						left: `${rect.left - origin.left}px`, top: `${rect.top - origin.top}px`,
						width: `${rect.width}px`, height: `${rect.height}px`
					}
				}
				measured.push(rectangle)
				if (!firstRects.has(match)) firstRects.set(match, rectangle)
			}
		})
		geometry.value = measured
		localResults.value = localResults.value.map((result, match) => {
			const rect = firstRects.get(match)
			return { ...result, page: rect && pageWidth.value
				? Math.floor(Math.max(0, rect.left) / pageWidth.value) + 1 : null }
		})
	}

	function navigate(position, notify = true) {
		if (!total.value || useReaderSettings.blocked.value)
			return
		active.value = ((position % total.value) + total.value) % total.value
		const result = results.value[active.value]
		const rect = geometry.value.find(rect => rect.match === active.value)
		if (result.source === 'local' && rect && pageWidth.value)
			usePagination.set(Math.floor(Math.max(0, rect.left) / pageWidth.value) + 1, 'search')
		if (notify)
			emit('search-select', { query: query.value, requestId, result: { ...result }, index: active.value })
	}

	function run(position = 0) {
		clearTimeout(timer)
		pending.value = false
		if (!enabled.value || !open.value || !content.value)
			return
		index ||= indexContent(content.value)
		requestId++
		externalResults.value = []
		ranges = []
		localResults.value = findSearchMatches(index, query.value).flatMap(match => {
			const range = rangeForMatch(index, match)
			if (!range) return []
			ranges.push(range)
			return [{ id: `local:${match.start}:${match.end}`, source: 'local',
				...searchExcerpt(index.original, match), page: null }]
		})
		active.value = -1
		measure()
		navigate(position, false)
		notifySearch()
	}

	function schedule(invalidate = false) {
		if (invalidate) index = null
		clearTimeout(timer)
		requestId++
		ranges = []
		localResults.value = []
		externalResults.value = []
		active.value = -1
		geometry.value = []
		pending.value = open.value && Boolean(query.value.trim())
		if (pending.value) timer = setTimeout(run, 180)
		else if (enabled.value && open.value) notifySearch()
	}

	function searchText(value, options = {}) {
		if (!enabled.value || useReaderSettings.blocked.value || typeof value !== 'string') return false
		open.value = true
		if (options.view === 'panel' || options.view === 'compact') panel.value = options.view === 'panel'
		query.value = value
		run(Number.isInteger(options.resultIndex) && options.resultIndex >= 0 ? options.resultIndex : 0)
		nextTick(() => input.value?.focus({ preventScroll: true }))
		return true
	}

	async function show() {
		if (!enabled.value || useReaderSettings.blocked.value)
			return
		open.value = true
		run()
		await nextTick()
		input.value?.focus({ preventScroll: true })
		input.value?.select()
	}

	function close() {
		open.value = false
		schedule()
		notifySearch()
		button.value?.focus({ preventScroll: true })
	}

	function step(direction) {
		if (pending.value) run()
		else navigate(active.value + direction)
	}

	function onKeydown(event) {
		if (!enabled.value || event.defaultPrevented)
			return
		const path = event.composedPath()
		const otherReader = path.find(node => node?.tagName === 'PAGINATE-CONTENT')
		if (otherReader && otherReader !== host)
			return
		if (event.key === 'Escape' && open.value) {
			event.preventDefault()
			close()
		} else if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f') {
			// Keep browser find available in unrelated editing fields on the host page.
			if (!path.includes(host) && path.some(node =>
				node?.matches?.('input, textarea, select, [contenteditable="true"]')))
				return
			if (useReaderSettings.blocked.value || !host?.getClientRects().length)
				return
			event.preventDefault()
			show()
		}
	}

	onMounted(() => {
		host = root.value.getRootNode().host
		window.addEventListener('keydown', onKeydown, true)
		observer = new MutationObserver(() => schedule(true))
		observer.observe(content.value, { subtree: true, childList: true, characterData: true })
		if (host) observer.observe(host, { subtree: true, childList: true, characterData: true })
		content.value.addEventListener('slotchange', invalidate)
	})
	function invalidate() { schedule(true) }
	onBeforeUnmount(() => {
		clearTimeout(timer)
		observer?.disconnect()
		window.removeEventListener('keydown', onKeydown, true)
		content.value?.removeEventListener('slotchange', invalidate)
		ranges = []
		index = null
	})
	watch(query, () => schedule(), { flush: 'sync' })
	watch(useReaderSettings.blocked, blocked => {
		if (!blocked && open.value && active.value < 0 && localResults.value.length)
			navigate(0, false)
	})
	return {
		enabled, open, query, input, button, active, total, rectangles, pending, panel, results,
		init, show, close, step, measure, navigate, getState, setResults, searchText,
		status: computed(() => pending.value ? 'Buscando…' : total.value
			? `${active.value >= 0 ? `${active.value + 1} de ` : ''}${total.value} ${total.value === 1 ? 'ocorrência' : 'ocorrências'}`
			: query.value.trim() ? 'Nenhuma ocorrência' : 'Digite para buscar')
	}
}
