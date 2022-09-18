<script setup>
import SummaryButton from './SummaryButton/SummaryButton.ce.vue';
import OptionsButton from './OptionsButton/OptionsButton.ce.vue';
</script>

<template>
	<div class="bg-gray-800 flex justify-between items-center p-4">
		<summary-button>
			<template #summaryTop>
				<slot name="summaryTop" />
			</template>
			<template #summaryBottom>
				<slot name="summaryBottom" />
			</template>
		</summary-button>

		<div>
			<slot name="header" />
		</div>

		<options-button>
			<template #optionsTop>
				<slot name="optionsTop" />
			</template>
			<template #optionsBottom>
				<slot name="optionsBottom" />
			</template>
		</options-button>
	</div>
</template>

<style>
.headerSlot {
	text-align: center;
	border: 1px dashed #000;
}
</style>
