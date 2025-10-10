function _getStorageAsync() {
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

async function _getRuleFromUrl(url) {
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
				try {
					const regex = createSafeRegex(urlFragment);
					return regex.test(url);
				} catch (e) {
					console.error('Error processing regex pattern for URL matching:', e);
					return false;
				}
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

const STORAGE_KEY = 'tab_modifier';

export function updateTitle(title, tag, value) {
	return value ? title.replace(tag, decodeURI(value)) : title;
}

function isRegexSafe(pattern) {
	// Basic validation to prevent ReDoS attacks
	if (typeof pattern !== 'string' || pattern.length > 200) {
		return false;
	}

	// Check for potentially dangerous patterns that can cause ReDoS
	const dangerousPatterns = [
		/\(\?\=.*\)\+/, // Positive lookahead with quantifiers
		/\(\?\!.*\)\+/, // Negative lookahead with quantifiers
		/\(.+\)\+\$/, // Catastrophic backtracking patterns
		/\(.+\)\*\+/, // Conflicting quantifiers
		/\(\.\*\)\{2,\}/, // Multiple .* in groups
		/\(\.\+\)\{2,\}/, // Multiple .+ in groups
	];

	return !dangerousPatterns.some(dangerous => dangerous.test(pattern));
}

function createSafeRegex(pattern, flags = 'g') {
	if (!isRegexSafe(pattern)) {
		throw new Error('Potentially unsafe regex pattern detected');
	}

	try {
		return new RegExp(pattern, flags);
	} catch (e) {
		throw new Error(`Invalid regex pattern: ${e.message}`);
	}
}

export function getTextBySelector(selector) {
	let el = null;

	if (selector.includes('*')) {
		const parts = selector.split(' ');

		const toSafe = (s) =>
			typeof CSS !== 'undefined' && CSS.escape
				? CSS.escape(s)
				: s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/]/g, '\\]');

		const modifiedParts = parts.map((part) => {
			if (!part.includes('*')) return part;
			if (part.startsWith('.')) {
				const raw = part.replace(/\./g, '').replace(/\*/g, '');
				return `[class*="${toSafe(raw)}"]`;
			}
			const rawAttr = part.replace(/\*/g, '');
			return `[${toSafe(rawAttr)}]`;
		});

		const modifiedSelector = modifiedParts.join(' ');
		const elements = document.querySelectorAll(modifiedSelector);

		if (elements.length > 0) {
			el = elements[0];
		}
	} else {
		el = document.querySelector(selector);
	}

	let value = '';

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

			if (selector === 'title') {
				text = currentTitle;
			} else {
				text = getTextBySelector(selector);
			}

			title = updateTitle(title, match, text);
		});
	}

	if (rule.tab.title_matcher) {
		try {
			const regex = createSafeRegex(rule.tab.title_matcher, 'g');
			let matches;
			let i = 0;
			let iterationCount = 0;
			const maxIterations = 100; // Prevent infinite loops

			while ((matches = regex.exec(currentTitle)) !== null && iterationCount < maxIterations) {
				for (let j = 0; j < matches.length; j++) {
					title = updateTitle(title, '@' + i, matches[j]);
					i++;
				}
				iterationCount++;
			}
		} catch (e) {
			console.error('Error processing title_matcher regex:', e);
		}
	}

	if (rule.tab.url_matcher) {
		try {
			const regex = createSafeRegex(rule.tab.url_matcher, 'g');
			let matches;
			let i = 0;
			let iterationCount = 0;
			const maxIterations = 100; // Prevent infinite loops

			while ((matches = regex.exec(currentUrl)) !== null && iterationCount < maxIterations) {
				for (let j = 0; j < matches.length; j++) {
					title = updateTitle(title, '$' + i, matches[j]);
					i++;
				}
				iterationCount++;
			}
		} catch (e) {
			console.error('Error processing url_matcher regex:', e);
		}
	}

	return title;
}

export function processIcon(newIcon) {
	const icons = document.querySelectorAll('head link[rel*="icon"]');

	icons.forEach((icon) => {
		// ⚠️ icon.remove() causes issues with some websites
		// https://github.com/furybee/chrome-tab-modifier/issues/354
		// icon.remove();
		// Instead, we'll just change the rel attribute
		icon.setAttribute('rel', 'old-icon');
	});

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

export async function applyRule(ruleParam, updateTitle) {
	const rule = ruleParam !== undefined ? ruleParam : await _getRuleFromUrl(location.href);
	updateTitle = updateTitle ?? true;

	if (!rule) {
		return;
	}

	if (rule.is_enabled === undefined) {
		rule.is_enabled = true;
	}

	if (rule.is_enabled === false) {
		return;
	}

	if (rule.tab.title && updateTitle) {
		let originalTitleElement = document.querySelector('meta[name="original-tab-modifier-title"]');

		if (!originalTitleElement) {
			originalTitleElement = document.createElement('meta');
			originalTitleElement.name = 'original-tab-modifier-title';
			originalTitleElement.content = document.title;
			document.head.appendChild(originalTitleElement);
		}

		let originalTitle = originalTitleElement.getAttribute('content');
		document.title = processTitle(location.href, originalTitle, rule);

		const targetNode = document.documentElement;
		const config = { childList: true, subtree: true };
		let lastTitle = document.title;

		const callback = function () {
			if (document.title !== lastTitle) {
				originalTitleElement.setAttribute('content', document.title);

				originalTitle = originalTitleElement.getAttribute('content');
				document.title = processTitle(location.href, originalTitle, rule);

				lastTitle = document.title;
			}
		};

		const observer = new MutationObserver(callback);
		observer.observe(targetNode, config);
	}

	// Pinning, muting handled through Chrome Runtime messages
	if (rule.tab.pinned) {
		await chrome.runtime.sendMessage({ action: 'setPinned' });
	}

	if (rule.tab.muted) {
		await chrome.runtime.sendMessage({ action: 'setMuted' });
	}

	let iconChangedByMe = false;

	// Favicon handling
	if (rule.tab.icon && updateTitle) {
		processIcon(rule.tab.icon);

		const iconObserver = new MutationObserver((mutations) => {
			if (!iconChangedByMe) {
				mutations.forEach((mutation) => {
					if (mutation.target.type === 'image/x-icon') {
						processIcon(rule.tab.icon);
						iconChangedByMe = true;
					} else if (mutation.addedNodes.length) {
						mutation.addedNodes.forEach((node) => {
							if (node.type === 'image/x-icon') {
								processIcon(rule.tab.icon);
								iconChangedByMe = true;
							}
						});
					} else if (mutation.removedNodes.length) {
						mutation.removedNodes.forEach((node) => {
							if (node.type === 'image/x-icon') {
								processIcon(rule.tab.icon);
								iconChangedByMe = true;
							}
						});
					}
				});
			} else {
				iconChangedByMe = false;
			}
		});

		iconObserver.observe(document.head, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true,
			attributeOldValue: true,
			characterDataOldValue: true,
		});
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

		if (title) {
			await chrome.runtime.sendMessage({
				action: 'renameTab',
				title: title,
			});
		}
	} else if (request.action === 'applyRule') {
		// Don't update title because it will be updated by the MutationObserver
		await applyRule(request.rule, false);
	} else if (request.action === 'ungroupTab') {
		await chrome.tabs.ungroup(request.tabId);
	}
});
