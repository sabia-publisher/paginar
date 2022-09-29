<script setup>
import usePagination from '../composables/usePagination';
const { totalPages, currentPage, set } = usePagination
</script>

<template>
	<div class="bg-gray-800 flex justify-center items-center p-2 text-white">
		<div>
			<input type="range"
				:min="1"
				:max="totalPages"
				:value="currentPage"
				@input="event => set(Number(event.target.value))"
			>

			<slot name="footer">
				<span>Página {{ currentPage }} de {{ totalPages }}</span>
				<slot name="default"></slot>
			</slot>
		</div>
	</div>
</template>
