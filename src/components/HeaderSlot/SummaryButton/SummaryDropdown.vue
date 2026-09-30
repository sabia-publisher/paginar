<script setup>
import { inject } from 'vue'
import useTextContent from '../../../composables/useTextContent'
import usePagination from '../../../composables/usePagination'
import { publicEventKey } from '../../../publicApi'
import { isNavigable } from '../../../summary'
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
			text-areia z-10 bg-white" role="menu" aria-orientation="vertical" aria-labelledby="summary-menu">
		<nav>
			<slot name="summaryTop" />

			<template v-for="item in summary" :key="isNavigable(item) ? item.link : item.title">
				<span v-if="!isNavigable(item)" aria-disabled="true"
					class="summary-menu-dropdown-item-disabled w-full text-left block text-black py-2 px-3 rounded mb-2"
					:style="{ opacity: 0.4, cursor: 'default' }">
					<span class="summary-menu-dropdown-item-title">{{ item.title }}</span>
					<span v-if="item.author" class="summary-menu-dropdown-item-author">{{ item.author }}</span>
				</span>
				<component v-else :is="item.link ? 'a' : 'button'" :href="item.link"
					:title="`Navegar para capítulo ${item.title}`"
					class="w-full text-left block text-black py-2 px-3 hover:bg-gray-100 rounded mb-2"
					@click="item.file ? getChapter(item) : null">
					<span class="summary-menu-dropdown-item-title">{{ item.title }}</span>
					<span v-if="item.author" class="summary-menu-dropdown-item-author">{{ item.author }}</span>
				</component>
			</template>

			<slot name="summaryBottom" />
		</nav>
	</div>
</template>
