// https://maximomussini.com/posts/vue-custom-elements
import { defineCustomElement } from 'vue'

import tailwindStyles from  './tailwind.css'

import App from './App.ce.vue'
import HeaderSlot from './components/HeaderSlot.ce.vue'

const styles = [
	...App.styles,
	...HeaderSlot.styles,
	...[tailwindStyles]
]

console.log({ styles: styles })

customElements.define(
	'paginate-content',
	defineCustomElement({
		...App,
		styles
	})
)
