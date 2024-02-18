<script setup lang="ts">
// import { useIpcRenderer } from '@vueuse/electron'
import { useDataset } from '~/stores/dataset';

const datasetStore = useDataset()

// const ipcRenderer = useIpcRenderer()

const images = computed(() => datasetStore.images)
</script>

<template>
	<main class="flex-1 relative flex p-4 mr-1 overflow-y-scroll">
		<section class="relative">
			<div v-for="(label, labelIndex) in Object.keys(images)" :key="label">
				<GroupImage :labelIndex="labelIndex" :label="label" :group="images[label]" />
			</div>
		</section>
		<ActionButtons />
	</main>
</template>