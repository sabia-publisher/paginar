<script setup>
import { defineProps } from 'vue'

import useTextContent from '../composables/useTextContent'
const { content, initContent } = useTextContent

const props = defineProps({
	bookSummary: String
})

initContent(props.bookSummary)
</script>

<template>
	<div v-html="content"></div>
</template>
