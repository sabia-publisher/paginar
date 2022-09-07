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
	<header>
		<p>Pre-headerSlot</p>

		<div class="wrapper">
			<HeaderSlot>
				<template #header>
					<slot name="header" />
				</template>
			</HeaderSlot>
		</div>

		<p class="propParagraph">
			{{ propertyOne }}
		</p>

		<div class="contentSlot">
			<slot name="content" />
		</div>
	</header>
</template>

<style lang="scss" src="./assets/main.scss"></style>

<style>
header {
	background: #eee
}

* {
	color: black;
	text-align: center;
}

.propParagraph {
	margin: 25px 0
}

.contentSlot {
	text-align: center;
		border: 1px dotted #000;
}
</style>
