<script>
import HeaderSlot from './components/HeaderSlot.ce.vue'
import NavigationButton from './components/NavigationButton.ce.vue'

export default {
	components: {
		HeaderSlot,
		NavigationButton
	},
	props: {}
}
</script>

<template>
	<main>
		<header class="headerWrapper mb-10">
			<HeaderSlot>
				<template #header>
					<slot name="header" />
				</template>
			</HeaderSlot>
		</header>

		<div id="engine">
			<div class="engineWrapper overflow-hidden">
				<NavigationButton target="prev" />

				<div class="doubleColumns">
					<div class="[ typeArea ] h-full relative transition-opacity duration-100 opacity-100 px-24">
						<slot name="content" />
					</div>
				</div>

				<NavigationButton target="next" />
			</div>
		</div>
	</main>
</template>

<style lang="scss" src="./assets/main.css"></style>

<style>
</style>
