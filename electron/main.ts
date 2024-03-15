import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.ROOT = path.join(__dirname, '..')
process.env.DIST = path.join(process.env.ROOT, 'dist-electron')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
	? path.join(process.env.ROOT, 'public')
	: path.join(process.env.ROOT, '.output/public')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let window: BrowserWindow;

function readDir(directoryPath: string) {
	function readDirRecursive(currentDir: string) {
		const entries = fs.readdirSync(currentDir, { withFileTypes: true });
		let files: string[] = [];

		entries.forEach((entry) => {
			const fullPath = path.join(currentDir, entry.name);

			if (entry.isDirectory())
				files = files.concat(readDirRecursive(fullPath));
			else
				files.push(fullPath);

		});

		return files;
	}

	return readDirRecursive(directoryPath);
}

function ipcConnect() {
	ipcMain.handle('versions', () => {
		return {
			name: app.getName(),
			version: app.getVersion(),
			node: process.versions.chrome,
			chrome: process.versions.chrome,
			electron: process.versions.electron,
		};
	});

	ipcMain.on('open-image', (event, arg) => {
		const imagesDir = dialog.showOpenDialogSync(window, {
			properties: ["openDirectory"],
		})

		if (!imagesDir)
			return []

		const images = readDir(path.join(imagesDir[0], "/images"))

		return event.returnValue = images.map((imagePath) => {
			const imagePathParts = imagePath.split(path.sep)
			const annotationPath = imagePath.replace('images', 'annotations').replace('.jpg', '.txt')
			const annotations = [];

			try {
				const data = fs.readFileSync(annotationPath, 'utf8');
				const lines = data.split('\n');
				lines.pop()

				annotations.push(...lines.map(line => {
					const [label, x, y, w, h] = line.trim().split(' ').map(Number);
					return { label, x, y, w, h, visibility: false };
				}))
			} catch (error) {
				console.error('Error reading the file:', error);
			}

			return {
				label: imagePathParts[imagePathParts.length - 2],
				name: path.basename(imagePath, path.extname(imagePath)),
				url: imagePath,
				bboxes: annotations
			}
		})
	})
}

function bootstrap() {
	window = new BrowserWindow({
		width: 1280, height: 720,
		frame: true,
		center: true,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(process.env.DIST ?? '', 'preload.js'),
			nodeIntegrationInWorker: true,
			contextIsolation: false,
			nodeIntegration: true,
			webSecurity: false,
		},
	})

	if (process.env.VITE_DEV_SERVER_URL) {
		window.loadURL(process.env.VITE_DEV_SERVER_URL)
		window.webContents.openDevTools()
	} else {
		window.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'))
	}

	ipcConnect()
}

app.whenReady().then(bootstrap)