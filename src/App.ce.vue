<script setup>
import { ref, onMounted } from 'vue'

import HeaderSlot from './components/HeaderSlot.ce.vue'
import NavigationButton from './components/NavigationButton.ce.vue'
import FooterSlot from './components/FooterSlot.ce.vue'

import { useEstimatePages } from './composables/useEstimatePages'

const engine = ref(null)
const readerComponent = ref(null)
const contentArea = ref(null)

const currPage = ref(1)
const totalPages = ref(1)
// const width = ref(0)
// const height = ref(0)

onMounted(() => {
	const {
		totalPages: totalPagesRef,
		width: widthRef,
		height: heightRef
	} = useEstimatePages(readerComponent, contentArea)

	totalPages.value = totalPagesRef
	// width.value = widthRef
	// height.value = heightRef
})

</script>

<template>
	<main>
		<HeaderSlot>
			<template #header>
				<slot name="header" />
			</template>
		</HeaderSlot>

		<div id="engine" ref="engine">
			<div class="engineWrapper overflow-hidden">
				<NavigationButton target="prev" />

				<div id="reader-component" ref="readerComponent">
					<div class="doubleColumns">
						<div class="[ typeArea ] h-full relative transition-opacity duration-100 opacity-100 px-24">
							<section id="content-area" ref="contentArea">
								<slot name="content" />
							</section>
						</div>
					</div>
				</div>

				<NavigationButton target="next" />
			</div>
		</div>

		<FooterSlot :currPage="currPage" :totalPages="totalPages">
			<!--  – width: {{ width }} height: {{ height}} -->
		</FooterSlot>
	</main>
</template>

<style lang="scss" src="./assets/main.css"></style>

<style>
</style>
