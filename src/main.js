// https://maximomussini.com/posts/vue-custom-elements
import { defineCustomElement } from 'vue'

import App from './App.ce.vue'
import HelloWorld from './components/HelloWorld.ce.vue'

const styles = [
	...App.styles,
	...HelloWorld.styles
]

customElements.define(
	'paginate-content',
	defineCustomElement({
		...App,
		styles
	})
)
