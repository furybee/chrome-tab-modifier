export const CM_RENAME_TAB_PROPERTIES = {
	id: 'rename-tab',
	title: 'Rename Tab',
};

export function createRenameTabContextMenu() {
	chrome.contextMenus.create({
		id: CM_RENAME_TAB_PROPERTIES.id,
		title: CM_RENAME_TAB_PROPERTIES.title,
		contexts: ['all'],
	});
}

export function handleRenameTabContextMenu(tab: chrome.tabs.Tab) {
	if (!tab?.id) return;

	return chrome.tabs.sendMessage(tab.id, { action: 'openPrompt' });
}
