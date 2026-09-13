import { computed, reactive } from 'vue'

import useReaderSettings from './useReaderSettings'
import useTextContent from './useTextContent'

const STORAGE_KEY = 'paginar:reading-progress:v1'

const state = reactive({
	bookId: null,
	contextKey: null,
	restored: false,
	suspended: false,
	currentPage: 1,
	totalPages: 1
})

const available = computed(() => useReaderSettings.readingProgressAvailable.value)
const enabled = computed(() => useReaderSettings.readingProgressEnabled.value)

function init(settingsString, fallbackTitle) {
	let settings = null
	state.bookId = null
	state.contextKey = null
	state.restored = false

	try {
		settings = settingsString ? JSON.parse(settingsString) : null
	} catch (error) {
		return
	}

	if (!settings?.readingProgress ||
		typeof settings.readingProgress !== 'object' ||
		Array.isArray(settings.readingProgress)
	)
		return

	const configuredId = settings.readingProgress.id
	state.bookId = typeof configuredId === 'string' && configuredId.trim()
		? configuredId.trim()
		: fallbackTitle || window.location.pathname
}

function getContextKey() {
	if (!state.bookId)
		return null

	const chapter = useTextContent.contextId.value || window.location.pathname
	return `${state.bookId}::${chapter}`
}

function readStore() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
		return saved?.version === 1 && saved.entries && typeof saved.entries === 'object'
			? saved
			: { version: 1, entries: {} }
	} catch (error) {
		return { version: 1, entries: {} }
	}
}

function writeStore(store) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
	} catch (error) {
		// Reading continues normally when storage is unavailable.
	}
}

function percentageFor(page, total) {
	if (total <= 1)
		return 0

	return Math.min(1, Math.max(0, (page - 1) / (total - 1)))
}

function pageFor(percentage, total) {
	return Math.min(total, Math.max(1, Math.round(percentage * (total - 1)) + 1))
}

function repaginate(page, previousTotal, nextTotal) {
	const key = getContextKey()
	if (!available.value || !enabled.value || !state.restored ||
		!key || key !== state.contextKey || previousTotal < 1 || nextTotal < 1
	)
		return null

	const percentage = percentageFor(page, previousTotal)
	return pageFor(percentage, nextTotal)
}

function save(page, total) {
	const key = getContextKey()
	if (!available.value || !enabled.value || !state.restored || state.suspended ||
		!key || key !== state.contextKey || total < 1
	)
		return

	const store = readStore()
	store.entries[key] = percentageFor(page, total)
	writeStore(store)
}

function suspend() {
	state.suspended = true
}

function resume() {
	state.suspended = false
}

function remove() {
	const key = getContextKey()
	if (!key)
		return

	const store = readStore()
	delete store.entries[key]
	writeStore(store)
}

function sync(page, total, allowRestore = false) {
	state.currentPage = page
	state.totalPages = total
	const key = getContextKey()
	if (!available.value || !enabled.value || !key)
		return

	if (state.contextKey !== key) {
		state.contextKey = key
		state.restored = false
	}

	if (!state.restored) {
		if (!allowRestore)
			return

		const percentage = readStore().entries[key]
		if (Number.isFinite(percentage) && percentage >= 0 && percentage <= 1) {
			if (total <= 1 && percentage > 0)
				return

			state.restored = true
			const targetPage = pageFor(percentage, total)
			if (targetPage !== page)
				return targetPage
			return
		}

		state.restored = true
	}

	save(page, total)
}

function setEnabled(value) {
	useReaderSettings.setReadingProgressEnabled(value)
	state.restored = true

	if (value)
		save(state.currentPage, state.totalPages)
	else
		remove()
}

export default {
	available,
	enabled,
	init,
	remove,
	repaginate,
	resume,
	save,
	setEnabled,
	suspend,
	sync
}
