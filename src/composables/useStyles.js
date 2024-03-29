function initStyles(props, rootComponent) {
	const settings = props.readerSettings
		? JSON.parse(props.readerSettings)
		: null

	if (props.cssFile) {
		stylesheetLoader(props.cssFile, rootComponent)
	}

	if (props.cssString) {
		applyStylesheet(props.cssString, rootComponent)
	}

	if (settings?.cssString) {
		applyStylesheet(settings.cssString, rootComponent)
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

async function stylesheetLoader(stylesheet, ref) {
	if (stylesheet) {
		try {
			const dataRef = await fetch(stylesheet)
			const cssText = await dataRef.text()

			applyStylesheet(cssText, ref)

		} catch (_) {}
	}
}

async function applyStylesheet(stylesheet, ref) {
	const style = document.createElement('style')
	ref.value.appendChild(style)
	style.type = 'text/css'
	style.appendChild(document.createTextNode(stylesheet))
}

export default {
	initStyles,
	fontLoader,
	stylesheetLoader,
	applyStylesheet
}
