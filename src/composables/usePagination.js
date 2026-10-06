import { reactive, computed, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'

import useReaderSettings from './useReaderSettings'
import useEstimatePages from './useEstimatePages'
import useTextContent from './useTextContent'
import useBrowser from './useBrowser'
import useReadingProgress from './useReadingProgress'
import { isPaginarIgnoredEvent } from '../paginationEvents'

const state = reactive({
	currentPage: 1,
	changeSource: 'initial',
	nextTry: 0,
	prevTry: 0,
	willRedirect: false
})

const currentPage = computed(() => state.currentPage)
const changeSource = computed(() => state.changeSource)
const totalPages = computed(() => useEstimatePages.totalPages.value)

function init(viewport, content, estimate = null) {
	const updatePages = estimate || (() => useEstimatePages.estimate(viewport, content))
	// Measure immediately, but let the parent restore progress only after child
	// controls (notably the page slider) have finished their mount cycle.
	useEstimatePages.estimate(viewport, content)

	// check if there is a query string for oring, and
	// if previews chapter was the next one. If so,
	// start from the end, as we are coming backwards
	const urlParams = new URLSearchParams(window.location.search)
	const origin = urlParams.get('origin')
	if (origin && origin === 'next') {
		setTimeout(() => {
			set(totalPages.value)
		}, 200)
	}

	if (!useBrowser.isApple && !useBrowser.isSafari) {
		addEventListener('wheel', onWheel)
	}

	observeLayout(viewport, content, updatePages)
}

let observer = null
let fallbackTimer = null
let observedFrame = 0

// Page count depends only on the viewport and content box sizes, so repaginate
// when either changes (late web fonts, images, slot edits) instead of polling.
function observeLayout(viewport, content, updatePages) {
	stopObserving()
	if (typeof ResizeObserver !== 'function') {
		fallbackTimer = setInterval(updatePages, 5000)
		return
	}

	const sizes = new WeakMap()
	observer = new ResizeObserver(entries => {
		let changed = false
		for (const { target, borderBoxSize, contentRect } of entries) {
			const box = borderBoxSize?.[0]
			const size = box
				? `${box.inlineSize}x${box.blockSize}`
				: `${contentRect.width}x${contentRect.height}`
			// The first notification only records the size already measured on mount.
			if (sizes.has(target) && sizes.get(target) !== size)
				changed = true
			sizes.set(target, size)
		}
		if (changed && !observedFrame)
			observedFrame = requestAnimationFrame(() => {
				observedFrame = 0
				updatePages()
			})
	})
	for (const element of [viewport.value, content.value])
		if (element)
			observer.observe(element)
}

function stopObserving() {
	observer?.disconnect()
	observer = null
	clearInterval(fallbackTimer)
	fallbackTimer = null
	cancelAnimationFrame(observedFrame)
	observedFrame = 0
}

// when resizing the viewport, totalPages change
// this watch is to currentPage inside totalPages range
watch(totalPages, () => {
	if (totalPages.value < currentPage.value) {
		set(totalPages.value)
	}
})

// navigate by increase/decrease value
function next(usingScroll = false, source = 'next') {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage + 1) <= totalPages.value) {
			set(state.currentPage + 1, source)
		} else {
			// prevent going too fast to next chapter on
			// stronger scroll
			if (usingScroll && state.nextTry < 4) {
				state.nextTry += 1
				return
			}

			if (state.willRedirect === false) {
				const context = useTextContent.context.value
				if (context.surround?.after) {
					window.location.href = context.surround.after.link + (`?origin=prev`)
					state.willRedirect = true
				}
			}
		}
	}
}
onKeyStroke('ArrowRight', (e) => {
	if (isPaginarIgnoredEvent(e))
		return
	e.preventDefault()
	next(false, 'keyboard')
})

function onWheel(event) {
	if (isPaginarIgnoredEvent(event))
		return
	if (event.wheelDelta < 0) {
		next(true, 'wheel')
	} else {
		prev(true, 'wheel')
	}
};

function prev(usingScroll = false, source = 'previous') {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage - 1) > 0) {
			set(state.currentPage - 1, source)
		} else {
			// prevent going too fast to prev chapter on
			// stronger scroll
			if (usingScroll && state.prevTry < 4) {
				state.prevTry += 1
				return
			}

			if (state.willRedirect === false) {
				const context = useTextContent.context.value
				if (context.surround?.before) {
					window.location.href = context.surround.before.link + (`?origin=next`)
				}
				state.willRedirect = true
			}
		}
	}
}
onKeyStroke('ArrowLeft', (e) => {
	if (isPaginarIgnoredEvent(e))
		return
	e.preventDefault()
	prev(false, 'keyboard')
})

// navigate to specific page
function set(val, source = 'go-to-page') {
	const page = Math.min(totalPages.value, Math.max(1, Number(val) || 1))
	state.changeSource = source
	state.currentPage = page
	useReadingProgress.save(page, totalPages.value)
}

export default {
	currentPage,
	totalPages,
	changeSource,
	next,
	prev,
	init,
	stopObserving,
	set
}
