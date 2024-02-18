<script setup lang="ts">
import { type BBox } from "~/stores/dataset"

const props = defineProps<{
	labelIndex: number,
	label: string,
	group: { url: string, name: string, bboxes: BBox[] }[],
}>()
</script>

<template>
	<div class="flex gap-4 items-center my-2 capitalize">
		<span class="font-semi-bold text-lg opacity-75">{{ label }}</span>
		<span class="text-xl font-light ">{{ group.length }}</span>
	</div>
	<div class="flex flex-wrap gap-3">
		<CardImage v-for="({ url, name, bboxes }, imageIndex) in group" :key="`${label}_${name}`" :url="url"
			:name="`${label}_${name}`" :bboxes="bboxes" :tabindex="labelIndex * 100 + imageIndex"
			class="focus:outline outline-4 outline-primary-400 h-64" />
	</div>
</template>