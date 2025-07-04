export async function handleSetPinned(tab: chrome.tabs.Tab, properties: any) {
	if (!tab.id) return;

	await chrome.tabs.update(tab.id, properties);
}
