import { _getRuleFromUrl } from './common/storage.ts';

const STORAGE_KEY = 'tab_modifier';

export function updateTitle(title, tag, value) {
	return value ? title.replace(tag, decodeURI(value)) : title;
}

export function getTextBySelector(selector) {
	let el = document.querySelector(selector),
		value = '';

	if (el) {
		if (el.childNodes.length > 0) {
			el = el.childNodes[0];
		}

		if (el.tagName?.toLowerCase() === 'input') {
			value = el.value;
		} else if (el.tagName?.toLowerCase() === 'select') {
			value = el.options[el.selectedIndex].text;
		} else {
			value = el.innerText || el.textContent;
		}
	}

	return value.trim();
}

export function processTitle(currentUrl, currentTitle, rule) {
	let title = rule.tab.title;
	const matches = title.match(/\{([^}]+)}/g);

	if (matches) {
		let selector, text;

		matches.forEach((match) => {
			selector = match.substring(1, match.length - 1);
			text = getTextBySelector(selector);

			title = updateTitle(title, match, text);
		});
	}

	if (rule.tab.title_matcher) {
		try {
			const regex = new RegExp(rule.tab.title_matcher, 'g');
			let matches;
			let i = 0;

			while ((matches = regex.exec(currentTitle)) !== null) {
				for (let j = 0; j < matches.length; j++) {
					title = updateTitle(title, '@' + i, matches[j]);
					i++;
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	if (rule.tab.url_matcher) {
		try {
			const regex = new RegExp(rule.tab.url_matcher, 'g');
			let matches;
			let i = 0;

			while ((matches = regex.exec(currentUrl)) !== null) {
				for (let j = 0; j < matches.length; j++) {
					title = updateTitle(title, '$' + i, matches[j]);
					i++;
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	return title;
}

export function processIcon(newIcon) {
	const icons = document.querySelectorAll('head link[rel*="icon"]');
	icons.forEach((icon) => icon.parentNode.removeChild(icon));

	const iconUrl = /^(https?|data):/.test(newIcon)
		? newIcon
		: chrome.runtime.getURL(`/assets/${newIcon}`);

	const newIconLink = document.createElement('link');
	newIconLink.type = 'image/x-icon';
	newIconLink.rel = 'icon';
	newIconLink.href = iconUrl;
	document.head.appendChild(newIconLink);

	return true;
}

export async function applyRule(ruleParam) {
	const rule = ruleParam ?? (await _getRuleFromUrl(location.href));

	if (!rule) {
		return;
	}

	if (rule.tab.title) {
		// check if element with id original-title exists
		let originalTitleElement = document.querySelector('meta[name="original-tab-modifier-title"]');

		if (!originalTitleElement) {
			originalTitleElement = document.createElement('meta');
			originalTitleElement.name = 'original-tab-modifier-title';
			originalTitleElement.content = document.title;
			document.head.appendChild(originalTitleElement);
		}

		const originalTitle = originalTitleElement.getAttribute('content');
		document.title = processTitle(location.href, originalTitle, rule);
	}

	// Pinning, muting handled through Chrome Runtime messages
	if (rule.tab.pinned) {
		await chrome.runtime.sendMessage({ action: 'setPinned' });
	}

	if (rule.tab.muted) {
		await chrome.runtime.sendMessage({ action: 'setMuted' });
	}

	// Favicon handling
	if (rule.tab.icon) {
		processIcon(rule.tab.icon);
	}

	if (rule.tab.protected) {
		await chrome.runtime.sendMessage({
			action: 'setProtected',
		});
	}

	if (rule.tab.unique) {
		await chrome.runtime.sendMessage({
			action: 'setUnique',
			url_fragment: rule.url_fragment,
		});
	}

	await chrome.runtime.sendMessage({
		action: 'setGroup',
		rule: rule,
	});
}

chrome.storage.local.get(STORAGE_KEY, async (items) => {
	const tabModifier = items?.[STORAGE_KEY];

	if (!tabModifier) {
		return;
	}

	await applyRule();
});

chrome.runtime.onMessage.addListener(async function (request) {
	if (request.action === 'openPrompt') {
		const title = prompt(
			'Enter the new title, a Tab rule will be automatically created for you based on current URL'
		);

		await chrome.runtime.sendMessage({
			action: 'renameTab',
			title: title,
		});
	} else if (request.action === 'applyRule') {
		setTimeout(async () => {
			await applyRule(request.rule);
		}, 200);
	} else if (request.action === 'ungroupTab') {
		await chrome.tabs.ungroup(request.tabId);
	}
});
