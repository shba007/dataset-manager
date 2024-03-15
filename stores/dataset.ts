export interface BBox {
	label: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	visibility: boolean;
}

export interface Image {
	label: string,
	name: string;
	url: string;
	bboxes: BBox[];
}

interface ImportBBox {
	label: string;
	x: number;
	y: number;
	w: number;
	h: number;
	visibility: boolean;
}

interface ImportImage extends Omit<Image, 'bboxes'> {
	bboxes: ImportBBox[]
}

function convertBbox(bbox: Omit<ImportBBox, 'visibility'>): Omit<BBox, 'visibility'> {
	const { x, y, w, h, label } = bbox
	return {
		x1: x - w / 2,
		y1: y - h / 2,
		x2: x + w / 2,
		y2: y + h / 2,
		label
	}
}

export const useDataset = defineStore('dataset', () => {
	const images = reactive<{ [label: string]: Omit<Image, 'label'>[] }>({})
	const annotationsVisibility = ref({ label: false, bbox: false, mask: false })

	// FIXME: Functionality
	/* 	watch(annotationsVisibility, (value, oldValue) => {
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
	 */
	function addImages(newImages: ImportImage[]) {
		for (let { label, name, url, bboxes } of newImages) {
			if (label in images)
				images[label].push({ name, url, bboxes: bboxes.map(({ visibility, ...props }) => ({ visibility: true, ...convertBbox(props) })) })
			else
				images[label] = [{ name, url, bboxes: bboxes.map((bbox) => ({ visibility: true, ...convertBbox(bbox) })) }]
		}
	}

	function updateBbox(label: string, imageIndex: number, bboxIndex: number, prop: 'x1' | 'y1' | 'x2' | 'y2' | 'x' | 'y' | 'w' | 'h',
		value: number, container: { width: number, height: number }) {
		let { x1, y1, x2, y2 } = images[label][imageIndex].bboxes[bboxIndex]

		switch (prop) {
			case 'x1':
				images[label][imageIndex].bboxes[bboxIndex].x1 = value / container.width
				break;
			case 'y1':
				images[label][imageIndex].bboxes[bboxIndex].y1 = value / container.height
				break;
			case 'x2':
				images[label][imageIndex].bboxes[bboxIndex].x2 = value / container.width
				break;
			case 'y2':
				images[label][imageIndex].bboxes[bboxIndex].y2 = value / container.height
				break;
			case 'x':
				images[label][imageIndex].bboxes[bboxIndex].x1 = value / container.width
				images[label][imageIndex].bboxes[bboxIndex].x2 = value / container.width + (x2 - x1)
				break;
			case 'y':
				images[label][imageIndex].bboxes[bboxIndex].y1 = value / container.height
				images[label][imageIndex].bboxes[bboxIndex].y2 = value / container.height + (y2 - y1)
				break;
			case 'w':
				images[label][imageIndex].bboxes[bboxIndex].x2 = x1 + value / container.width
				break;
			case 'h':
				images[label][imageIndex].bboxes[bboxIndex].y2 = y1 + value / container.height
				break;
		}

		// console.log({ ...images[label][imageIndex].bboxes[bboxIndex] })
	}

	return {
		images, annotationsVisibility,
		addImages, updateBbox,
	}
})