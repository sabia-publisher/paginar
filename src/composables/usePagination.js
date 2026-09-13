import { reactive, computed, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'

import useReaderSettings from './useReaderSettings'
import useEstimatePages from './useEstimatePages'
import useTextContent from './useTextContent'
import useBrowser from './useBrowser'
import useReadingProgress from './useReadingProgress'

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

	setInterval(() => {
		updatePages()
	}, 5000)
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
	e.preventDefault()
	next(false, 'keyboard')
})

function onWheel(event) {
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
	set
}
