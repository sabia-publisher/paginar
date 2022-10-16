import { reactive, computed, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'

import useReaderSettings from './useReaderSettings'
import useEstimatePages from './useEstimatePages'

const state = reactive({
	currentPage: 1
})

const currentPage = computed(() => state.currentPage)
const totalPages = computed(() => useEstimatePages.totalPages.value)

function init(viewport, content) {
	useEstimatePages.estimate(viewport, content)
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
function next() {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage + 1) <= totalPages.value) {
			state.currentPage = state.currentPage + 1
		}
	}
}
onKeyStroke('ArrowRight', (e) => {
	e.preventDefault()
	next()
})

function onWheel(event) {
	if (event.wheelDelta < 0) {
		next()
	} else {
		prev()
	}
};

function prev() {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage - 1) > 0) {
			state.currentPage = state.currentPage - 1
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
