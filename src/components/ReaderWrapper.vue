<script setup>
import { ref } from 'vue'
import { usePointerSwipe } from '@vueuse/core'

import usePagination from '../composables/usePagination'
import useReaderSettings from '../composables/useReaderSettings'

const { columns } = useReaderSettings
const { currentPage } = usePagination

const el = ref(null)
const { distanceX } = usePointerSwipe(el, {
	onSwipeEnd() {
		if (distanceX.value > 150) {
			usePagination.next()
		}
		if (distanceX.value < -150) {
			usePagination.prev()
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
