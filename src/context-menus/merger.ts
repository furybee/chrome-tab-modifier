export const CM_MERGE_WINDOWS_PROPERTIES = {
	id: 'merge-windows',
	title: 'Merge Windows',
	command: 'merge-windows',
};

export function createMergeWindowsContextMenu() {
	chrome.contextMenus.create({
		id: CM_MERGE_WINDOWS_PROPERTIES.id,
		title: CM_MERGE_WINDOWS_PROPERTIES.title,
		contexts: ['all'],
	});
}
