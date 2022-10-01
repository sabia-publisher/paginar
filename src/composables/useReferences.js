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
			var regex = new RegExp(reference.cit, "g");
			const newContent = content.replace(
				regex,
				`<span class="reference" data-ref="${reference.cit}">${reference.cit}</span>`
			);
			return newContent
		}
		return content
	}, contentRaw)
}

function listenToReferencesClick() {
	setTimeout(() => {
		var elements = document.getElementsByClassName("reference");

		for (var i = 0; i < elements.length; i++) {
			elements[i].addEventListener('click', getClickedReferenceData)
		}
	}, 250)
}

function getClickedReferenceData(event) {
	var attribute = event.target.getAttribute("data-ref")
	const ref = state.references.find(item => item.cit === attribute)
	if (ref) {
		state.reference = ref
	}
}

export default {
	references,
	reference,
	setReferences,
	setHighlightedReference,
	applyReferences,
	listenToReferencesClick
}
