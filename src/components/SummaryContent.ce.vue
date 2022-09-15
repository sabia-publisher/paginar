<script setup>
import { defineProps, onMounted } from 'vue'

import useTextContent from '../composables/useTextContent'
const { content, initContent } = useTextContent

const props = defineProps({
	bookSummary: String
})

onMounted(() => {
	initContent(props.bookSummary)
})
</script>

<template>
	<div>
		<div v-html="content"></div>
	</div>
</template>
