<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { type BBox } from "~/stores/dataset"
import { useDataset } from '~/stores/dataset';

interface ExtededBbox extends BBox {
	active: boolean
}

const props = defineProps<{
	url: string,
	name: string,
	bboxes: ExtededBbox[] // bbox in XYXY format normalized
}>()

const router = useRouter()
const datasetStore = useDataset()

const container = ref(null)
const { width, height } = useElementSize(container)
const { x, y } = useMouseInElement(container)
const pointer = reactive({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, isDraging: false })
const pointerDelta = computed(() => ({ x: pointer.end.x - pointer.start.x, y: pointer.end.y - pointer.start.y }))

const emit = defineEmits<{
	(event: 'change-active', index: number): void,
	(event: 'change-bbox', index: number, prop: 'x1' | 'y1' | 'x2' | 'y2', value: number): void
}>()

const computedBboxes = computed(() => props.bboxes.map(({ x1, y1, x2, y2, visibility, active }) => ({
	x: x1 * width.value + 'px',
	y: y1 * height.value + 'px',
	w: (x2 - x1) * width.value + 'px',
	h: (y2 - y1) * height.value + 'px',
	visibility,
	active
})))

function resize(index: number, bboxProp: 'x1' | 'x2' | 'y1' | 'y2', state: 'start' | 'move' | 'end') {
	if (pointer.isDraging) {
		let value = 0

		switch (bboxProp) {
			case 'x1':
				value = props.bboxes[index].x1 * width.value + pointerDelta.value.x
				break;
			case 'x2':
				value = props.bboxes[index].x2 * width.value + pointerDelta.value.x
				break;
			case 'y1':
				value = props.bboxes[index].y1 * height.value + pointerDelta.value.y
				break;
			case 'y2':
				value = props.bboxes[index].y2 * height.value + pointerDelta.value.y
				break;
		}

		// console.log("pointerDelta", bboxProp, { value })
		emit('change-bbox', index, bboxProp, value)
	}

	if (state === 'start') {
		pointer.isDraging = true
		pointer.start.x = x.value
		pointer.start.y = y.value
		pointer.end.x = x.value
		pointer.end.y = y.value
	}

	if (state === 'move' && pointer.isDraging) {
		pointer.end.x = x.value
		pointer.end.y = y.value
	}

	if (state === 'end') {
		pointer.isDraging = false
		pointer.start.x = 0
		pointer.start.y = 0
		pointer.end.x = 0
		pointer.end.y = 0
	}
}

function translate(index: number) {

}
</script>

<template>
	<div ref="container" class="relative rounded-lg overflow-hidden select-none" @dblclick="router.push(`/draft/${name}`)">
		<template v-for="{ x, y, w, h, visibility, active }, index in computedBboxes" :key="index">
			<div v-if="visibility" class="absolute rounded border border-primary-400 bg-primary-500/40"
				:class="{ 'border-secondary-500 bg-secondary-500/40 resize z-10': active }"
				:style="{ top: y, left: x, width: w, height: h }" @click="emit('change-active', index)"
				@mousedown="translate(index)">
				<div v-if="active" class="relative w-full h-full">
					<!-- Corner Handlers -->
					<template
						v-for="{ bboxProp } in ([{ bboxProp: 'x1y1' }, { bboxProp: 'x2y1' }, { bboxProp: 'x2y2' }, { bboxProp: 'x1y2' }] as const)"
						:key="bboxProp">
						<div class="absolute w-3 aspect-square border border-secondary-500 bg-secondary-500" :class="{
							'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize': bboxProp === 'x1y1',
							'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize': bboxProp === 'x2y1',
							'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize': bboxProp === 'x2y2',
							'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-se-resize': bboxProp === 'x1y2'
						}" />
					</template>
					<!-- Side Handlers -->
					<template
						v-for="{ bboxProp } in ([{ bboxProp: 'x1' }, { bboxProp: 'y1' }, { bboxProp: 'x2' }, { bboxProp: 'y2' }] as const)"
						:key="bboxProp">
						<div class="absolute" :class="{
							'left-0 top-0 bottom-0 -translate-x-1/2 w-16 cursor-e-resize': bboxProp === 'x1',
							'top-0 left-0 right-0 -translate-y-1/2 h-16 cursor-n-resize': bboxProp === 'y1',
							'right-0 top-0 bottom-0 translate-x-1/2 w-16 cursor-w-resize': bboxProp === 'x2',
							'bottom-0 left-0 right-0 translate-y-1/2 h-16 cursor-s-resize': bboxProp === 'y2'
						}" @mousedown="resize(index, bboxProp, 'start')" @mousemove="resize(index, bboxProp, 'move')"
							@mouseup="resize(index, bboxProp, 'end')" />
					</template>
				</div>
			</div>
		</template>
		<span v-if="datasetStore.annotationsVisibility.label"
			class="absolute bottom-2 right-2 px-4 py-1 rounded-full max-w-32 text-white text-sm truncate bg-primary-400">
			{{ name }}
		</span>
		<img :src="url" :alt="name" loading="lazy" class="object-contain h-full" />
	</div>
</template>