<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, nextTick, watch, provide } from 'vue'
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
import useReadingProgress from './composables/useReadingProgress'
import { publicEventKey } from './publicApi'

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
const { currentPage, totalPages, changeSource } = usePagination
const { content, listenToClicks } = useTextContent
const { width, height } = useWindowSize()

const readerComponent = ref(null)
const contentArea = ref(null)
const rootComponent = ref(null)
let paginationRevision = 0
let hostElement = null

function getState() {
	const currentChapter = useTextContent.context.value.chapter
	return {
		pagination: {
			currentPage: currentPage.value,
			totalPages: totalPages.value,
			progress: totalPages.value > 1
				? (currentPage.value - 1) / (totalPages.value - 1)
				: 0
		},
		settings: {
			baseFont: baseFont.value,
			textFont: textFont.value,
			fontSize: fontSize.value,
			columns: columns.value,
			mode: mode.value,
			blocked: useReaderSettings.blocked.value,
			readingProgressEnabled: useReaderSettings.readingProgressEnabled.value
		},
		content: {
			bookTitle: props.bookTitle || bookTitle.value,
			chapterTitle: chapterTitle.value,
			chapter: currentChapter ? { ...currentChapter } : null
		}
	}
}

function dispatchPublicEvent(name, detail = {}) {
	if (!hostElement)
		return

	hostElement.dispatchEvent(new CustomEvent(`paginar:${name}`, {
		bubbles: true,
		composed: true,
		detail: { ...detail, state: getState() }
	}))
}

provide(publicEventKey, dispatchPublicEvent)

function syncReadingProgress(allowRestore = false) {
	const targetPage = useReadingProgress.sync(
		currentPage.value,
		totalPages.value,
		allowRestore
	)
	if (targetPage)
		usePagination.set(targetPage, 'reading-progress')
}

function estimatePagesAndSyncProgress() {
	const revision = ++paginationRevision
	const previousPage = currentPage.value
	const previousTotal = totalPages.value
	useReadingProgress.suspend()
	const nextTotal = useEstimatePages.estimate(readerComponent, contentArea)

	nextTick(() => requestAnimationFrame(() => {
		if (revision !== paginationRevision)
			return

		const targetPage = useReadingProgress.repaginate(
			previousPage,
			previousTotal,
			nextTotal
		)

		if (targetPage)
			usePagination.set(targetPage, 'repagination')
		else
			syncReadingProgress(true)

		useReadingProgress.resume()
		useReadingProgress.save(currentPage.value, nextTotal)
	}))
}

function saveCurrentReadingProgress() {
	useReadingProgress.save(currentPage.value, totalPages.value)
}

function saveReadingProgressWhenHidden() {
	if (document.visibilityState === 'hidden')
		saveCurrentReadingProgress()
}

onMounted(async () => {
	hostElement = rootComponent.value?.getRootNode()?.host || null
	if (hostElement) {
		hostElement.getState = getState
		hostElement.goToPage = page => usePagination.set(page, 'api')
		hostElement.nextPage = () => usePagination.next(false, 'api')
		hostElement.previousPage = () => usePagination.prev(false, 'api')
	}
	useReaderSettings.initSettings(props.readerSettings)
	useReadingProgress.init(
		props.readerSettings,
		props.bookTitle || bookTitle.value
	)
	usePagination.init(readerComponent, contentArea, estimatePagesAndSyncProgress)
	requestAnimationFrame(() => {
		estimatePagesAndSyncProgress()
	})
	useStyles.initStyles(props, rootComponent)
	window.addEventListener('pagehide', saveCurrentReadingProgress)
	document.addEventListener('visibilitychange', saveReadingProgressWhenHidden)

	if (['string', 'boolean'].includes(typeof props.readerBlocked)) {
		useReaderSettings.setBlocked(props.readerBlocked)
	}
	nextTick(() => requestAnimationFrame(() => dispatchPublicEvent('ready')))

})

onBeforeUnmount(() => {
	window.removeEventListener('pagehide', saveCurrentReadingProgress)
	document.removeEventListener('visibilitychange', saveReadingProgressWhenHidden)
	if (hostElement) {
		delete hostElement.getState
		delete hostElement.goToPage
		delete hostElement.nextPage
		delete hostElement.previousPage
	}
	hostElement = null
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
		else {
			requestAnimationFrame(() => {
				estimatePagesAndSyncProgress()
			})
		}
	},
	{ debounce: 125, maxWait: 250 }
)

watch(
	currentPage,
	(value, previousValue) => {
		syncReadingProgress()
		dispatchPublicEvent('page-change', {
			page: value,
			previousPage: previousValue,
			source: changeSource.value
		})
	},
	{ flush: 'sync' }
)

watch(
	[baseFont, textFont, fontSize, columns, mode, useReaderSettings.readingProgressEnabled],
	(values, previousValues) => {
		const names = ['baseFont', 'textFont', 'fontSize', 'columns', 'mode', 'readingProgressEnabled']
		const changes = names.reduce((result, name, index) => {
			if (values[index] !== previousValues[index])
				result[name] = { previous: previousValues[index], value: values[index] }
			return result
		}, {})
		if (Object.keys(changes).length)
			dispatchPublicEvent('settings-change', { changes })
	},
	{ flush: 'post' }
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

<style lang="scss">
/* In your Vue component's <style> section */
:host {
	user-select: text;
}

::slotted(*) {
	user-select: text;
}

/* Ensure paragraphs can be selected across boundaries */
::slotted(p) {
	user-select: text;
	display: block;
	/* Avoid inline-block which can break selection */
}
</style>
