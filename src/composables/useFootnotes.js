import { computed, reactive } from 'vue'

const state = reactive({
	footnotes: [],
	footnote: null
})

const footnotes = computed(() => state.footnotes)
function setFootnotes(footnotes) {
	state.footnotes = footnotes
}

const footnote = computed(() => state.footnote)
function setHighlightedFootnote(footnote) {
	state.footnote = footnote
}

function initFootnotes() {

}

export default {
	footnotes,
	footnote,
	setFootnotes,
	setHighlightedFootnote
}
