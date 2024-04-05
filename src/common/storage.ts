import { Rule, TabModifierSettings } from './types.ts';
import { _clone } from './helpers.ts';

export const STORAGE_KEY = 'tab_modifier';

export function _getDefaultTabModifierSettings(): TabModifierSettings {
	return {
		rules: [],
		groups: [],
		settings: {
			enable_new_version_notification: false,
			theme: 'dim',
		},
	};
}

export function _getDefaultRule(name: string, title: string, urlFragment: string): Rule {
	return {
		name: name,
		detection: 'CONTAINS',
		url_fragment: urlFragment,
		tab: {
			title: title,
			icon: null,
			pinned: false,
			protected: false,
			unique: false,
			muted: false,
			title_matcher: null,
			url_matcher: null,
			group_id: null,
		},
	};
}

export function _getStorageAsync(): Promise<TabModifierSettings | undefined> {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(STORAGE_KEY, (items) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(items[STORAGE_KEY]);
			}
		});
	});
}

export async function _clearStorage(): Promise<void> {
	await chrome.storage.local.remove(STORAGE_KEY);
}

export async function _setStorage(tabModifier: TabModifierSettings): Promise<void> {
	await chrome.storage.local.set({
		tab_modifier: _clone({
			rules: tabModifier.rules,
			groups: tabModifier.groups,
			settings: tabModifier.settings,
		}),
	});
}
