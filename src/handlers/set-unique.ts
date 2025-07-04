function queryTabs(queryInfo = {}): Promise<chrome.tabs.Tab[]> {
	return new Promise((resolve, reject) => {
		chrome.tabs.query(queryInfo, (result) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(result);
			}
		});
	});
}

export async function handleSetUnique(message: any, currentTab: chrome.tabs.Tab) {
	if (!currentTab.id) return;

	const tabs = await queryTabs({});

	for (const tab of tabs) {
		if (!tab.url) continue;
		if (!tab.id) continue;

		if (tab.url.includes(message.url_fragment) && tab.id !== currentTab.id) {
			await chrome.scripting.executeScript({
				target: { tabId: currentTab.id },
				func: () => {
					window.onbeforeunload = null;
				},
			});

			await chrome.tabs.remove(currentTab.id);
			await chrome.tabs.update(tab.id, { url: currentTab.url, highlighted: true });
		}
	}
}
