<script setup lang="ts">
import { useDataset } from '~/stores/dataset';

const datasetStore = useDataset()

function toggleStatus(type: 'label' | 'bbox' | 'mask') {
	datasetStore.annotationsVisibility[type] = !datasetStore.annotationsVisibility[type]
}
</script>

<template>
	<div class="fixed bottom-2 right-2 flex flex-col gap-1 rounded-full p-1 bg-white text-xl z-10">
		<NuxtIcon name="tag" class="rounded-full p-3 hover:text-white bg-light-400 hover:bg-primary-400 cursor-pointer"
			:class="{ 'bg-primary-500 text-white': datasetStore.annotationsVisibility.label }" @click="toggleStatus('label')" />
		<NuxtIcon name="crop" class="rounded-full p-3 hover:text-white bg-light-400 hover:bg-primary-400 cursor-pointer"
			:class="{ 'bg-primary-500 text-white': datasetStore.annotationsVisibility.bbox }" @click="toggleStatus('bbox')" />
		<NuxtIcon name="intersect" class="rounded-full p-3 hover:text-white bg-light-400 hover:bg-primary-400 cursor-pointer"
			:class="{ 'bg-primary-500 text-white': datasetStore.annotationsVisibility.mask }" @click="toggleStatus('mask')" />
	</div>
</template>