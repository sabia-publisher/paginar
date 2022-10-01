import { computed, reactive } from 'vue'

import useReferences from './useReferences'

const state = reactive({
	summary: null,
	content: null
})

const content = computed(() => state.content)
const summary = computed(() => state.summary)

async function initContent(contentString) {
	const { setReferences, applyReferences, listenToReferencesClick } = useReferences

	const content = contentString
		? JSON.parse(contentString)
		: null

	if (content?.summary)
		state.summary = content.summary

	if (content?.references)
		setReferences(content.references)

	// if content comes from file, apply references to file
	if (content?.summary?.[0]?.file) {
		const text = await getContent(content.summary?.[0]?.file)
		const newContent = applyReferences(text)
		state.content = newContent

	// else if content comes from slot, apply references to slot
	} else {
		const content = document.querySelectorAll('[slot="content"]')

		if (content && content?.[0]?.innerHTML) {
			const newContent = applyReferences(content?.[0]?.innerHTML)
			if (newContent) {
				content[0].innerHTML = newContent
			}
		}
	}

	listenToReferencesClick()
}

async function getContent(location) {
	try {
		const dataRef = await fetch(location)
		const text = await dataRef.text()
		return text
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
