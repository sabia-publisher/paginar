<script setup>
import SummaryButton from './SummaryButton.ce.vue';
import OptionsButton from './OptionsButton.ce.vue';

</script>

<template>
	<div class="bg-gray-800 flex justify-between items-center p-4">
		<summary-button />

		<div>
			<slot name="header"></slot>
		</div>

		<options-button />
	</div>
</template>

<style>
.headerSlot {
	text-align: center;
	border: 1px dashed #000;
}
</style>
