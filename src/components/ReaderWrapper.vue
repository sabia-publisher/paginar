<script setup>
import { ref } from 'vue'
import { usePointerSwipe, useWindowSize } from '@vueuse/core'

import usePagination from '../composables/usePagination'
import useReaderSettings from '../composables/useReaderSettings'

const { columns } = useReaderSettings
const { currentPage } = usePagination

const el = ref(null)

const { width } = useWindowSize()
const { distanceX } = usePointerSwipe(el, {
	onSwipeEnd() {
		if (width.value < 600) {
			if (distanceX.value > 100) {
				usePagination.next()
			}
			if (distanceX.value < -100) {
				usePagination.prev()
			}
		}
	}
})

</script>

<template>
	<div  ref="el" class="columnsArea" :class="columns" :style="`margin-left: -${100 * (currentPage - 1)}%`">
		<div class="[ typeArea ] h-full relative
			transition-opacity duration-100 opacity-100 px-2 md:px-24
		">
			<slot></slot>
		</div>
	</div>
</template>
