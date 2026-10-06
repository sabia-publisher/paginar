<script setup>
// Native range input replacing @vueform/slider (see VueformPageSlider.vue).
import { computed, onBeforeUnmount, ref } from 'vue'

import usePagination from '../composables/usePagination'
const { totalPages, currentPage, set } = usePagination

// While dragging, the thumb follows the pointer freely and the page is rounded,
// like the previous continuous slider; at rest it snaps to whole pages, which
// also keeps arrow keys moving one page at a time.
const dragPosition = ref(null)
const dragging = computed(() => dragPosition.value !== null)
const value = computed(() => dragPosition.value ?? currentPage.value)
const progress = computed(() => totalPages.value > 1
	? Math.min(1, Math.max(0, (value.value - 1) / (totalPages.value - 1)))
	: 0)
const label = computed(() => `${currentPage.value} de ${totalPages.value}`)

function startDrag(event) {
	if (event.button !== 0)
		return
	// Applied before the browser positions the thumb for this pointer.
	event.currentTarget.step = 'any'
	dragPosition.value = currentPage.value
	window.addEventListener('pointerup', endDrag)
	window.addEventListener('pointercancel', endDrag)
}

function endDrag() {
	window.removeEventListener('pointerup', endDrag)
	window.removeEventListener('pointercancel', endDrag)
	dragPosition.value = null
}

function onInput(event) {
	const position = Number(event.target.value)
	if (dragging.value)
		dragPosition.value = position
	set(Math.round(position), 'slider')
}

onBeforeUnmount(endDrag)
</script>

<template>
	<div class="page-slider" :class="{ 'page-slider-dragging': dragging }"
		:style="{ '--slider-progress': progress }">
		<div class="page-slider-connect"></div>
		<input type="range" class="page-slider-input"
			min="1"
			:max="totalPages"
			:step="dragging ? 'any' : 1"
			:value="value"
			aria-label="Página"
			:aria-valuetext="label"
			@pointerdown="startDrag"
			@input="onInput"
		>
		<div v-if="dragging" class="page-slider-tooltip" aria-hidden="true">{{ label }}</div>
	</div>
</template>
