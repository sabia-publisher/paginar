<script setup>
import IconEye from '../../icons/Eye.vue'
import OptionsColumns from './OptionsColumns.vue';
import OptionsFonts from './OptionsFonts.vue';
</script>

<template>
	<div class="absolute top-14 py-4 px-3 shadow-lg w-60 md:w-104
		text-areia -right-2 md:right-16 z-10 bg-white" role="Opções" aria-orientation="vertical"
		aria-labelledby="options-menu"
	>
		<div class="pb-3">

			<!-- <button @click.prevent="toggleAside('AsideFootnotes')"
							class="w-full flex justify-center items-center py-3 lowercase">
							<Icon name="Footnote" class="w-6 h-6" />
							<span class="ml-4">{{ $t('reader.footnotes') }}</span>
						</button>

						<div class="w-full border-b border-areia my-3"></div> -->

			<div class="w-full flex justify-center items-center py-3">
				<IconEye class="w-6 h-6" />
				<span class="ml-4">Visualização</span>
			</div>

			<OptionsColumns />
			<OptionsFonts />

			<!--<div class="w-full grid grid-cols-4 gap-2 my-3">

							<button @click.prevent="changeFontSize(fontSize + 1)"
								class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">+
								A</button>

							<button @click.prevent="changeFontSize(fontSize - 1)"
								class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center">-
								A</button>

							<button @click.prevent="changeMode" :title="$t('fromDarkmode')" :aria-label="$t('fromDarkmode')"
								class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
								:class="{
											'bg-areia text-terra': !darkmode
										}">
								<Icon name="Sun" class="w-5 h-5" />
							</button>

							<button @click.prevent="changeMode" :title="$t('toDarkmode')" :aria-label="$t('toDarkmode')"
								class="font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
								:class="{
											'bg-areia text-terra': darkmode
										}">
								<Icon name="Moon" class="w-5 h-5" />
							</button>
						</div>

						<div class="hidden w-full border-b border-areia my-8"></div>

						<form @submit.prevent class="hidden bg-white bg-opacity-30 my-3 border border-urucum">
							<input type="text"
								class="h-full w-full py-2 px-3 text-base rounded-none bg-transparent placeholder-white text-white"
								:placeholder="$t('reader.search')">
							<button class="bg-transparent w-12 flex justify-center items-center">
								<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</button>
						</form> -->

		</div>
	</div>
</template>
