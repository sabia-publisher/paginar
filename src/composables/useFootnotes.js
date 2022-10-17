import { computed, reactive } from 'vue'

const state = reactive({
	footnotes: [],
	showFootnotes: false,
	footnote: null
})

const footnotes = computed(() => state.footnotes)
function setFootnotes(footnotes) {
	state.footnotes = footnotes
}

const showFootnotes = computed(() => state.showFootnotes)
function setShowFootnotes(value) {
	state.showFootnotes = value
}

const footnote = computed(() => state.footnote)
function setHighlightedFootnote(footnote) {
	state.footnote = footnote
}

function applyFootnote(event) {
	const classList = event.target.closest('.footnote')?.classList.value.split(' ')

	if (classList.length === 0)
		return

	const footnoteTarget = classList.find(
		item => item.includes('footnote') && item !== 'footnote'
	)

	if (footnoteTarget) {
		const ref = state.footnotes.find(item => item.id === footnoteTarget)
		if (ref) {
			state.footnote = ref
		}
	}
}

export default {
	footnotes,
	footnote,
	setFootnotes,
	applyFootnote,
	setHighlightedFootnote,
	setShowFootnotes,
	showFootnotes
}
