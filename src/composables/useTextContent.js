import { computed, reactive } from 'vue'

const state = reactive({
	summary: null,
	content: null
})

const content = computed(() => state.content)
const summary = computed(() => state.summary)

async function initContent(contentString) {
	const content = contentString
		? JSON.parse(contentString)
		: null

	if (content?.summary)
		state.summary = content.summary

	if (content?.summary?.[0]?.file) {
		getContent(content.summary?.[0]?.file)
	}
}

async function getContent(location) {
	try {
		const dataRef = await fetch(location)
		const text = await dataRef.text()
		state.content = text
	} catch (err) {
		console.log({ err })
		state.content = 'Ops, não foi possível carregar o arquivo solicitado.'
	}
}

export default {
	content,
	summary,
	initContent,
	getContent
}
