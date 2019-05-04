var w = window, rule = null, processPage, tryCount, retryTimer;
		
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request === "isContentScriptInjected") {
				sendResponse({contentScriptInjected: 'true'});
		} else if (request.runRule) {
				sendResponse({runRule: 'true'});
				rule = request.runRule;
				// reset tryCount since it's the first try, and clear any previous retryTimer that's already waiting
				clearTimeout(retryTimer);
				tryCount = 0; 
				// Even on first try use timer to delay function call of processPage, so that rare but possible fast onUpdate events won't rapidly call it again
				retryTimer = setTimeout(processPage, 1000);
		}
});		
    
processPage = function () {
		console.log("run processPage()");
		
		var getTextBySelector, updateTitle, processTitle, processIcon;
		
		/**
		 * Returns the text related to the given CSS selector
		 * @param selector
		 * @returns {string}
		 */
		getTextBySelector = function (selector) {
				var el = document.querySelector(selector), value = '';
				
				if (el !== null) {
						el = el.childNodes[0];
						
						if (el.tagName === 'input') {
								value = el.value;
						} else if (el.tagName === 'select') {
								value = el.options[el.selectedIndex].text;
						} else {
								value = el.innerText || el.textContent;
						}
				}
				
				return value.trim();
		};
		
		/**
		 * Update title string by replacing given tag by value
		 * @param title
		 * @param tag
		 * @param value
		 * @returns {*}
		 */
		updateTitle = function (title, tag, value) {
				if (value === '') {
						return title;
				}
				
				return title.replace(tag, value);
		};
		
		/**
		 * Process new title depending on current URL & current title
		 * @param current_url
		 * @param current_title
		 * @returns {*}
		 */
		processTitle = function (current_url, current_title) {
				var title = rule.tab.title, matches = title.match(/\{([^}]+)}/g), i;
				var defaultTitle = title;
				
				// Handle curly braces tags inside title
				if (matches !== null) {
						var selector, text;
						
						for (i = 0; i < matches.length; i++) {
								selector = matches[i].substring(1, matches[i].length - 1);
								text     = getTextBySelector(selector);
								title    = updateTitle(title, matches[i], text);
						}
						
						if (selector && !text) { // selector is defined, but nothing was found, so it failed
								console.log("FAILED to extract text from selector");									
								return null;
						}
				}
				
				// Handle title_matcher
				if (rule.tab.title_matcher !== null) {
						try {
								matches = current_title.match(new RegExp(rule.tab.title_matcher), 'g');
								
								if (matches !== null) {
										for (i = 0; i < matches.length; i++) {
												title = updateTitle(title, '@' + i, matches[i]);
										}
								}
						} catch (e) {
								console.log(e);
						}
				}
				
				// Handle url_matcher
				if (rule.tab.url_matcher !== null) {
						try {
								matches = current_url.match(new RegExp(rule.tab.url_matcher), 'g');
								
								if (matches !== null) {
										for (i = 0; i < matches.length; i++) {
												title = updateTitle(title, '$' + i, matches[i]);
										}
								}
						} catch (e) {
								console.log(e);
						}
				}
				
				return title;
		};
		
		/**
		 * Remove existing favicon(s) and create a new one
		 * @param new_icon
		 * @returns {boolean}
		 */
		processIcon = function (new_icon) {
				var el, icon, link;
				
				el = document.querySelectorAll('head link[rel*="icon"]');
				
				// Remove existing favicons
				Array.prototype.forEach.call(el, function (node) {
						node.parentNode.removeChild(node);
				});
				
				// Set preconfigured or custom (http|https|data) icon
				icon = (/^(https?|data):/.test(new_icon) === true) ? new_icon : chrome.extension.getURL('/img/' + new_icon);
				
				// Create new favicon
				link      = document.createElement('link');
				link.type = 'image/x-icon';
				link.rel  = 'icon';
				link.href = icon;
				
				document.getElementsByTagName('head')[0].appendChild(link);
				
				return true;
		};
		
		// Set title
		if (rule.tab.title !== null) {
				if (document.title !== null) {
						console.log("OLD title: "+document.title);
						var newTitle = processTitle(location.href, document.title);
						if (newTitle == null) { // means, it couldn't extract text from DOM selector
								retry();
								return; // stop processPage() for now at this point
						} else {
								console.log("NEW Title: "+newTitle);
						}
						document.title = newTitle;
				}
		}
		
		// Pin the tab
		if (rule.tab.pinned === true) {
				chrome.runtime.sendMessage({ action: 'setPinned' });
		}
		
		// Set new icon
		if (rule.tab.icon !== null) {
				processIcon(rule.tab.icon);
		}
		
		// Protect the tab
		if (rule.tab.protected === true) {
				w.onbeforeunload = function () {
						return '';
				};
		}
		
		// Keep this tab unique
		if (rule.tab.unique === true) {
				chrome.runtime.sendMessage({
						action: 'setUnique',
						url_fragment: rule.url_fragment
				});
		}
		
		// Mute the tab
		if (rule.tab.muted === true) {
				chrome.runtime.sendMessage({ action: 'setMuted' });
		}
		console.log("finished processPage()");
};   

function retry() {
		tryCount = tryCount+1;
		console.log("RETRY in "+tryCount+" seconds");
		if (tryCount <= 50) { // just so it doesn't try forever. Could be made configurable.
			retryTimer = setTimeout(processPage, tryCount*1000);
		}
} 