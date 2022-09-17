<script setup>
import IconEye from '../../icons/Eye.vue'
import OptionsColumns from './OptionsColumns.vue';
import OptionsFontFamily from './OptionsFontFamily.vue';
import OptionsFontSize from './OptionsFontSize.vue';
import OptionsColor from './OptionsColor.vue'
</script>

<template>
	<div class="absolute top-14 py-4 px-3 shadow-lg w-60 md:w-104
			text-areia -right-2 md:right-16 z-10 bg-white
		"
		role="Opções"
		aria-orientation="vertical"
		aria-labelledby="options-menu"
	>
		<div class="pb-3">
			<div class="w-full flex justify-center items-center py-3">
				<IconEye class="w-6 h-6" />
				<span class="ml-4">Visualização</span>
			</div>

			<OptionsColumns />
			<OptionsFontFamily />

			<div class="w-full grid grid-cols-4 gap-2 my-3">

				<OptionsFontSize />
				<OptionsColor />
			</div>

			<div class="hidden w-full border-b border-areia my-8"></div>
		</div>
	</div>
</template>
