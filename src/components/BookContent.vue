<script setup>
import { defineProps, onMounted, ref } from 'vue'

import useTextContent from '../composables/useTextContent'
const { content, initContent } = useTextContent

const props = defineProps({
	bookContent: String
})

const contentWrapper = ref(null)

onMounted(() => {
	initContent(props.bookContent, contentWrapper)
})
</script>

<template>
	<div ref="contentWrapper">
		<div v-if="content" v-html="content"></div>
		<slot v-else name="content"></slot>
	</div>
</template>
