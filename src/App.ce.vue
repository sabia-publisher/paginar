<script setup>
import { ref, onMounted, computed } from 'vue'

import HeaderSlot from './components/HeaderSlot.ce.vue'
import NavigationButton from './components/NavigationButton.ce.vue'
import FooterSlot from './components/FooterSlot.ce.vue'

import { usePagination } from './composables/usePagination'

const readerComponent = ref(null)
const contentArea = ref(null)

const totalPages = ref(1)
const currentPage = ref(1)
let goTo = ref(null)

onMounted(() => {
	const {
		totalPages: totalPagesRef,
		currentPage: currentPageRef,
		goTo: goToRef
	} = usePagination(readerComponent, contentArea)

	totalPages.value = computed(() => totalPagesRef.value)
	currentPage.value = computed(() => currentPageRef.value)
	goTo.value = goToRef
})

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
						:style="`margin-left: -${100 * (currentPage.value - 1)}%`"
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
