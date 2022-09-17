import { reactive, computed, watch } from 'vue'

const state = reactive({
	baseFont: 'Arial, sans-serif',
	columns: 'singleColumns'
})

const baseFont = computed(() => state.baseFont)
const columns = computed(() => state.columns)

async function initSettings(settingsString) {
	const settings = settingsString
		? JSON.parse(settingsString)
		: null

	if (settings?.baseFont)
		state.baseFont = settings.baseFont
}

function setColumns(value) {
	state.columns = value
}

export default {
	baseFont,
	columns,
	initSettings,
	setColumns
}
