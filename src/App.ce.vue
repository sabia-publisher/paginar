<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

import HeaderSlot from './components/HeaderSlot.ce.vue'
import FileContent from './components/FileContent.ce.vue'
import EngineWrapper from './components/EngineWrapper.vue'
import ReaderWrapper from './components/ReaderWrapper.vue'
import FooterSlot from './components/FooterSlot.ce.vue'

import usePagination from './composables/usePagination'
import useEstimatePages from './composables/useEstimatePages'
import useTextContent from './composables/useTextContent'
import useReaderSettings from './composables/useReaderSettings'

const props = defineProps({
	bookTitle: String,
	bookContent: String,
	readerSettings: String
})

const { currentPage, totalPages, init } = usePagination
const { content } = useTextContent
const { initSettings, baseFont } = useReaderSettings

const readerComponent = ref(null)
const contentArea = ref(null)

onMounted(() => {
	init(readerComponent, contentArea)
	initSettings(props.readerSettings)
})

const { width, height } = useWindowSize()
watchDebounced(
	[width, height, content],
	() => useEstimatePages.estimate(readerComponent, contentArea),
	{ debounce: 125, maxWait: 250 }
)
</script>

<template>
	<main :style="`font-family: ${baseFont}`">
		<HeaderSlot>
			<template #header>
				<slot name="header">
					<p class="text-white text-center text-xs">
						{{ props.bookTitle }}
					</p>
				</slot>
			</template>
		</HeaderSlot>

		<EngineWrapper>
			<div id="reader-component" ref="readerComponent">
				<ReaderWrapper>
					<section id="content-area" ref="contentArea">
						<slot name="content">
							<!-- default when no content slot, and there is a summary -->
							<FileContent :bookContent="bookContent" />
						</slot>
					</section>
				</ReaderWrapper>
			</div>
		</EngineWrapper>

		<FooterSlot
			:currPage="currentPage"
			:totalPages="totalPages"
		/>
	</main>
</template>

<style lang="scss" src="./assets/main.css"></style>
