<script setup>
defineProps({
	msg: {
		type: String,
		required: true
	}
})
</script>

<template>
	<div class="greetings">
		<h1 class="green">{{ msg }}</h1>
		<slot name="header"></slot>
		<h3>
			You’ve successfully created a project with
			<a target="_blank" href="https://vitejs.dev/">Vite</a> +
			<a target="_blank" href="https://vuejs.org/">Vue 3</a>.
		</h3>
	</div>
</template>

<style>
h1 {
	font-weight: 500;
	font-size: 4.6rem;
	top: -10px;
}

h3 {
	font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
	text-align: center;
}

@media (min-width: 1024px) {

	.greetings h1,
	.greetings h3 {
		text-align: left;
	}
}
</style>
