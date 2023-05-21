<script setup>
import IconSun from '../../icons/Sun.vue'
import IconMoon from '../../icons/Moon.vue'

import useReaderSettings from '../../../composables/useReaderSettings'
const { mode, setMode } = useReaderSettings

</script>

<template>
	<button id="lightmode-button" @click.prevent="setMode('light')"
		title="Leitura diurna"
		class="font-light text-base border w-full h-10 flex justify-center items-center"
		:class="{
			'bg-primary-extralight text-primary border-2 border-primary': mode === 'light'
		}">
		<IconSun class="w-5 h-5" />
	</button>

	<button id="darkmode-button" @click.prevent="setMode('dark')"
		title="Leitura noturna"
		class="font-light text-base border w-full h-10 flex justify-center items-center"
		:class="{
			'bg-primary-extralight text-primary border-2 border-primary':  mode === 'dark'
		}">
		<IconMoon class="w-5 h-5" />
	</button>
</template>
