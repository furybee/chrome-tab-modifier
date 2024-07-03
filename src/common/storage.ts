import { Group, Rule, TabModifierSettings } from './types.ts';
import { _clone, _generateRandomId } from './helpers.ts';
import { loadedLocales } from '../i18n-loader.ts';

export const STORAGE_KEY = 'tab_modifier';
export const LOCALE_STORAGE_KEY = 'tab_modifier_locale';

export let globalLocale: string | undefined = undefined;

export async function _getLocale(): Promise<string> {
	if (globalLocale) {
		await _setLocalStorage(globalLocale);

		return globalLocale;
	}

	if (!chrome.storage.local) {
		console.error('localStorage is not available');

		globalLocale = 'en';

		return globalLocale;
	}

	const storageLanguage = await _getLocalStorageAsync();
	console.log('storageLanguage', storageLanguage);
	if (storageLanguage) {
		globalLocale = storageLanguage;

		await _setLocalStorage(globalLocale);

		return globalLocale;
	}

	const chromeUILanguage = chrome.i18n.getUILanguage();
	if (loadedLocales.has(chromeUILanguage)) {
		globalLocale = chromeUILanguage;

		await _setLocalStorage(globalLocale);

		return globalLocale;
	}

	await _setLocale('en');

	return 'en';
}

export async function _setLocale(value: string): Promise<void> {
	console.log('setLocale', value);

	if (globalLocale === value) {
		return;
	}

	if (!loadedLocales.has(value)) {
		value = 'en';
	}

	await _setLocalStorage(value);

	// reload the page to apply the new locale
	location.reload();
}

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
		id: _generateRandomId(),
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

export function _getDefaultGroup(title?: string): Group {
	return {
		title: title ?? '',
		color: 'grey',
		collapsed: false,
		id: _generateRandomId(),
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

export function _getLocalStorageAsync(): Promise<string | undefined> {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(LOCALE_STORAGE_KEY, (items) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(items[LOCALE_STORAGE_KEY]);
			}
		});
	});
}

export async function _clearStorage(): Promise<void> {
	await chrome.storage.local.remove(STORAGE_KEY);
	await chrome.storage.local.remove(LOCALE_STORAGE_KEY);
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

export async function _setLocalStorage(locale: string): Promise<void> {
	console.log('setLocalStorage', locale);

	await chrome.storage.local.set({
		tab_modifier_locale: locale,
	});
}

export async function _getRuleFromUrl(url: string): Promise<Rule | undefined> {
	const tabModifier = await _getStorageAsync();
	if (!tabModifier) {
		return;
	}

	const foundRule = tabModifier.rules.find((r) => {
		const detectionType = r.detection ?? 'CONTAINS';
		const urlFragment = r.url_fragment;

		switch (detectionType) {
			case 'CONTAINS':
				return url.includes(urlFragment);
			case 'STARTS':
			case 'STARTS_WITH':
				return url.startsWith(urlFragment);
			case 'ENDS':
			case 'ENDS_WITH':
				return url.endsWith(urlFragment);
			case 'REGEX':
			case 'REGEXP':
				return new RegExp(urlFragment).test(url);
			case 'EXACT':
				return url === urlFragment;
			default:
				return false;
		}
	});

	if (!foundRule) {
		return;
	}

	return foundRule;
}
