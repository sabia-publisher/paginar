import { reactive, computed, watch } from 'vue'
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
function goTo(val) {
	if (
		(state.currentPage + val) > 0 &&
		(state.currentPage + val) <= totalPages.value
	) {
		state.currentPage = state.currentPage + val
	}
}

// navigate to specific page
function set(val) {
	state.currentPage = val
}

export default {
	currentPage,
	totalPages,
	goTo,
	init,
	set
}
