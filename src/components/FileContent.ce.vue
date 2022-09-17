<script setup>
import { defineProps, onMounted } from 'vue'

import useTextContent from '../composables/useTextContent'
const { content, initContent } = useTextContent

const props = defineProps({
	bookContent: String
})

onMounted(() => {
	initContent(props.bookContent)
})
</script>

<template>
	<div>
		<div v-html="content"></div>
	</div>
</template>
