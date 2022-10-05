<script setup>
import { ref } from 'vue'
import Slider from '@vueform/slider'

import usePagination from '../composables/usePagination';
const { totalPages, currentPage, set } = usePagination

function format() {
	return `${currentPage.value} de ${totalPages.value}`
}

</script>

<template>
	<div class="py-2 px-10 text-gray-700 dark:text-white">
		<slot name="footer">
			<p>&nbsp;</p>
		</slot>

		<Slider
			:modelValue="currentPage"
			@update:modelValue="set(Math.round($event))"
			:min="1"
			:max="totalPages"
			:step="-1"
			showTooltip="drag"
			:format="format"
			:lazy="false"
			class="w-full"
		/>
	</div>
</template>
