import { computed, reactive } from 'vue'

const state = reactive({
	totalPages: 1
})

function estimate(viewport, content) {
	if (viewport && content) {
		const { width: viewportWidth } = viewport.value.getBoundingClientRect()
		const { width: contentWidth } = content.value.getBoundingClientRect()

		if (contentWidth > viewportWidth) {
			state.totalPages = Math.ceil(contentWidth / viewportWidth)

		} else {
			state.totalPages = 1
		}
	} else {
		state.totalPages = 1
	}
}

const totalPages = computed(() => state.totalPages)

export default {
	totalPages,
	estimate
}
