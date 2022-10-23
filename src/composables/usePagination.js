import { reactive, computed, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'

import useReaderSettings from './useReaderSettings'
import useEstimatePages from './useEstimatePages'
import useTextContent from './useTextContent'

const state = reactive({
	currentPage: 1,
	nextTry: 0,
	prevTry: 0,
	willRedirect: false
})

const currentPage = computed(() => state.currentPage)
const totalPages = computed(() => useEstimatePages.totalPages.value)

function init(viewport, content) {
	useEstimatePages.estimate(viewport, content)

	// check if there is a query string for oring, and
	// if previews chapter was the next one. If so,
	// start from the end, as we are coming backwards
	const urlParams = new URLSearchParams(window.location.search)
	const origin = urlParams.get('origin')
	if (origin && origin === 'next') {
		setTimeout(() => {
			state.currentPage = totalPages.value
		}, 200)
	}

	addEventListener('wheel', onWheel)

	setInterval(() => {
		useEstimatePages.estimate(viewport, content)
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
function next(usingScroll = false) {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage + 1) <= totalPages.value) {
			state.currentPage = state.currentPage + 1
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
	next()
})

function onWheel(event) {
	if (event.wheelDelta < 0) {
		next(true)
	} else {
		prev(true)
	}
};

function prev(usingScroll = false) {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage - 1) > 0) {
			state.currentPage = state.currentPage - 1
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
	prev()
})

// navigate to specific page
function set(val) {
	state.currentPage = val
}

export default {
	currentPage,
	totalPages,
	next,
	prev,
	init,
	set
}
