<script setup>
import { ref } from 'vue'
import { onClickOutside, onKeyStroke, useFullscreen } from '@vueuse/core'

import IconThreeDots from '../../icons/ThreeDots.vue'
import IconClose from '../../icons/Close.vue'
import IconExpand from '../../icons/Expand.vue'
import OptionsDropdown from './OptionsDropdown.vue'

const show = ref(false)
const button = ref(null)

const toggleSummary = () => show.value = !show.value
const hide = () => show.value = false

onClickOutside(button, () => hide())
onKeyStroke('Escape', () => hide())

const { toggle: toggleFullScreen } = useFullscreen()
</script>

<template>
	<div ref="button" class="relative">
		<div class="flex">
			<button @click.prevent="toggleSummary()" class="border p-3 shadow flex items-center" :class="{
				'border-white text-white': invertBackground || show,
				'border-gray-800 text-gray-800 dark:border-white dark:text-white': !invertBackground && !show,
				'bg-terra': show
			}" id="summary-menu" aria-haspopup="true" :aria-expanded="show">
				<span class="block mr-3">
					Opções
				</span>

				<IconClose v-if="show" class="w-6 h-6" />
				<IconThreeDots v-else class="w-6 h-6" />
			</button>

			<button @click.prevent="toggleFullScreen()" class="hidden md:flex items-center border p-3 shadow ml-3" :class="{
				'border-white text-white': invertBackground,
				'border-gray-800 text-gray-800 dark:border-white dark:text-white': !invertBackground
			}">
				<IconExpand class="w-6 h-6" />
			</button>
		</div>

		<transition enter-active-class="transition ease-out duration-100 transform" enter-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75 transform"
			leave-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95"
		>
			<OptionsDropdown v-show="show" />
		</transition>
	</div>
</template>

<style>
</style>
