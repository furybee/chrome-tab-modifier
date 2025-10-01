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

const STORAGE_KEY = 'tab_modifier';

export function updateTitle(title, tag, value) {
	if (!value) return title;

	// Decode URI if the value looks like it's URI-encoded
	try {
		const decoded = decodeURI(value);
		return title.replace(tag, decoded);
	} catch (e) {
		return title.replace(tag, value);
	}
}

export function getTextBySelector(selector) {
	let el = null;

	if (selector.includes('*')) {
		const parts = selector.split(' ');

		const modifiedParts = parts.map((part) => {
			if (part.includes('*')) {
				if (part.startsWith('.')) {
					return `[class*="${part.replace('.', '').replace('*', '')}"]`;
				} else {
					return `[${part.replace('*', '')}]`;
				}
			}
			return part;
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

/**
 * Process conditional replacements in title
 * Supports syntax like:
 * - ${1:option1|option2|option3} - Extracts and displays which option from the list matches $1
 * - ${1|default} - Use $1 if not empty, otherwise use default value
 * - ${1^} - Capitalize first letter of $1
 * - ${1^|default} - Capitalize $1 or use default
 */
export function processConditionalReplacements(title, captureValues) {
	// Match patterns like ${1:option1|option2}, ${1|default}, or ${1^}
	const conditionalPattern = /\$\{(\d+)(\^)?(?::([^}|]+(?:\|[^}|]+)*)|(\|[^}]+))?\}/g;

	return title.replace(conditionalPattern, (match, captureNum, capitalize, options, defaultPart) => {
		const captureIndex = parseInt(captureNum);
		let captureValue = captureValues[captureIndex];

		// Handle ${1:option1|option2} - match which option the capture contains
		if (options) {
			const optionList = options.split('|').map(o => o.trim());

			if (captureValue) {
				// Find which option matches the capture value
				for (const option of optionList) {
					if (captureValue.toLowerCase().includes(option.toLowerCase()) ||
					    option.toLowerCase().includes(captureValue.toLowerCase())) {
						return capitalize ? capitalizeFirst(option) : option;
					}
				}
			}

			// No match found or empty capture - try first option as default, or empty
			const result = optionList[0] || '';
			return capitalize ? capitalizeFirst(result) : result;
		}

		// Handle ${1|default} or ${1^|default} - use default if capture is empty
		if (defaultPart) {
			const defaultValue = defaultPart.substring(1).trim(); // Remove leading |
			captureValue = captureValue || defaultValue;
		}

		// Apply capitalization if requested
		if (capitalize && captureValue) {
			return capitalizeFirst(captureValue);
		}

		// Simple ${1} - return the capture value or empty
		return captureValue || '';
	});
}

function capitalizeFirst(str) {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

	// Collect all URL matcher captures first
	const urlCaptureValues = {};
	if (rule.tab.url_matcher) {
		try {
			const regex = new RegExp(rule.tab.url_matcher, 'g');
			let matches;

			while ((matches = regex.exec(currentUrl)) !== null) {
				// Store captures: matches[0] is full match, matches[1] is first group, etc.
				for (let j = 0; j < matches.length; j++) {
					urlCaptureValues[j] = matches[j] || '';
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	// Process conditional syntax like ${1:option1|option2} or ${1|default}
	title = processConditionalReplacements(title, urlCaptureValues);

	// Replace remaining simple placeholders ($0, $1, $2, etc.)
	for (const [index, value] of Object.entries(urlCaptureValues)) {
		title = updateTitle(title, '$' + index, value);
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
