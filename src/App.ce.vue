<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

import HeaderSlot from './components/HeaderSlot/HeaderSlot.ce.vue'
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
	readerSettings: String,
	cssFile: String
})

const { initSettings, baseFont, textFont, fontSize, columns, setColumns } = useReaderSettings
const { currentPage, totalPages, init } = usePagination
const { content } = useTextContent
const { width, height } = useWindowSize()

const readerComponent = ref(null)
const contentArea = ref(null)

onMounted(async () => {
	init(readerComponent, contentArea)
	initSettings(props.readerSettings)
})

watchDebounced(
	[width, height, content, columns, fontSize, textFont],
	() => {
		if (width.value < 1024 && columns.value === 'doubleColumns')
			setColumns('singleColumns')
		else
			useEstimatePages.estimate(readerComponent, contentArea)
	},
	{ debounce: 125, maxWait: 250 }
)
</script>

<template>
	<main ref="comp" :style="`font-family: ${baseFont}`">
		<HeaderSlot>
			<template #header>
				<slot name="header">
					<p class="text-white text-center text-xs">
						{{ props.bookTitle }}
					</p>
				</slot>
			</template>

			<template #summaryTop>
				<slot name="summaryTop"></slot>
			</template>

			<template #summaryBottom>
				<slot name="summaryBottom"></slot>
			</template>

			<template #optionsTop>
				<slot name="optionsTop"></slot>
			</template>

			<template #optionsBottom>
				<slot name="optionsBottom"></slot>
			</template>
		</HeaderSlot>

		<EngineWrapper>
			<div id="reader-component" ref="readerComponent">
				<ReaderWrapper>
					<section id="content-area" ref="contentArea"
						:style="`font-family: ${textFont}; font-size: ${fontSize}px`"
					>
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
