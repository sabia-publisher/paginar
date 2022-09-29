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

function initReferences(contentRaw) {
	if (state.references.length === 0 || !contentRaw)
		return contentRaw

	return state.references.reduce((content, reference) => {
		if (!content) return content

		if (content.includes(reference.key)) {
			var regex = new RegExp(reference.key, "g");
			const newContent = content.replace(
				regex,
				`<span class="reference" data-ref="${reference.key}">${reference.key}</span>`
			);
			return newContent
		}
		return content
	}, contentRaw)
}

export default {
	references,
	reference,
	setReferences,
	setHighlightedReference,
	initReferences
}
