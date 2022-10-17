<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'

import useFootnotes from '../composables/useFootnotes'
import useReaderSettings from '../composables/useReaderSettings'

import IconClose from '../components/icons/Close.vue'
import IconNotes from '../components/icons/Notes.vue'

const show = computed(() => useFootnotes.footnote.value)
const footnote = computed(() => useFootnotes.footnote.value)
const showFootnotes = computed(() => useFootnotes.showFootnotes.value)
const footnotes = computed(() => useFootnotes.footnotes.value)

const oldBlockedValue = ref(null)
const footnoteList = ref(null)

function hideAside() {
	useFootnotes.setHighlightedFootnote(null)
	useFootnotes.setShowFootnotes(false)
}

onKeyStroke('Escape', () => {
	if (footnote.value || showFootnotes.value) {
		hideAside()
	}
})

watch(
	[footnote, showFootnotes],
	() => {
		if (footnote.value || showFootnotes.value) {
			if (useReaderSettings.blocked.value === false) {
				oldBlockedValue.value = useReaderSettings.blocked.value
			}
			useReaderSettings.setBlocked(true)

		} else {
			if (oldBlockedValue.value === false) {
				useReaderSettings.setBlocked(oldBlockedValue.value)
			}
			oldBlockedValue.value = null
		}

		if (footnote.value) {
			setTimeout(() => {
				const element = footnoteList.value.querySelector(`#${footnote.value.id}`)
				element.scrollIntoView()
				element.focus()
			}, 50)
		}
	}
)

</script>

<template>
	<transition name="width">
		<div v-if="show || showFootnotes" id="asidebar"
			class="absolute top-0 right-0 w-96 md:w-[40em] flex-shrink-0 h-screen overflow-auto overflow-x-hidden z-20 shadow-2xl"
		>
			<button @click.prevent="hideAside()" class="fixed top-4 right-8 z-20">
				<IconClose class="w-6 h-6 text-white" />
			</button>

			<div class="w-full p-4">
				<header class="text-areia py-4 pl-4">
					<div class="flex items-center mb-6">
						<IconNotes class="w-8 h-8" />
						<span class="ml-4">

							Notas de rodapé
							<span class="ml-10">
								{{ footnotes.length }}
							</span>
						</span>
					</div>
				</header>

				<section>
					<ul ref="footnoteList">
						<li v-for="(footnoteItem, index) in footnotes"
							:key="footnoteItem.id"
							:id="footnoteItem.id"
							v-html="`<span class='footnote-index'>${index + 1}.</span> ${footnoteItem.text}`"
							class="text-left border-b border-b-white/25 last:border-transparent
								pb-10 mt-10 px-10 relative
							"
							:class="footnote && footnote.id !== footnoteItem.id
								? 'opacity-50'
								: 'opacity-100'
							"></li>
					</ul>
				</section>
			</div>
		</div>
	</transition>
</template>



<style scoped>
.width-enter-active,
.width-leave-active {
	transition: width .5s;
}

.width-enter-active>* {
	transition-property: opacity;
	transition-duration: .2s;
	transition-delay: .3s;
}

.width-leave-active>* {
	transition: opacity .25s;
}

.width-enter,
.width-leave-to {
	width: 0;
}
</style>
