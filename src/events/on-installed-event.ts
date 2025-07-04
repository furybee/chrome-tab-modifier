import { CM_MERGE_WINDOWS_PROPERTIES } from '../context-menus/merger.ts';
import { handleMergeNormalWindows } from '../handlers/merger.ts';

export function registerOnInstalledEvent() {
	chrome.commands.onCommand.addListener(async (command) => {
		if (command === CM_MERGE_WINDOWS_PROPERTIES.command) {
			await handleMergeNormalWindows();
		}
	});
}
