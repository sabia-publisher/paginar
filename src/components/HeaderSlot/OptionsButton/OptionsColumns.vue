<script setup>
import { useWindowSize } from '@vueuse/core'
import SingleColumn from '../../icons/SingleColumn.vue'
import DoubleColumn from '../../icons/DoubleColumn.vue'

import useReaderSettings from '../../../composables/useReaderSettings'
const { columns, setColumns } = useReaderSettings
const { width } = useWindowSize()

</script>

<template>
	<div class="w-full hidden md:grid grid-cols-3 gap-2 mt-3">
		<button
			class="col-span-1 text-primary text-center cursor-pointer py-3 rounded-sm border"
			:class="{
				'border-gray-300': columns !== 'single',
				'bg-primary-extralight border-2 border-primary': columns === 'single'
			}"
			@click.prevent="setColumns('single')"
			aria-label="Coluna única"
			title="Coluna única"
		>
			<SingleColumn class="mx-auto h-10 opacity-75" />
		</button>

		<button
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
