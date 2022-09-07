// https://maximomussini.com/posts/vue-custom-elements
import { defineCustomElement } from 'vue'

import App from './App.ce.vue'
import HeaderSlot from './components/HeaderSlot.ce.vue'

import tailwindStyles from  './tailwind.css'

const styles = [
	...App.styles,
	...HeaderSlot.styles,
	...[tailwindStyles]
]

customElements.define(
	'paginate-content',
	defineCustomElement({
		...App,
		styles
	})
)
