<script setup lang="ts">
const routes = [
	{ link: "/", title: "new", icon: "plus" },
	{ link: "/draft", title: "draft", icon: "cube-transparent" },
	{ link: "/annotated", title: "annotated", icon: "cube-solid" },
	// { link: "/", title: "segmented", icon: "chevron-bold" },
	// { link: "/", title: "detected", icon: "chevron-bold" },
	// { link: "/", title: "classified", icon: "chevron-bold" },
]
</script>

<template>
	<nav class="flex flex-col gap-2 text-lg h-full py-4 bg-white">
		<NuxtLink v-for="{ link, title, icon } in routes" :to="link" class="flex items-center gap-4 pl-6 pr-36 py-2"
			active-class="bg-primary-400 text-white">
			<NuxtIcon :name="icon" class="text-[20px]" />
			<span class="text-sm capitalize">{{ title }}</span>
		</NuxtLink>
	</nav>
</template>