import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},

	define: {
		'process.env': {}
	},

	build: {
		lib: {
			entry: 'src/main.js',
			formats: ['es'],
			name: 'PaginateContent',
			fileName: format => `index.${format}.js`
		},
		sourcemap: true,
		// Reduce bloat from legacy polyfills.
		target: 'esnext',
		// Leave minification up to applications.
		minify: false,
	}
})
