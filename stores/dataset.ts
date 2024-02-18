export interface BBox {
	label: string;
	x: number;
	y: number;
	w: number;
	h: number;
	visibility: boolean;
}

export interface Image {
	label: string,
	name: string;
	url: string;
	bboxes: BBox[];
}

export const useDataset = defineStore('dataset', () => {
	const images = reactive<{ [label: string]: Omit<Image, 'label'>[] }>({})
	const annotationsVisibility = ref({ label: false, bbox: false, mask: false })

	// FIXME: Functionality
	watch(annotationsVisibility, (value, oldValue) => {
		console.log("annotationsVisiblity changed");
		if (value.bbox !== oldValue.bbox) {
			console.log("bbox changed");

			for (let label in images) {
				for (let i in images) {
					for (let b in images)
						images[label][parseInt(i)].bboxes[parseInt(b)].visibility = value.bbox
				}
			}
		}
	})

	return { images, annotationsVisibility }
})