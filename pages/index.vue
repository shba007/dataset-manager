<script setup lang="ts">
import { useIpcRenderer } from '@vueuse/electron'
import { type Image, useDataset } from '~/stores/dataset';

const datasetStore = useDataset()

const router = useRouter()
const ipcRenderer = useIpcRenderer()
const versions = ipcRenderer.invoke<string>('versions')

function importImages() {
	const importedImages = ipcRenderer.sendSync<Image[]>('open-image').value

	if (!importedImages)
		return

	console.log(importedImages)

	for (let { label, name, url, bboxes } of importedImages) {
		if (label in datasetStore.images)
			datasetStore.images[label].push({ name, url, bboxes })
		else
			datasetStore.images[label] = [{ name, url, bboxes }]
	}

	router.push('/annotated')
}

function clearImages() {
	datasetStore.images = {}
}
</script>

<template>
	<main class="flex-1 relative flex items-center justify-center m-4">
		<button class="px-4 py-2 rounded-lg text-white bg-primary-500 hover:bg-primary-400" @click="importImages">
			Import Dataset
		</button>
	</main>
</template>