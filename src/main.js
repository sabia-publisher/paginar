// https://maximomussini.com/posts/vue-custom-elements
import { defineCustomElement } from 'vue'

import App from './App.ce.vue'

import tailwindStyles from  './tailwind.css'

const styles = [
	...[tailwindStyles],
	...App.styles
]

const PaginateContent = defineCustomElement({ ...App, styles })

// Vue hosts >= 3.5.22 call these hooks. The bundled 3.5.21 runtime has
// no batching work to perform; never replace a runtime's own implementation.
for (const hook of ['_beginPatch', '_endPatch']) {
	if (typeof PaginateContent.prototype[hook] !== 'function')
		Object.defineProperty(PaginateContent.prototype, hook, { value() {}, configurable: true, writable: true })
}

customElements.define('paginate-content', PaginateContent)
