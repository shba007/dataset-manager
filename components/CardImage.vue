<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { type BBox } from "~/stores/dataset"
import { useDataset } from '~/stores/dataset';

const props = defineProps<{
	url: string,
	name: string,
	bboxes: BBox[] // bbox in CCWH format normalized
}>()

const router = useRouter()
const datasetStore = useDataset()

const container = ref(null)
const { width, height } = useElementSize(container)

const computedBboxes = computed(() => props.bboxes.map(({ x, y, w, h, visibility }) => ({
	x: (x - w / 2) * width.value + 'px',
	y: (y - h / 2) * height.value + 'px',
	w: w * width.value + 'px',
	h: h * height.value + 'px',
	visibility,
})))
</script>

<template>
	<div ref="container" class="relative rounded-lg overflow-hidden" @dblclick="router.push(`/draft/${name}`)">
		<template v-for="{ x, y, w, h, visibility }, index in computedBboxes" :key="index">
			<div v-if="visibility" class="absolute rounded bg-primary-500/40 border border-primary-400"
				:style="{ top: y, left: x, width: w, height: h }" />
		</template>
		<span v-if="datasetStore.annotationsVisibility.label"
			class="absolute bottom-2 right-2 px-4 py-1 rounded-full max-w-32 text-white text-sm truncate bg-primary-400">
			{{ name }}
		</span>
		<img :src="url" :alt="name" loading="lazy" class="object-contain h-full" />
	</div>
</template>