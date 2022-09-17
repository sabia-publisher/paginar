<script setup>
import { ref } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

import IconHome from '../../icons/Home.vue'
import IconClose from '../../icons/Close.vue'
import IconSummary from '../../icons/Summary.vue'
import SummaryDropdown from './SummaryDropdown.vue'

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
			<SummaryDropdown v-if="show" />
		</transition>
	</div>
</template>
