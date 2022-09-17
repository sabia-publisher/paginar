<script setup>
import { ref } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

import IconHome from './icons/Home.vue'
import IconClose from './icons/Close.vue'
import IconSummary from './icons/Summary.vue'

import useTextContent from '../composables/useTextContent'
import usePagination from '../composables/usePagination'
const { summary } = useTextContent

function getChapter(item) {
	useTextContent.getContent(item.file)
	usePagination.set(1)
}

const show = ref(false)
const button = ref(null)

const toggleSummary = () => show.value = !show.value
const hide = () => show.value = false

onClickOutside(button, () => hide())
onKeyStroke('Escape', () => hide())
</script>

<template>
	<div ref="button" class="relative">
		<div class="flex">
			<a href="/" title="Homepage"
				class="hidden md:flex items-center border p-3 shadow mr-3
					border-gray-800 text-gray-800 dark:border-white dark:text-white"
			>
				<IconHome class="w-6 h-6"/>
			</a>

			<button @click.prevent="toggleSummary()"
				class="border p-3 shadow flex items-center"
				:class="{
					'border-white text-white': invertBackground || show,
					'border-gray-800 text-gray-800 dark:border-white dark:text-white': !invertBackground && !show,
					'bg-terra': show
				}"
				id="summary-menu" aria-haspopup="true" :aria-expanded="show"
			>
				<IconSummary v-if="!show" />
				<IconClose v-else class="w-6 h-6" />

				<span class="block ml-3">
					Sumário
				</span>
			</button>
		</div>

		<transition enter-active-class="transition ease-out duration-100 transform" enter-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75 transform"
			leave-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95"
		>
			<div v-if="show"
				class="absolute top-14 py-4 px-3 shadow-lg w-60 md:w-104
					text-areia -left-2 md:left-16 z-10 bg-white"
				:role="Sumário"
				aria-orientation="vertical"
				aria-labelledby="summary-menu"
			>
				<nav>
					<a href="/" class="block text-black py-2 px-3 hover:bg-gray-100 rounded mb-2">
						Voltar ao catálogo
					</a>
					<div class="my-3 border-b"></div>
					<a href="/" class="block text-black py-2 px-3 hover:bg-gray-100 rounded mb-2">
						Capa
					</a>

					<component v-for="item in summary" :is="item.link ? 'a' : 'button'"
						:key="item.link"
						:href="item.link"
						:title="`Navegar para capítulo ${item.title}`"
						class="w-full text-left block text-black py-2 px-3 hover:bg-gray-100 rounded mb-2"
						@click="item.file ? getChapter(item) : null"
					>
						{{ item.title }}
					</component>
				</nav>
			</div>
		</transition>
	</div>
</template>
