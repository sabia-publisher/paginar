import { ref } from 'vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

export function useEstimatePages(viewport, content) {

	const totalPages = ref(1)

	function estimatePages() {
		if (viewport && content) {
			const { width: viewportWidth } = viewport.value.getBoundingClientRect()
			const { width: contentWidth } = content.value.getBoundingClientRect()

			if (contentWidth > viewportWidth) {
				totalPages.value = Math.ceil(contentWidth / viewportWidth)

			} else {
				totalPages.value = 1
			}
		} else {
			totalPages.value = 1
		}
	}

	const { width, height } = useWindowSize()

	watchDebounced(
		width,
		() => { estimatePages() },
		{ debounce: 250, maxWait: 500 },
	)

	estimatePages()

	return {
		totalPages,
		width,
		height
	}
}
