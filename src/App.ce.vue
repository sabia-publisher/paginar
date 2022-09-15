<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

import HeaderSlot from './components/HeaderSlot.ce.vue'
import SummaryContent from './components/SummaryContent.ce.vue'
import NavigationButton from './components/NavigationButton.ce.vue'
import FooterSlot from './components/FooterSlot.ce.vue'

import usePagination from './composables/usePagination'
import useEstimatePages from './composables/useEstimatePages'
import useTextContent from './composables/useTextContent'

const props = defineProps({
	bookTitle: String,
	bookSummary: String
})

const { currentPage, totalPages, next, prev, init } = usePagination
const { content } = useTextContent

const readerComponent = ref(null)
const contentArea = ref(null)

onMounted(() => {
	init(readerComponent, contentArea)
})

const { width, height } = useWindowSize()
watchDebounced(
	[width, height, content],
	() => useEstimatePages.estimate(readerComponent, contentArea),
	{ debounce: 125, maxWait: 250 }
)

</script>

<template>
	<main>
		<HeaderSlot>
			<template #header>
				<slot name="header">
					<p class="text-white text-center text-xs">
						{{ props.bookTitle }}
					</p>
				</slot>
			</template>
		</HeaderSlot>

		<div id="engine">
			<div class="engineWrapper overflow-hidden">
				<NavigationButton
					target="prev"
					@clicked="prev()"
				/>

				<div id="reader-component" ref="readerComponent">
					<div class="doubleColumns"
						:style="`margin-left: -${100 * (currentPage - 1)}%`"
					>
						<div class="[ typeArea ] h-full relative
							transition-opacity duration-100 opacity-100 px-24"
						>
							<section id="content-area" ref="contentArea">
								<slot name="content">
									<SummaryContent :bookSummary="bookSummary" />
								</slot>
							</section>
						</div>
					</div>
				</div>

				<NavigationButton
					target="next"
					@clicked="next()"
				/>
			</div>
		</div>

		<FooterSlot
			:currPage="currentPage"
			:totalPages="totalPages"
		/>
	</main>
</template>

<style lang="scss" src="./assets/main.css"></style>
