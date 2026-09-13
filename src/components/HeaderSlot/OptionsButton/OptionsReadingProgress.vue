<script setup>
import useReadingProgress from '../../../composables/useReadingProgress'

const { enabled, setEnabled } = useReadingProgress
</script>

<template>
	<div class="w-full border-t border-areia mt-5 pt-5">
		<button
			id="reading-progress-button"
			class="w-full flex items-center justify-between py-2 px-1 text-left"
			type="button"
			role="switch"
			:aria-checked="enabled"
			@click.prevent="setEnabled(!enabled)"
		>
			<span>
				<span class="block text-primary lowercase">Retomar leitura</span>
				<span class="block text-xs text-gray-500 mt-1">Continuar de onde parou</span>
			</span>

			<span
				class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors"
				:class="enabled ? 'bg-primary' : 'bg-gray-300'"
				aria-hidden="true"
			>
				<span
					class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
					:class="enabled ? 'translate-x-5' : 'translate-x-0'"
				></span>
			</span>
		</button>
	</div>
</template>
