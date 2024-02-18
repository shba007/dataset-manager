<script setup lang="ts">
definePageMeta({
	layout: false
})

const route = useRoute()
const id = computed(() => {
	const [label, name] = (route.params.id as string).split("_")
	return { label, name }
})

const datasetStore = useDataset()

const cardImage = ref(null)
const { width, height } = useElementSize(cardImage)

const dataPointIndex = computed(() => datasetStore.images[id.value.label].findIndex(({ name }) => id.value.name === name))
const dataPoint = computed(() => datasetStore.images[id.value.label][dataPointIndex.value] ?? null)
const computedBboxes = computed(() => dataPoint.value.bboxes.map(({ x, y, w, h, visibility }) => ({
	x: Math.round((x - w / 2) * width.value),
	y: Math.round((y - h / 2) * height.value),
	w: Math.round(w * width.value),
	h: Math.round(h * height.value),
	visibility,
})))

const tools = [
	{ name: 'move', icon: 'move' },
	{ name: 'marquee', icon: 'crop' }
]
const activeTool = ref('move')
const zoomLevel = ref(70)
const activeLayer = ref<number | null>(null)

function toggleBbox(index: number) {
	datasetStore.images[id.value.label][dataPointIndex.value].bboxes[index].visibility = !datasetStore.images[id.value.label][dataPointIndex.value].bboxes[index].visibility
}

function updateBbox(index: number, prop: 'x' | 'y' | 'w' | 'h', value: number) {
	let { w, h, x, y, ...props } = datasetStore.images[id.value.label][dataPointIndex.value].bboxes[index]

	console.log("before", { w, h, x, y })
	w = prop === 'w' ? value / width.value : w
	h = prop === 'h' ? value / height.value : h
	x = prop === 'x' ? value / width.value + w / 2 : x
	y = prop === 'y' ? value / height.value + h / 2 : y
	console.log("after", { w, h, x, y })

	datasetStore.images[id.value.label][dataPointIndex.value].bboxes[index] = { w, h, x, y, ...props }
}
</script>

<template>
	<main class="relative grid grid-rows-[min-content_auto] grid-cols-[min-content_auto_min-content] h-screen">
		<!-- Toolbar -->
		<section
			class="row-start-1 col-start-1 col-span-3 flex justify-between items-center border-y border-light-400 h-12 bg-white">
			<div class="flex">
				<span v-for="{ name, icon } of tools" class="p-3 h-fit w-fit text-[24px] cursor-pointer hover:bg-light-400"
					:class="{ '!bg-primary-500 !text-white': name === activeTool }" @click="activeTool = name">
					<NuxtIcon :name="icon" filled />
				</span>
			</div>
			<div class="flex">
				<NuxtLink to="/annotated">
					<NuxtIcon name="cross" />
				</NuxtLink>
			</div>
			<div class="flex">
				<span class="p-3 h-fit w-fit text-sm" :class="{ 'bg-primary-500 text-white': false }" @click="false">
					{{ zoomLevel }}%
				</span>
			</div>
		</section>
		<!-- <main class="flex-1 relative flex bg-dark-400 border-2 border-primary-500"> -->
		<!-- Layers Panel -->
		<section class="row-start-2 col-start-1 py-4 text-sm bg-white">
			<template v-if="!!dataPoint">
				<div v-for="{ label, visibility }, index in dataPoint.bboxes"
					class="flex items-center gap-2 px-4 py-2 w-64 hover:outline outline-primary-400 "
					:class="{ 'bg-primary-500 text-white': activeLayer === index }" :tabindex="index" @click="activeLayer = index">
					<NuxtIcon name="crop" />
					<span>{{ label }} {{ index + 1 }}</span>
					<NuxtIcon :name="visibility ? 'eye' : 'cross'" class="ml-auto cursor-pointer" @click="toggleBbox(index)" />
				</div>
			</template>
		</section>
		<!-- Art Board -->
		<section class=" row-start-2 flex-1 relative justify-center items-center p-4 mr-1 overflow-hidden">
			<template v-if="!!dataPoint">
				<CardImage ref="cardImage" :url="dataPoint.url" :name="dataPoint.name" :bboxes="dataPoint.bboxes" :tabindex="1"
					class="mx-auto w-fit h-full" />
			</template>
		</section>
		<!-- Right Panel -->
		<section class="row-start-2 col-start-3 px-3 py-4 text-sm bg-white w-48">
			<div v-if="activeLayer !== null" class="grid grid-rows-2 grid-cols-2 gap-2 ">
				<div v-for="prop in (['x', 'y', 'w', 'h'] as const)"
					class="flex items-center gap-2 px-3 py-1 hover:outline hover:outline-light-400 focus-within:outline focus-within:!outline-primary-400 whitespace-nowrap">
					<label class="capitalize">{{ prop }}</label>
					<input type="number" :value="computedBboxes[activeLayer][prop]" class="outline-none"
						@input="(e) => updateBbox(activeLayer, prop, e.target?.value as number)" />
				</div>
			</div>
		</section>
		<!-- </main> -->
	</main>
</template>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

/* Firefox */
input[type=number] {
	-moz-appearance: textfield;
}
</style>