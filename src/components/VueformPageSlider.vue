<script setup>
// Previous page slider, based on @vueform/slider. Not imported by default:
// to restore it, import this component in FooterSlot.vue instead of
// PageSlider.vue and swap ./assets/page-slider.css for
// ./assets/vueform-slider.css in App.ce.vue.
import Slider from '@vueform/slider'

import usePagination from '../composables/usePagination'
const { totalPages, currentPage, set } = usePagination

function format() {
	return `${currentPage.value} de ${totalPages.value}`
}
</script>

<template>
	<Slider
		:modelValue="currentPage"
		@update:modelValue="set(Math.round($event), 'slider')"
		:min="1"
		:max="totalPages"
		:step="-1"
		showTooltip="drag"
		:format="format"
		:lazy="false"
		class="w-full"
	/>
</template>
