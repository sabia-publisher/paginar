<script setup>
import NavigationButton from './NavigationButton.ce.vue'

import usePagination from '../composables/usePagination'
const { next, prev } = usePagination

</script>

<template>
	<div id="engine">
		<div class="engineWrapper overflow-hidden">
			<NavigationButton target="prev" @clicked="prev()" />
			<slot></slot>

			<NavigationButton target="next" @clicked="next()" />
		</div>
	</div>
</template>
