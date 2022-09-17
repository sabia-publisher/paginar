<script setup>
import usePagination from '../composables/usePagination'
import useReaderSettings from '../composables/useReaderSettings'

const { columns } = useReaderSettings
const { currentPage } = usePagination
</script>

<template>
	<div :class="columns" :style="`margin-left: -${100 * (currentPage - 1)}%`">
		<div class="[ typeArea ] h-full relative
			transition-opacity duration-100 opacity-100 px-24">
			<slot></slot>
		</div>
	</div>
</template>
