import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import usePagination from './usePagination'
import useReaderSettings from './useReaderSettings'
import { findSearchMatches, normalizeSearchText } from '../search'

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
	return { ...normalizeSearchText(text), nodes }
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

export default function useSearch(root, viewport, content) {
	const enabled = ref(false)
	const open = ref(false)
	const query = ref('')
	const input = ref(null)
	const button = ref(null)
	const active = ref(-1)
	const total = ref(0)
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
		enabled.value = settingsString ? JSON.parse(settingsString).search === true : false
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
		ranges.forEach((range, match) => {
			if (!range.startContainer.isConnected) return
			const seen = new Set()
			for (const rect of range.getClientRects()) {
				if (!rect.width || !rect.height) continue
				const key = `${rect.left},${rect.top},${rect.width},${rect.height}`
				// Inline elements can yield the same rectangle as their text node.
				if (seen.has(key)) continue
				seen.add(key)
				measured.push({
					key: `${match}:${key}`, match,
					left: rect.left - origin.left, right: rect.right - origin.left,
					style: {
						left: `${rect.left - origin.left}px`, top: `${rect.top - origin.top}px`,
						width: `${rect.width}px`, height: `${rect.height}px`
					}
				})
			}
		})
		geometry.value = measured
	}

	function navigate(position) {
		if (!ranges.length || useReaderSettings.blocked.value)
			return
		active.value = (position + ranges.length) % ranges.length
		const rect = geometry.value.find(rect => rect.match === active.value)
		if (rect && pageWidth.value)
			usePagination.set(Math.floor(Math.max(0, rect.left) / pageWidth.value) + 1, 'search')
	}

	function run() {
		clearTimeout(timer)
		pending.value = false
		if (!enabled.value || !open.value || !content.value)
			return
		index ||= indexContent(content.value)
		ranges = findSearchMatches(index, query.value)
			.map(match => rangeForMatch(index, match)).filter(Boolean)
		total.value = ranges.length
		active.value = -1
		measure()
		navigate(0)
	}

	function schedule(invalidate = false) {
		if (invalidate) index = null
		clearTimeout(timer)
		ranges = []
		total.value = 0
		active.value = -1
		geometry.value = []
		pending.value = open.value && Boolean(query.value.trim())
		if (pending.value) timer = setTimeout(run, 180)
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
		clearTimeout(timer)
		pending.value = false
		geometry.value = []
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
	watch(query, () => schedule())
	watch(useReaderSettings.blocked, blocked => {
		if (!blocked && open.value && active.value < 0)
			navigate(0)
	})
	return {
		enabled, open, query, input, button, active, total, rectangles, pending,
		init, show, close, step, measure,
		status: computed(() => pending.value ? 'Buscando…' : total.value
			? `${active.value >= 0 ? `${active.value + 1} de ` : ''}${total.value} ${total.value === 1 ? 'ocorrência' : 'ocorrências'}`
			: query.value.trim() ? 'Nenhuma ocorrência' : 'Digite para buscar')
	}
}
