import { computed, reactive } from 'vue'
import { useEventListener } from '@vueuse/core'

import useReferences from './useReferences'
import useFootnotes from './useFootnotes'

const state = reactive({
	summary: null,
	content: null
})

const content = computed(() => state.content)
const summary = computed(() => state.summary)

async function initContent(contentString, contentWrapper) {
	const { setReferences, applyReferences } = useReferences
	const { setFootnotes } = useFootnotes

	const content = contentString
		? JSON.parse(contentString)
		: null

	if (content?.summary)
		state.summary = content.summary

	if (content?.references)
		setReferences(content.references)

	if (content?.footnotes)
		setFootnotes(content.footnotes)

	// if content comes from file, apply references to file
	if (content?.summary?.[0]?.file) {
		const text = await getContent(content.summary?.[0]?.file)
		const newContent = content.applyReferences
			? applyReferences(text)
			: text
		state.content = newContent

	// else if content comes from slot, apply references to slot
	} else {
		const content = document.querySelectorAll('[slot="content"]')

		if (content && content?.[0]?.innerHTML && content.applyReferences) {
			const newContent = applyReferences(content?.[0]?.innerHTML)
			if (newContent) {
				content[0].innerHTML = newContent
			}
		}
	}

	// after applying references above, now we start to listen to its clicks
	listenToClicks(contentWrapper)
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

function applyContent(text) {
	const { applyReferences } = useReferences
	const newContent = applyReferences(text)
	state.content = newContent
}

function listenToClicks(contentWrapper) {
	setTimeout(() => {
		useEventListener(contentWrapper, 'click', getClickedReferenceData)
	}, 100)
}

function getClickedReferenceData(event) {
	if (event.target.closest('.reference')) {
		useReferences.applyReference(event)
	}

	if (event.target.closest('.footnote')) {
		useFootnotes.applyFootnote(event)
	}
}

export default {
	content,
	summary,
	initContent,
	getContent,
	applyContent,
	listenToClicks
}
