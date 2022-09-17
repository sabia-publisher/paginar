import { reactive, computed, watch } from 'vue'

const state = reactive({
	baseFont: 'Arial, sans-serif'
})

const baseFont = computed(() => state.baseFont)

async function initSettings(settingsString) {
	const settings = settingsString
		? JSON.parse(settingsString)
		: null

	if (settings?.baseFont)
		state.baseFont = settings.baseFont
}

export default {
	baseFont,
	initSettings
}
