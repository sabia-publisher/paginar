<script>
import HelloWorld from './components/HelloWorld.ce.vue'

export default {
	components: {
		HelloWorld
	},
	props: ['propertyOne']
}
</script>

<template>
	<header>
		<div class="wrapper">
			<HelloWorld msg="You did it!">
				<template #header>
					<slot name="header" />
				</template>
			</HelloWorld>
		</div>

		{{ propertyOne }}

		<div>
			<slot name="content" />
		</div>
	</header>
</template>

<style lang="scss" src="./assets/main.scss"></style>

<style>
header {
	background: red
}

* {
	color: pink
}
</style>
