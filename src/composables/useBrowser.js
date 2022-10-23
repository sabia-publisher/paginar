const isSafari = [
	'iPad Simulator',
	'iPhone Simulator',
	'iPod Simulator',
	'iPad',
	'iPhone',
	'iPod'
].includes(navigator.platform)
	|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)

const isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

export default {
	isSafari,
	isApple
}
