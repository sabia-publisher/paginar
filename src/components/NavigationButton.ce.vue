<script>
export default {
	name: "NavPrev",

	props: {
		target: String,
	},

	computed: {
		type() {
			return 'chapter'
		},
	}
};
</script>

<template>
	<button @click.prevent="$emit('clicked')" class="[ viewer-nav ]"
		:class="type === 'cover' ? 'text-white' : 'text-gray-dark'">

		<svg v-if="target === 'prev'" viewBox="0 0 20 20" fill="currentColor" class="[ viewer-nav-icon nav-prev ] arrow-narrow-left">
			<path fill-rule="evenodd"
				d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
				clip-rule="evenodd"></path>
		</svg>

		<svg v-if="target === 'next'" data-v-ef9c31bc="" viewBox="0 0 20 20" fill="currentColor"
			class="[ viewer-nav-icon nav-next ] right-0 arrow-narrow-right">
			<path fill-rule="evenodd"
				d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
				clip-rule="evenodd"></path>
		</svg>
	</button>
</template>
