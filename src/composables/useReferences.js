import { computed, reactive } from 'vue'

const state = reactive({
	references: [],
	reference: null
})

const references = computed(() => state.references)

function setReferences(references) {
	state.references = references
}

const reference = computed(() => state.reference)

function setHighlightedReference(reference) {
	state.reference = reference
}

function applyReferences(contentRaw) {
	if (state.references.length === 0 || !contentRaw)
		return contentRaw

	return state.references.reduce((content, reference) => {
		if (!content) return content

		if (content.includes(reference.cit)) {
			const regex = new RegExp(reference.cit, 'g');
			const newContent = content.replace(
				regex,
				`<span class='reference' data-ref='${reference.cit}'>${reference.cit}</span>`
			)
			return newContent
		}
		return content
	}, contentRaw)
}

function applyReference(event) {
	const ref = state.references.find(item => item.cit === event.target.innerText)
	if (ref) {
		state.reference = ref
	}
}

export default {
	references,
	reference,
	applyReference,
	setReferences,
	setHighlightedReference,
	applyReferences,
}
