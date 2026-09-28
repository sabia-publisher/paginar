<script setup>
import { inject } from 'vue'
import { searchKey } from '../../composables/useSearch'
import SummaryButton from './SummaryButton/SummaryButton.vue';
import OptionsButton from './OptionsButton/OptionsButton.vue';
import SearchButton from './SearchButton.vue'
const search = inject(searchKey)
</script>

<template>
	<header id="component-header" class="bg-primary flex justify-between items-center p-4"
		:class="{ 'search-enabled': search.enabled.value }">
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

		<div class="header-actions">
			<SearchButton />
			<options-button>
				<template #optionsTop>
					<slot name="optionsTop" />
				</template>
				<template #optionsBottom>
					<slot name="optionsBottom" />
				</template>
			</options-button>
		</div>
	</header>
</template>
