<script setup>
import IconSun from '../../icons/Sun.vue'
import IconMoon from '../../icons/Moon.vue'

import useReaderSettings from '../../../composables/useReaderSettings'
const { mode, setMode } = useReaderSettings

</script>

<template>
	<button @click.prevent="setMode('light')"
		title="Leitura diurna"
		class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
		:class="{
			'bg-gray-100 text-gray-800 border-2 border-gray-500': mode === 'light'
		}">
		<IconSun class="w-5 h-5" />
	</button>

	<button @click.prevent="setMode('dark')"
		title="Leitura noturna"
		class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
		:class="{
			'bg-gray-100 text-gray-800 border-2 border-gray-500':  mode === 'dark'
		}">
		<IconMoon class="w-5 h-5" />
	</button>
</template>
