<script setup>
import { inject, nextTick, watch } from 'vue'
import { searchKey } from '../../composables/useSearch'
import IconClose from '../icons/Close.vue'

const search = inject(searchKey)
const { enabled, open, query, input, button, total, status, pending, panel, results, active } = search

watch(panel, async value => {
	if (value && open.value) {
		await nextTick()
		input.value?.focus({ preventScroll: true })
	}
})

watch(active, async () => {
	await nextTick()
	if (panel.value)
		input.value?.getRootNode().querySelector('.search-result[aria-current="true"]')
			?.scrollIntoView({ block: 'nearest' })
})

async function selectResult(index) {
	search.navigate(index)
	await nextTick()
	input.value?.getRootNode().querySelector('.search-result[aria-current="true"]')
		?.focus({ preventScroll: true })
}

function clearQuery() {
	query.value = ''
	input.value?.focus({ preventScroll: true })
}
</script>

<template>
	<div v-if="enabled" id="search-menu">
		<button ref="button" id="search-button" type="button"
			class="search-icon-button border p-3 shadow flex items-center border-white text-white"
			aria-label="Buscar no texto" title="Buscar no texto (Ctrl+F)"
			aria-controls="search-dropdown" :aria-expanded="open"
			@click="open ? search.close() : search.show()"
		>
			<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" aria-hidden="true">
				<circle cx="10.5" cy="10.5" r="6.5" />
				<path d="m16 16 5 5" />
			</svg>
		</button>
		<form v-show="open" id="search-dropdown" role="search" aria-label="Buscar no texto"
			:class="{ 'search-panel': panel }"
			@submit.prevent="search.step(1)" @wheel.stop @keydown.stop
			@keydown.esc.prevent="search.close()"
		>
			<h2 v-if="panel" class="search-panel-title">Resultados da busca</h2>
			<div class="search-input-row">
				<div class="search-input-control">
					<input id="search-input" ref="input" v-model="query" type="search"
						placeholder="Palavra ou expressão" autocomplete="off" spellcheck="false"
						aria-label="Buscar no texto" aria-describedby="search-status"
						@keydown.enter.prevent="!$event.isComposing && search.step($event.shiftKey ? -1 : 1)"
					/>
					<button v-if="query" id="search-clear-button" class="search-icon-button" type="button"
						aria-label="Limpar busca" title="Limpar busca" @click="clearQuery">
						<IconClose class="w-4 h-4" aria-hidden="true" />
					</button>
				</div>
				<button class="search-icon-button" type="button" aria-label="Fechar busca" title="Fechar (Esc)" @click="search.close()">
					<IconClose class="w-6 h-6" aria-hidden="true" />
				</button>
			</div>
			<div class="search-results-row">
				<span id="search-status" role="status" aria-live="polite">{{ status }}</span>
				<button class="search-icon-button" type="button" aria-label="Ocorrência anterior" title="Anterior (Shift+Enter)"
					:disabled="!total || pending" @click="search.step(-1)">
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="m6 14 6-6 6 6" />
					</svg>
				</button>
				<button class="search-icon-button" type="button" aria-label="Próxima ocorrência" title="Próxima (Enter)"
					:disabled="!total || pending" @click="search.step(1)">
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="m6 10 6 6 6-6" />
					</svg>
				</button>
			</div>
			<button id="search-view-button" class="search-icon-button" type="button"
				:aria-expanded="panel" aria-controls="search-result-list" @click="panel = !panel">
				{{ panel ? 'Usar busca compacta' : 'Ver trechos' }}
			</button>
			<ol v-if="panel" id="search-result-list" :aria-busy="pending" aria-label="Trechos encontrados">
				<li v-for="(result, index) in results" :key="`${result.source}:${result.id}`">
					<button type="button" class="search-result" :aria-current="active === index ? 'true' : undefined"
						@click="selectResult(index)"
						@keydown.down.prevent.stop="selectResult(index + 1)"
						@keydown.up.prevent.stop="selectResult(index - 1)">
						<span class="search-result-location">{{ result.source === 'local'
							? `Neste capítulo${result.page ? ` · Página ${result.page}` : ''}`
							: result.chapterTitle || 'Outro capítulo' }}</span>
						<span class="search-result-excerpt">{{ result.before }}<mark>{{ result.match }}</mark>{{ result.after }}</span>
					</button>
				</li>
			</ol>
		</form>
	</div>
</template>
