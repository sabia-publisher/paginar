<script setup>
import { ref, onMounted, defineProps, onBeforeUnmount } from 'vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

import HeaderSlot from './components/HeaderSlot/HeaderSlot.vue'
import BookContent from './components/BookContent.vue'
import EngineWrapper from './components/EngineWrapper.vue'
import ReaderWrapper from './components/ReaderWrapper.vue'
import ReferencePopup from './components/ReferencePopup.vue'
import FooterSlot from './components/FooterSlot.vue'

import usePagination from './composables/usePagination'
import useEstimatePages from './composables/useEstimatePages'
import useTextContent from './composables/useTextContent'
import useReaderSettings from './composables/useReaderSettings'
import useReferences from './composables/useReferences'
import useStyles from './composables/useStyles'

const props = defineProps({
	bookTitle: String,
	bookContent: String,
	readerSettings: String,
	cssFile: String
})

const { initSettings, baseFont, textFont, fontSize, columns, setColumns, mode } = useReaderSettings
const { currentPage, totalPages, init } = usePagination
const { content } = useTextContent
const { listenToReferencesClick } = useReferences
const { width, height } = useWindowSize()

const readerComponent = ref(null)
const contentArea = ref(null)
const rootComponent = ref(null)

onMounted(async () => {
	init(readerComponent, contentArea)
	initSettings(props.readerSettings)

	if (props.cssFile) {
		useStyles.stylesheetLoader(props.cssFile, rootComponent)
	}
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

watchDebounced(content,
	() => listenToReferencesClick(contentArea),
	{ debounce: 125, maxWait: 250 }
)

</script>

<template>
	<div class="rootWrapper">
		<main id="rootComponent" ref="rootComponent" :class="mode" :style="`font-family: ${baseFont}`">
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
							:style="`font-family: ${textFont}; font-size: ${fontSize}px`">
							<BookContent :bookContent="bookContent">
								<template #content>
									<slot name="content"></slot>
								</template>
							</BookContent>
						</section>
					</ReaderWrapper>
				</div>
			</EngineWrapper>

			<FooterSlot :currPage="currentPage" :totalPages="totalPages" />

			<ReferencePopup />
		</main>
	</div>
</template>

<style lang="scss" src="./assets/main.css"></style>
