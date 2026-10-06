import { fileURLToPath, URL } from 'node:url'

import { defineConfig, transformWithEsbuild } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite keeps whitespace in ES library output to preserve tree-shaking hints.
// The bundle only registers a custom element and is loaded as-is from CDNs,
// so finish the minification after Vite's own pass, keeping license notices.
function minifyWhitespace() {
	return {
		name: 'paginar-minify-whitespace',
		apply: 'build',
		enforce: 'post',
		renderChunk: {
			// Run after Vite's esbuild pass, which would reintroduce whitespace.
			order: 'post',
			async handler(code, chunk) {
				const result = await transformWithEsbuild(code, chunk.fileName, {
					format: 'esm',
					target: 'esnext',
					minifyWhitespace: true,
					legalComments: 'eof',
					sourcemap: true
				})
				return { code: result.code, map: result.map }
			}
		}
	}
}

// `vite build --mode vue-external` emits an additional bundle that imports
// `vue` from the host application instead of embedding its own runtime.
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [vue(), minifyWhitespace()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},

	define: {
		'process.env.NODE_ENV': JSON.stringify('production')
	},

	server: {
		host: true
	},

	build: {
		lib: {
			entry: 'src/main.js',
			formats: ['es'],
			name: 'PaginateContent',
			fileName: format => mode === 'vue-external'
				? `index.vue-external.${format}.js`
				: `index.${format}.js`
		},
		rollupOptions: {
			external: mode === 'vue-external' ? ['vue'] : []
		},
		// The second build adds its bundle next to the default one.
		emptyOutDir: mode !== 'vue-external',
		sourcemap: true,
		// Reduce bloat from legacy polyfills.
		target: 'esnext',
		// CDN consumers load dist/ directly, without their own minification step.
		minify: 'esbuild',
	}
}))
