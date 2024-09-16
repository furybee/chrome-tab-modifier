import fs from 'fs';
import path from 'path';

function updateManifest(distFolder) {
	// Define the path to the manifest.json file
	const manifestPath = path.join(distFolder, 'manifest.json');

	// Find the content.js-YYY file in the dist/assets directory
	const assetsFolder = path.join(distFolder, 'assets');
	let contentJsFile = null;

	// Check if the manifest.json file exists
	if (!fs.existsSync(manifestPath)) {
		console.log(`Error: manifest.json not found in ${distFolder}.`);
		return;
	}

	// Check if the assets folder exists
	if (!fs.existsSync(assetsFolder)) {
		console.log(`Error: assets folder not found in ${distFolder}.`);
		return;
	}

	// Iterate over files in the assets folder to find the content.js file
	const files = fs.readdirSync(assetsFolder);
	for (const filename of files) {
		if (
			!filename.startsWith('content.js-loader') &&
			filename.startsWith('content.js-') &&
			filename.endsWith('.js')
		) {
			contentJsFile = filename;
			break;
		}
	}

	// If the content.js file was not found, return with an error message
	if (contentJsFile === null) {
		console.log('Error: content.js-YYY file not found in the assets folder.');
		return;
	}

	// Read the manifest.json file
	let manifestData;
	try {
		const data = fs.readFileSync(manifestPath, 'utf-8');
		manifestData = JSON.parse(data);
	} catch (e) {
		console.log(`Error reading manifest.json: ${e.message}`);
		return;
	}

	// Update the content_scripts entry in the manifest
	let updated = false;
	if (manifestData.content_scripts) {
		for (const script of manifestData.content_scripts) {
			if (script.js) {
				// Find any entry matching the pattern content.js-loader-*.js
				for (let i = 0; i < script.js.length; i++) {
					if (/assets\/content\.js-loader-.*\.js/.test(script.js[i])) {
						script.js[i] = `assets/${contentJsFile}`;
						updated = true;
						break;
					}
				}
			}
		}
	}

	if (!updated) {
		console.log('No matching content.js-loader-XXX.js entry found in manifest.json.');
		return;
	}

	// Write the updated manifest.json file back to the file system
	try {
		fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
	} catch (e) {
		console.log(`Error writing to manifest.json: ${e.message}`);
		return;
	}

	console.log(`Updated manifest.json to use ${contentJsFile} in content_scripts.`);
}

// Run the script
const distFolder = './dist'; // Replace this path with the path to your 'dist' folder
updateManifest(distFolder);
