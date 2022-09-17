<script setup>
import { ref, onMounted } from 'vue'
import { onClickOutside, onKeyStroke, useFullscreen } from '@vueuse/core'

import IconThreeDots from './icons/ThreeDots.vue'
import IconClose from './icons/Close.vue'
import IconExpand from './icons/Expand.vue'
import IconEye from './icons/Eye.vue'

import SingleColumn from './icons/SingleColumn.vue'
import DoubleColumn from './icons/DoubleColumn.vue'

import useReaderSettings from '../composables/useReaderSettings'

const { textFont, fontsOptions, fontSize, setTextFont,
	columns, setColumns
} = useReaderSettings

const show = ref(false)
const button = ref(null)

const toggleSummary = () => show.value = !show.value
const hide = () => show.value = false

onClickOutside(button, () => hide())
onKeyStroke('Escape', () => hide())

const { toggle: toggleFullScreen } = useFullscreen()

onMounted(() => {

})

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
			<div v-show="show"
				class="absolute top-14 py-4 px-3 shadow-lg w-60 md:w-104
					text-areia -right-2 md:right-16 z-10 bg-white"
				role="Opções" aria-orientation="vertical" aria-labelledby="options-menu"
			>
				<div class="pb-3">

					<!-- <button @click.prevent="toggleAside('AsideFootnotes')"
						class="w-full flex justify-center items-center py-3 lowercase">
						<Icon name="Footnote" class="w-6 h-6" />
						<span class="ml-4">{{ $t('reader.footnotes') }}</span>
					</button>

					<div class="w-full border-b border-areia my-3"></div> -->

					<div class="w-full flex justify-center items-center py-3">
						<IconEye class="w-6 h-6" />
						<span class="ml-4">Visualização</span>
					</div>

					<div class="w-full hidden md:grid grid-cols-3 gap-2 mt-3">
						<button class="col-span-1 text-center cursor-pointer py-3 rounded-sm border border-gray-300"
							:class="{
								'bg-gray-100 text-gray-800 border-2 border-gray-500': columns === 'singleColumns'
							}"
							@click.prevent="setColumns('singleColumns')" aria-label="Coluna única"
							title="Coluna única"
						>
							<SingleColumn class="mx-auto h-10 opacity-75" />
						</button>

						<button class="col-span-2 text-center cursor-pointer py-3 rounded-sm border border-gray-300"
							:class="{
								'bg-gray-100 text-gray-800 border-2 border-gray-500': columns === 'doubleColumns'
							}"
							@click.prevent="setColumns('doubleColumns')" aria-label="Coluna dupla"
							title="Coluna dupla"
						>
							<DoubleColumn name="DoubleColumn" class="mx-auto h-10 divide-opacity-75" />
						</button>
					</div>


					<div class="w-full grid grid-cols-4 gap-2 my-3">

						<button v-for="font in fontsOptions"
							:key="font.name"
							@click.prevent="setTextFont(font.name)"
							class="font-light text-lg tracking-wide border border-urucum w-full h-10 flex justify-center items-center"
							:class="{
								'bg-gray-100 text-gray-800 border-2 border-gray-500': textFont === font.name
							}"
							:style="`font-family: ${font.name}`"
							:title="font.label ?? font.name"
						>
							Ff
						</button>

					</div>

					<!--<div class="w-full grid grid-cols-4 gap-2 my-3">

						<button @click.prevent="changeFontSize(fontSize + 1)"
							class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">+
							A</button>

						<button @click.prevent="changeFontSize(fontSize - 1)"
							class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">-
							A</button>

						<button @click.prevent="changeMode" :title="$t('fromDarkmode')" :aria-label="$t('fromDarkmode')"
							class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
							:class="{
										'bg-areia text-terra': !darkmode
									}">
							<Icon name="Sun" class="w-5 h-5" />
						</button>

						<button @click.prevent="changeMode" :title="$t('toDarkmode')" :aria-label="$t('toDarkmode')"
							class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
							:class="{
										'bg-areia text-terra': darkmode
									}">
							<Icon name="Moon" class="w-5 h-5" />
						</button>
					</div>

					<div class="hidden w-full border-b border-areia my-8"></div>

					<form @submit.prevent class="hidden bg-white bg-opacity-30 my-3 border border-urucum">
						<input type="text"
							class="h-full w-full py-2 px-3 text-base rounded-none bg-transparent placeholder-white text-white"
							:placeholder="$t('reader.search')">
						<button class="bg-transparent w-12 flex justify-center items-center">
							<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
						</button>
					</form> -->

				</div>
			</div>
		</transition>
	</div>
</template>

<style>
</style>
