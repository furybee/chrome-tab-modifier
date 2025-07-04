import { CM_MERGE_WINDOWS_PROPERTIES } from '../context-menus/merger.ts';
import { handleMergeNormalWindows } from '../handlers/merger.ts';
import { CM_RENAME_TAB_PROPERTIES, handleRenameTabContextMenu } from '../context-menus/rename.ts';

export function registerContextMenuOnClickedEvent() {
	chrome.contextMenus.onClicked.addListener(async function (info, tab) {
		if (!tab?.id) return;

		const handlers: Record<string, () => void> = {
			[CM_MERGE_WINDOWS_PROPERTIES.id]: handleMergeNormalWindows,
			[CM_RENAME_TAB_PROPERTIES.id]: () => handleRenameTabContextMenu(tab),
		};

		const handler = handlers[info.menuItemId.toString()];
		if (handler) handler();
	});
}
