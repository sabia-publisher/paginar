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
				`<span class='reference reference-${reference.cit.replaceAll(' ', '')}'>
					${reference.cit}
				</span>`
			)
			return newContent
		}
		return content
	}, contentRaw)
}

function applyReference(event) {
	const classList = event.target.closest('.reference')?.classList.value.split(' ')

	if (classList.length === 0)
		return

	const target = classList.find(item => item.startsWith('reference-'))

	if (target) {
		const ref = state.references.find(
			item => target && item.cit.replaceAll(' ', '') === target.replace('reference-', '')
		)
		if (ref) {
			state.reference = ref
		}
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
