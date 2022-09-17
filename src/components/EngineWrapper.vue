<script setup>
import NavigationButton from './NavigationButton.ce.vue'

import usePagination from '../composables/usePagination'
import useReaderSettings from '../composables/useReaderSettings'

const { next, prev } = usePagination
const { mode } = useReaderSettings

</script>

<template>
	<div id="engine"
		class="pt-10"
		:class="mode"
	>
		<div class="engineWrapper overflow-hidden">
			<NavigationButton target="prev" @clicked="prev()" />
			<slot></slot>
			<NavigationButton target="next" @clicked="next()" />
		</div>
	</div>
</template>
