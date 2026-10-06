<script setup>
// The previous @vueform/slider version lives in VueformPageSlider.vue.
import PageSlider from './PageSlider.vue'
</script>

<template>
	<div class="py-2 px-10 text-gray-700 dark:text-white">
		<slot name="footer">
			<p>&nbsp;</p>
		</slot>

		<PageSlider class="w-full" />
	</div>
</template>
