<script setup>
import SummaryButton from './SummaryButton/SummaryButton.vue';
import OptionsButton from './OptionsButton/OptionsButton.vue';
</script>

<template>
	<header id="component-header" class="bg-primary flex justify-between items-center p-4">
		<summary-button>
			<template #summaryTop>
				<slot name="summaryTop" />
			</template>
			<template #summaryBottom>
				<slot name="summaryBottom" />
			</template>
		</summary-button>

		<div id="header-titles">
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
	</header>
</template>
