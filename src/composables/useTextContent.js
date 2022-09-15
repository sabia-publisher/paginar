import { computed, reactive } from 'vue'

const state = reactive({
	summary: null,
	content: null
})

const content = computed(() => state.content)

async function initContent(summaryString) {
	const summary = summaryString
		? JSON.parse(summaryString)
		: null

	if (summary?.[0]?.file) {
		getContent(summary?.[0]?.file)
	}
}

async function getContent(location) {
	console.log('chamou')
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
	initContent,
	getContent
}
