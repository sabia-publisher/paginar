export function isPaginarIgnoredEvent(event) {
	const path = event.composedPath?.() || []
	return path.some(node => node?.nodeType === 1 && node.matches(
		'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-paginar-ignore]'
	))
}
