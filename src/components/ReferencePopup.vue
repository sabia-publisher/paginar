<script setup>
import { onKeyStroke } from '@vueuse/core'
import useReferences from '../composables/useReferences'
const { reference, setHighlightedReference } = useReferences

function closeRef() {
	setHighlightedReference(null)
}

onKeyStroke('Escape', () => {
	setHighlightedReference(null)
})

</script>

<template>
	<transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95"
		enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-200"
		leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
		<div v-if="reference" tabindex="0" class="[ reference-popup ] bg-gray-800 text-white fixed z-40 bottom-0 md:bottom-14 right-0 md:right-3
				rounded flex justify-between
				p-4 shadow w-full md:w-2/5
			">
			<p class="w-4/5" v-html="reference.ref"></p>

			<div class="mt-3 flex self-end">
				<button @click.prevent="closeRef()" class="button button-negative">OK</button>
			</div>
		</div>
	</transition>
</template>
