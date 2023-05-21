<script setup>
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

import SingleColumn from '../../icons/SingleColumn.vue'
import DoubleColumn from '../../icons/DoubleColumn.vue'

import useReaderSettings from '../../../composables/useReaderSettings'
const { columns, setColumns } = useReaderSettings
const { width } = useWindowSize()

const isSafari = computed(() => {
	const ua = navigator.userAgent.toLowerCase()
	return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1
})

</script>

<template>
	<div id="columns-menu" class="w-full hidden md:grid grid-cols-3 gap-2 mt-3">
		<button
			id="single-column-button"
			class="col-span-1 text-primary text-center cursor-pointer py-3 rounded-sm border"
			:class="{
				'border-gray-300': columns !== 'single',
				'bg-primary-extralight border-2 border-primary': columns === 'single',
				'opacity-30 cursor-default': isSafari
			}"
			@click.prevent="!isSafari ? setColumns('single') : null"
			aria-label="Coluna única"
			:title="isSafari ? 'O navegador Safari não aceita visualização de coluna única.' : 'Coluna única'"
		>
			<SingleColumn class="mx-auto h-10 opacity-75" />
		</button>

		<button
			id="double-column-button"
			class="col-span-2 text-primary text-center cursor-pointer py-3 rounded-sm border"
			:class="{
				'border-gray-300': columns !== 'double',
				'bg-primary-extralight border-2 border-primary': columns === 'double',
				'opacity-30': width < 1024
			}"
			@click.prevent="width >= 1024 && setColumns('double')"
			aria-label="Coluna dupla"
			title="Coluna dupla"
		>
			<DoubleColumn name="DoubleColumn" class="mx-auto h-10 divide-opacity-75" />
		</button>
	</div>
</template>
