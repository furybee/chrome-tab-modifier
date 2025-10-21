/**
 * Content Script - Tab Modifier
 *
 * This script runs in the context of web pages and applies tab modification rules.
 * It has been refactored following SOLID principles with service-based architecture.
 */

import { RegexService } from './content/RegexService';
import { TitleService } from './content/TitleService';
import { IconService } from './content/IconService';
import { StorageService } from './content/StorageService';
import { RuleApplicationService } from './content/RuleApplicationService';
import { SpotSearchUI } from './content/SpotSearchUI';

// ============================================================
// Service Initialization
// ============================================================

const regexService = new RegexService();
const titleService = new TitleService(regexService);
const iconService = new IconService();
const storageService = new StorageService(regexService);
const ruleApplicationService = new RuleApplicationService(titleService, iconService);

// Spot Search UI
console.log('[Tabee Content] 🔍 Initializing Spot Search UI...');
const spotSearchUI = new SpotSearchUI();
try {
	spotSearchUI.init();
	console.log('[Tabee Content] ✅ Spot Search UI initialized');
} catch (error) {
	console.error('[Tabee Content] ❌ Failed to initialize Spot Search UI:', error);
}

// ============================================================
// Initial Rule Application
// ============================================================

(async () => {
	try {
		const rule = await storageService.getRuleFromUrl(location.href);
		if (rule) {
			await ruleApplicationService.applyRule(rule);
		}
	} catch (error) {
		console.error('[Tabee Content] Error applying initial rule:', error);
	}
})();

// ============================================================
// Message Listeners
// ============================================================

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
		await ruleApplicationService.applyRule(request.rule, false);
	} else if (request.action === 'ungroupTab') {
		await chrome.tabs.ungroup(request.tabId);
	} else if (request.action === 'toggleSpotSearch') {
		console.log('[Tabee Content] 🔍 Toggling spot search UI...');
		// Toggle spot search UI
		spotSearchUI.toggle();
		console.log('[Tabee Content] ✅ Spot search toggled');
	} else if (request.action === 'spotSearchResults') {
		console.log('[Tabee Content] 🔍 Displaying search results:', request.tabs.length, 'tabs,', request.bookmarks.length, 'bookmarks');
		// Display search results
		spotSearchUI.displayResults(request.tabs, request.bookmarks);
	}
});
