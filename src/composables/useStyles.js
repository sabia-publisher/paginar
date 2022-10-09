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

		} catch (err) {
			console.log({ err })
		}
	}
}

async function applyStylesheet(stylesheet, ref) {
	const style = document.createElement('style')
	ref.value.appendChild(style)
	style.type = 'text/css'
	style.appendChild(document.createTextNode(stylesheet))
}

export default {
	fontLoader,
	stylesheetLoader,
	applyStylesheet
}
