<script setup>
const props = defineProps({
	currPage: Number,
	totalPages: Number
})
</script>

<template>
	<div class="bg-gray-800 flex justify-center items-center p-2 text-white">
		<div>
			<slot name="footer">
				<p>Página {{ props.currPage }} de {{ props.totalPages }}</p>
			</slot>
		</div>
	</div>
</template>
