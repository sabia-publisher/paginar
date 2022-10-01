<script setup>
import { ref } from 'vue'
import Slider from '@vueform/slider'

import usePagination from '../composables/usePagination';
const { totalPages, currentPage, set } = usePagination

const height = ref(10)

</script>

<template>
	<div class="p-2 text-gray-700 dark:text-white">
		<slot name="footer">
			<div class="w-full text-center text-sm mb-2">
				<span>Página {{ currentPage }} de {{ totalPages }}</span>
			</div>
		</slot>

		<Slider
			:modelValue="currentPage"
			@update:modelValue="set(Math.round($event))"
			:min="1"
			:max="totalPages"
			:step="-1"
			:tooltips="false"
			:lazy="false"
			class="w-full"
		/>
	</div>
</template>
