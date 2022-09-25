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
			class="col-span-1 text-center cursor-pointer py-3 rounded-sm border"
			:class="{
				'border-gray-300': columns !== 'singleColumns',
				'bg-gray-100 text-gray-800 border-2 border-gray-500': columns === 'singleColumns'
			}"
			@click.prevent="setColumns('singleColumns')"
			aria-label="Coluna única"
			title="Coluna única"
		>
			<SingleColumn class="mx-auto h-10 opacity-75" />
		</button>

		<button
			class="col-span-2 text-center cursor-pointer py-3 rounded-sm border"
			:class="{
				'border-gray-300': columns !== 'doubleColumns',
				'bg-gray-100 text-gray-800 border-2 border-gray-500': columns === 'doubleColumns',
				'opacity-30 bg-gray-300': width < 1024
			}"
			@click.prevent="width >= 1024 && setColumns('doubleColumns')"
			aria-label="Coluna dupla"
			title="Coluna dupla"
		>
			<DoubleColumn name="DoubleColumn" class="mx-auto h-10 divide-opacity-75" />
		</button>
	</div>
</template>
