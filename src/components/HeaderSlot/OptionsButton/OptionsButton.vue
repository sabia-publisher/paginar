<script setup>
import { ref } from 'vue'
import { onClickOutside, onKeyStroke, useFullscreen } from '@vueuse/core'

import useReaderSettings from '../../../composables/useReaderSettings'

import IconThreeDots from '../../icons/ThreeDots.vue'
import IconClose from '../../icons/Close.vue'
import IconExpand from '../../icons/Expand.vue'
import OptionsDropdown from './OptionsDropdown.vue'

const show = ref(false)
const button = ref(null)

const toggleSummary = () => show.value = !show.value
const hide = () => {
	if (!useReaderSettings.blocked.value) {
		show.value = false
	}
}

onClickOutside(button, () => hide())
onKeyStroke('Escape', () => hide())

const { toggle: toggleFullScreen } = useFullscreen()
</script>

<template>
	<div id="options-menu" ref="button" class="relative">
		<div class="flex">
			<button @click.prevent="toggleSummary()"
				class="border p-3 shadow flex items-center border-white text-white"
				id="options-button" aria-haspopup="true" :aria-expanded="show"
			>
				<span class="block mr-3">
					Opções
				</span>

				<IconClose v-if="show" class="w-6 h-6" />
				<IconThreeDots v-else class="w-6 h-6" />
			</button>

			<button @click.prevent="toggleFullScreen()"
				class="hidden md:flex items-center border p-3 shadow ml-3 border-white text-white"
			>
				<IconExpand class="w-6 h-6" />
			</button>
		</div>

		<transition enter-active-class="transition ease-out duration-100 transform" enter-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75 transform"
			leave-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95"
		>
			<OptionsDropdown v-show="show">
				<template #optionsTop>
					<slot name="optionsTop"/>
				</template>
				<template #optionsBottom>
					<slot name="optionsBottom"/>
				</template>
			</OptionsDropdown>
		</transition>
	</div>
</template>

<style>
</style>
