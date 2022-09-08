import { ref, watch } from 'vue'
import { useEstimatePages } from './useEstimatePages'

export function usePagination(viewport, content) {
	const currentPage = ref(1)
	const totalPages = ref(useEstimatePages(viewport, content).totalPages)

	function goTo(val) {
		if (
			(currentPage.value + val) > 0 &&
			(currentPage.value + val) <= totalPages.value
		) {
			currentPage.value = currentPage.value + val
		}
	}

	return {
		currentPage,
		totalPages,
		goTo
	}
}
