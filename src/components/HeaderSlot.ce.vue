<script setup>
defineProps({
	msg: {
		type: String,
		required: true
	}
})
</script>

<template>
	<div class="border bg-gray-100 mt-10">
		<slot name="header"></slot>
	</div>
</template>

<style>
.headerSlot {
	text-align: center;
	border: 1px dashed #000;
}
</style>
