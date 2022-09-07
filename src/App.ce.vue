<script>
import HeaderSlot from './components/HeaderSlot.ce.vue'

export default {
	components: {
		HeaderSlot
	},
	props: {
		propertyOne: {
			type: String,
			default: 'propertyOne: showing default prop... nothing from above'
		}
	}
}
</script>

<template>
	<header class="text-center">
		<p class="text-3xl font-bold underline">
			Pre-headerSlot
		</p>

		<div class="wrapper">
			<HeaderSlot>
				<template #header>
					<slot name="header" />
				</template>
			</HeaderSlot>
		</div>

		<p class="py-10">
			{{ propertyOne }}
		</p>

		<div class="contentSlot">
			<slot name="content" />
		</div>
	</header>
</template>

<style lang="scss" src="./assets/main.scss"></style>

<style>
</style>
