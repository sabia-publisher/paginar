<script setup>
import NavigationButton from './NavigationButton.vue'
import usePagination from '../composables/usePagination'
const { next, prev } = usePagination
</script>

<template>
	<div id="engine" class="pt-10 transition-colors">
		<div class="engineWrapper overflow-hidden">
			<NavigationButton target="prev" @clicked="prev(false, 'previous-button')" />
			<slot></slot>
			<NavigationButton target="next" @clicked="next(false, 'next-button')" />
		</div>
	</div>
</template>
