import { reactive, computed, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import useEstimatePages from './useEstimatePages'

const state = reactive({
	currentPage: 1
})

const currentPage = computed(() => state.currentPage)
const totalPages = computed(() => useEstimatePages.totalPages.value)

function init(viewport, content) {
	useEstimatePages.estimate(viewport, content)
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
	if ((state.currentPage + 1) <= totalPages.value) {
		state.currentPage = state.currentPage + 1
	}
}
onKeyStroke('ArrowRight', (e) => {
	e.preventDefault()
	next()
})

function prev() {
	if ((state.currentPage - 1) > 0) {
		state.currentPage = state.currentPage - 1
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
