<script setup>
import { ref } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

import useReaderSettings from '../../../composables/useReaderSettings'

import IconHome from '../../icons/Home.vue'
import IconClose from '../../icons/Close.vue'
import IconSummary from '../../icons/Summary.vue'
import SummaryDropdown from './SummaryDropdown.vue'

const show = ref(false)
const button = ref(null)

const { homeUrl } = useReaderSettings

const toggleSummary = () => show.value = !show.value
const hide = () => {
	if (!useReaderSettings.blocked.value) {
		show.value = false
	}
}

onClickOutside(button, () => hide())
onKeyStroke('Escape', () => hide())
</script>

<template>
	<div id="summary-menu" ref="button" class="relative">
		<div class="flex">
			<a v-if="homeUrl"
				:href="homeUrl" title="Homepage" id="home-button"
				class="hidden md:flex items-center border p-3 shadow mr-3
					border-white text-white"
			>
				<IconHome class="w-6 h-6"/>
			</a>

			<div class="position-relative">
				<button
					@click.prevent="toggleSummary()"
					class="border p-3 shadow flex items-center border-white text-white"
					id="summary-button" aria-haspopup="true" :aria-expanded="show"
				>
					<IconSummary v-if="!show" />
					<IconClose v-else class="w-6 h-6" />

					<span class="block ml-3">
						Sumário
					</span>
				</button>

				<transition enter-active-class="transition ease-out duration-100 transform" enter-class="opacity-0 scale-95"
					enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75 transform"
					leave-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95"
				>
					<SummaryDropdown v-if="show">
						<template #summaryTop>
							<slot name="summaryTop"/>
						</template>

						<template #summaryBottom>
							<slot name="summaryBottom"/>
						</template>
					</SummaryDropdown>
				</transition>
			</div>
		</div>
	</div>
</template>
