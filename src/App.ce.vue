<script setup>
import { ref, onMounted } from 'vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

import HeaderSlot from './components/HeaderSlot.ce.vue'
import NavigationButton from './components/NavigationButton.ce.vue'
import FooterSlot from './components/FooterSlot.ce.vue'

import usePagination from './composables/usePagination'
import useEstimatePages from './composables/useEstimatePages'

const { currentPage, totalPages, goTo, init } = usePagination

const readerComponent = ref(null)
const contentArea = ref(null)
onMounted(() => {
	init(readerComponent, contentArea)
})

const { width, height } = useWindowSize()
watchDebounced(
	[width, height],
	() => useEstimatePages.estimate(readerComponent, contentArea),
	{ debounce: 250, maxWait: 500 }
)

</script>

<template>
	<main>
		<HeaderSlot>
			<template #header>
				<slot name="header" />
			</template>
		</HeaderSlot>

		<div id="engine">
			<div class="engineWrapper overflow-hidden">
				<NavigationButton target="prev" @clicked="goTo(-1)" />

				<div id="reader-component" ref="readerComponent">
					<div class="doubleColumns"
						:style="`margin-left: -${100 * (currentPage - 1)}%`"
					>
						<div class="[ typeArea ] h-full relative transition-opacity duration-100 opacity-100 px-24">
							<section id="content-area" ref="contentArea">
								<slot name="content" />
							</section>
						</div>
					</div>
				</div>

				<NavigationButton target="next" @clicked="goTo(1)" />
			</div>
		</div>

		<FooterSlot :currPage="currentPage" :totalPages="totalPages" />
	</main>
</template>

<style lang="scss" src="./assets/main.css"></style>

<style>
</style>
