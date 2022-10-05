<script setup>
import useReaderSettings from '../../../composables/useReaderSettings'
const { textFont, fontsOptions, setTextFont } = useReaderSettings

</script>

<template>
	<div class="w-full grid grid-cols-4 gap-2 my-3">
		<button v-for="font in fontsOptions" :key="font.name" @click.prevent="setTextFont(font.name)"
			class="font-light text-lg text-primary tracking-wide border border-urucum w-full h-10 flex justify-center items-center"
			:class="{
				'bg-primary-extralight border-2 border-primary': textFont === font.name
			}" :style="`font-family: ${font.name}`" :title="font.label ?? font.name">
			Ff
		</button>
	</div>
</template>
