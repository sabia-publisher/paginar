import { reactive, computed, watch } from 'vue'

const state = reactive({
	baseFont: 'Arial, sans-serif',
	textFont: 'Times New Roman, serif',
	fontsOptions: [
		{ name: 'Times New Roman, serif' },
		{ name: 'Georgia, serif' },
		{ name: 'Arial, sans-serif' },
		{ name: 'Verdana, sans-serif' },
	],
	fontSize: 16,
	columns: 'singleColumns',
	mode: 'light'
})

const baseFont = computed(() => state.baseFont)
const textFont = computed(() => state.textFont)
const fontSize = computed(() => state.fontSize)
const fontsOptions = computed(() => state.fontsOptions)
const columns = computed(() => state.columns)
const mode = computed(() => state.mode)

watch(
	[baseFont, textFont, fontSize, columns, mode],
	() => saveSettings()
)

async function initSettings(settingsString) {
	const settings = settingsString
		? JSON.parse(settingsString)
		: null

	if (settings?.baseFont)
		state.baseFont = settings.baseFont

	if (settings?.textFont)
		state.textFont = settings.textFont

	if (settings?.fontSize)
		state.fontSize = Number(settings.fontSize)

	if (settings?.fontsOptions) {
		state.fontsOptions = settings.fontsOptions
		fontLoader(settings.fontsOptions)

		// baseFont
		const defaultBaseFont = settings.fontsOptions.find(
			item => item.defaultBaseFont
		)
		if (defaultBaseFont)
			state.baseFont = defaultBaseFont.name

		// textFont
		const defaultTextFont = settings.fontsOptions.find(
			item => item.defaultTextFont
		)
		if (defaultTextFont)
			state.textFont = defaultTextFont.name
	}

	loadSavedSettings(settings)
}

function loadSavedSettings(settings) {
	const hasSettings = localStorage.getItem('readerSettings')

	if (hasSettings) {
		const savedSettings = JSON.parse(hasSettings)

		state.fontSize = savedSettings.fontSize
		state.columns = savedSettings.columns
		state.mode = savedSettings.mode

		if (settings?.fontsOptions &&
			settings?.fontsOptions?.find(item => item.name === savedSettings.textFont)
		) {
			state.textFont = savedSettings.textFont
		}
	}
}

function fontLoader(fontsOptions) {
	const fontsToLoad = fontsOptions.filter(item => item.link)

	if (fontsToLoad.length > 0) {
		const style = document.createElement('style')
		const head = document.head || document.getElementsByTagName('head')[0]
		head.appendChild(style)

		style.type = 'text/css'
		let css = ''
		fontsToLoad.forEach(
			item => css = css + `@import url(${item.link}); \n`
		)
		style.appendChild(document.createTextNode(css))
	}
}

function setColumns(value) {
	state.columns = value
}

function setTextFont(value) {
	state.textFont = value
}

function setFontSize(value) {
	state.fontSize = value
}

function setMode(value) {
	state.mode = value
}

function saveSettings() {
	localStorage.setItem(
		'readerSettings',
		JSON.stringify({
			textFont: textFont.value,
			fontSize: fontSize.value,
			columns: columns.value,
			mode: mode.value
		})
	)
}

export default {
	baseFont,
	textFont,
	fontSize,
	fontsOptions,
	columns,
	initSettings,
	setColumns,
	setTextFont,
	setFontSize,
	mode,
	setMode,
	saveSettings
}
