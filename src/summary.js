export function isNavigable(item) {
	return Boolean(item && !item.disabled && (item.link || item.file))
}

export function nearestNavigable(chapters, from, step) {
	for (let index = from; index >= 0 && index < chapters.length; index += step) {
		if (isNavigable(chapters[index])) return chapters[index]
	}
	return null
}
