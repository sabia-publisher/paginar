export function useEstimatePages(viewport, content) {
	if (viewport && content) {
		const { width: viewportWidth } = viewport.value.getBoundingClientRect()
		const { width: contentWidth } = content.value.getBoundingClientRect()

		if (contentWidth > viewportWidth) {
			return Math.ceil(contentWidth / viewportWidth)

		} else {
			return 1
		}
	} else {
		return 1
	}
}
