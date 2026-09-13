<script setup>
import { inject } from 'vue'
import useTextContent from '../../../composables/useTextContent'
import usePagination from '../../../composables/usePagination'
import { publicEventKey } from '../../../publicApi'
const { summary } = useTextContent
const publicEvent = inject(publicEventKey, () => {})

async function getChapter(item) {
	const text = await useTextContent.getContent(item.file)
	useTextContent.applyContent(text, item)
	usePagination.set(1, 'summary')
	publicEvent('chapter-change', { chapter: { ...item } })
}
</script>

<template>
	<div id="summary-menu-dropdown" class="absolute top-14 py-4 px-3 shadow-lg w-60 md:w-104
			text-areia z-10 bg-white" :role="Sumário" aria-orientation="vertical" aria-labelledby="summary-menu">
		<nav>
			<slot name="summaryTop" />

			<component v-for="item in summary" :is="item.link ? 'a' : 'button'" :key="item.link" :href="item.link"
				:title="`Navegar para capítulo ${item.title}`"
				class="w-full text-left block text-black py-2 px-3 hover:bg-gray-100 rounded mb-2"
				@click="item.file ? getChapter(item) : null">
				<span class="summary-menu-dropdown-item-title">{{ item.title }}</span>
				<span v-if="item.author" class="summary-menu-dropdown-item-author">{{ item.author }}</span>
			</component>

			<slot name="summaryBottom" />
		</nav>
	</div>
</template>
