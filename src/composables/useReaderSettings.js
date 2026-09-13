import { reactive, computed, watch } from 'vue'
import useStyles from './useStyles'

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
	columns: 'double',
	mode: 'light',
	blocked: false,
	readingProgressAvailable: false,
	readingProgressEnabled: false,

	bookTitle: null,
	chapterTitle: null,
	homeUrl: null,
})

const baseFont = computed(() => state.baseFont)
const textFont = computed(() => state.textFont)
const fontSize = computed(() => state.fontSize)
const fontsOptions = computed(() => state.fontsOptions)
const columns = computed(() => state.columns)
const mode = computed(() => state.mode)
const blocked = computed(() => state.blocked)
const readingProgressAvailable = computed(() => state.readingProgressAvailable)
const readingProgressEnabled = computed(() => state.readingProgressEnabled)

const bookTitle = computed(() => state.bookTitle)
const chapterTitle = computed(() => state.chapterTitle)
const homeUrl = computed(() => state.homeUrl)

watch(
	[baseFont, textFont, fontSize, columns, mode, readingProgressEnabled],
	() => saveSettings()
)

async function initSettings(settingsString) {
	const settings = settingsString
		? JSON.parse(settingsString)
		: null
	state.readingProgressAvailable = false
	state.readingProgressEnabled = false

	if (settings?.baseFont)
		state.baseFont = settings.baseFont

	if (settings?.textFont)
		state.textFont = settings.textFont

	if (settings?.fontSize)
		state.fontSize = Number(settings.fontSize)

	if (settings?.fontsOptions) {
		state.fontsOptions = settings.fontsOptions
		useStyles.fontLoader(settings.fontsOptions)

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

	if (settings?.bookTitle)
		state.bookTitle = settings.bookTitle

	if (settings?.chapterTitle)
		state.chapterTitle = settings.chapterTitle

	if (settings?.homeUrl)
		state.homeUrl = settings.homeUrl

	if (settings?.readingProgress &&
		typeof settings.readingProgress === 'object' &&
		!Array.isArray(settings.readingProgress)
	) {
		state.readingProgressAvailable = true
		state.readingProgressEnabled = settings.readingProgress.enabled !== false
	}

	loadSavedSettings(settings)
}

function loadSavedSettings(settings) {
	let hasSettings = null
	try {
		hasSettings = localStorage.getItem('readerSettings')
	} catch (error) {
		return
	}

	if (hasSettings) {
		let savedSettings = null
		try {
			savedSettings = JSON.parse(hasSettings)
		} catch (error) {
			return
		}

		state.fontSize = savedSettings.fontSize
		state.columns = savedSettings.columns
		state.mode = savedSettings.mode

		if (settings?.fontsOptions &&
			settings?.fontsOptions?.find(item => item.name === savedSettings.textFont)
		) {
			state.textFont = savedSettings.textFont
		}

		if (state.readingProgressAvailable &&
			typeof savedSettings.readingProgressEnabled === 'boolean'
		) {
			state.readingProgressEnabled = savedSettings.readingProgressEnabled
		}

		if (savedSettings.mode === 'dark') {
			const htmlRoot = document.querySelector('html')
			if (htmlRoot) {
				htmlRoot.classList.remove("light")
				htmlRoot.classList.add("dark")
			}
		}
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

function setBlocked(value) {
	state.blocked = value
}

function setReadingProgressEnabled(value) {
	if (state.readingProgressAvailable)
		state.readingProgressEnabled = Boolean(value)
}

function setMode(value) {
	state.mode = value

	const htmlRoot = document.querySelector('html')
	if (htmlRoot) {
		if (htmlRoot.classList.contains("dark")) {
			htmlRoot.classList.remove("dark")
			htmlRoot.classList.add("light")

		} else {
			htmlRoot.classList.remove("light")
			htmlRoot.classList.add("dark")
		}
	}
}

function saveSettings() {
	try {
		localStorage.setItem(
			'readerSettings',
			JSON.stringify({
			textFont: textFont.value,
			fontSize: fontSize.value,
			columns: columns.value,
			mode: mode.value,
			...(readingProgressAvailable.value
				? { readingProgressEnabled: readingProgressEnabled.value }
				: {})
			})
		)
	} catch (error) {
		// Settings remain available for the current session.
	}
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
	setBlocked,
	mode,
	blocked,
	readingProgressAvailable,
	readingProgressEnabled,
	setMode,
	setReadingProgressEnabled,
	saveSettings,

	bookTitle,
	chapterTitle,
	homeUrl
}
