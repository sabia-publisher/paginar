<script setup>
import useReaderSettings from '../../../composables/useReaderSettings'
const { fontSize, setFontSize } = useReaderSettings

</script>

<template>
	<button @click.prevent="setFontSize(fontSize + 1)"
		class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">
		+ A
	</button>

	<button @click.prevent="setFontSize(fontSize - 1)"
		class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">
		- A
	</button>
</template>
