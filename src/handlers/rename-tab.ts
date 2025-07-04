import {
	_getDefaultRule,
	_getDefaultTabModifierSettings,
	_getStorageAsync,
	_setStorage,
} from '../common/storage.ts';

export async function handleRenameTab(tab: chrome.tabs.Tab, title: string) {
	if (!tab?.id) return;
	if (!tab?.url) return;
	if (!URL.canParse(tab.url)) return;

	let tabModifier = await _getStorageAsync();

	if (!tabModifier) {
		tabModifier = _getDefaultTabModifierSettings();
	}

	const urlParams = new URL(tab.url);
	const ruleName = title + ' (' + urlParams.host.substring(0, 15) + ')';
	const rule = _getDefaultRule(ruleName, title ?? '', urlParams.href);

	tabModifier.rules.unshift(rule);

	await _setStorage(tabModifier);

	await chrome.tabs.reload(tab.id);
}
