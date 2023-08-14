<script setup>
import { ref, onMounted, defineProps, watch } from 'vue'
import { useWindowSize, watchDebounced } from '@vueuse/core'

import HeaderSlot from './components/HeaderSlot/HeaderSlot.vue'
import BookContent from './components/BookContent.vue'
import EngineWrapper from './components/EngineWrapper.vue'
import ReaderWrapper from './components/ReaderWrapper.vue'
import ReferencePopup from './components/ReferencePopup.vue'
import FooterSlot from './components/FooterSlot.vue'
import FootnotesAside from './components/FootnotesAside.vue'

import usePagination from './composables/usePagination'
import useEstimatePages from './composables/useEstimatePages'
import useTextContent from './composables/useTextContent'
import useReaderSettings from './composables/useReaderSettings'
import useStyles from './composables/useStyles'
import useBrowser from './composables/useBrowser'

const props = defineProps({
	bookTitle: String,
	bookContent: String,
	readerSettings: String,
	readerBlocked: Boolean,
	rootClass: {
		type: String,
		default: ''
	},
	cssFile: String,
	cssString: String
})

const { baseFont, bookTitle, chapterTitle, textFont, fontSize, columns, setColumns, mode } = useReaderSettings
const { currentPage, totalPages } = usePagination
const { content, listenToClicks } = useTextContent
const { width, height } = useWindowSize()

const readerComponent = ref(null)
const contentArea = ref(null)
const rootComponent = ref(null)

onMounted(async () => {
	usePagination.init(readerComponent, contentArea)
	useReaderSettings.initSettings(props.readerSettings)
	useStyles.initStyles(props, rootComponent)

	if (['string', 'boolean'].includes(typeof props.readerBlocked)) {
		useReaderSettings.setBlocked(props.readerBlocked)
	}

})

watch(
	props,
	() => {
		if (props.hasOwnProperty('readerBlocked')) {
			const readerBlocked = typeof props.readerBlocked === 'boolean'
				? props.readerBlocked
				: props.readerBlocked === 'true'
			useReaderSettings.setBlocked(readerBlocked)
		}
	}
)

watchDebounced(
	[width, height, content, columns, fontSize, textFont],
	() => {
		if (width.value < 1024 && columns.value === 'double')
			setColumns('single')
		else
			useEstimatePages.estimate(readerComponent, contentArea)
	},
	{ debounce: 125, maxWait: 250 }
)

watchDebounced(content,
	() => listenToClicks(contentArea),
	{ debounce: 125, maxWait: 250 }
)

</script>

<template>
	<div class="rootWrapper" :class="useBrowser.isSafari ? 'safari' : ''">
		<main id="rootComponent"
			ref="rootComponent"
			:class="mode
				.concat(` ${props.rootClass}`)
				.concat(` currentPage-${currentPage}`)
				.concat(` totalPages-${totalPages}`)
				.concat(` columns-${columns}`)
			"
			:style="`font-family: ${baseFont}`"
		>
			<HeaderSlot>
				<template #header>
					<slot name="header">
						<p class="text-white text-center text-sm">
							{{ props.bookTitle || bookTitle }}
						</p>
						<p class="text-white text-center text-xs">
							{{ props.chapterTitle || chapterTitle }}
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
				<div id="reader-component" ref="readerComponent" >
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

		<FootnotesAside />
	</div>
</template>

<style lang="scss" src="./assets/main.css"></style>
