<script setup>
import useReaderSettings from '../../../composables/useReaderSettings'
const { fontSize, setFontSize } = useReaderSettings

</script>

<template>
	<button id="fontsize-add-button" @click.prevent="setFontSize(fontSize + 1)"
		class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">
		+ A
	</button>

	<button id="fontsize-subtr-button" @click.prevent="setFontSize(fontSize - 1)"
		class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">
		- A
	</button>
</template>
