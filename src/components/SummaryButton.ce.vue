<script setup>
import useTextContent from '../composables/useTextContent'
const { summary } = useTextContent
</script>

<template>
	<button class="border p-3 shadow flex items-center
			 border-white text-white
			 ">
		<svg data-v-5a653ff5="" width="24" height="19" viewBox="0 0 24 19" fill="none" stroke="currentColor"
			xmlns="http://www.w3.org/2000/svg">
			<line x1="5" y1="1.08447" x2="1" y2="1.08447" stroke-width="2" stroke-linecap="round"></line>
			<line x1="23" y1="1.04248" x2="11" y2="1.04248" stroke-width="2" stroke-linecap="round"></line>
			<line x1="23" y1="9.08447" x2="14" y2="9.08447" stroke-width="2" stroke-linecap="round"></line>
			<line x1="8" y1="9.14905" x2="4" y2="9.14905" stroke-width="2" stroke-linecap="round"></line>
			<line x1="23" y1="17.149" x2="10.9993" y2="17.149" stroke-width="2" stroke-linecap="round"></line>
			<line x1="5" y1="17.2429" x2="1" y2="17.2429" stroke-width="2" stroke-linecap="round"></line>
		</svg>
		<span class="ml-3">Sumário</span>
	</button>
</template>

<style>
</style>
