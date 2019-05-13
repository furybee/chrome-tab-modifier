/*jshint esversion: 6, loopfunc: true */

let options_url = chrome.extension.getURL('html/options.html'), openOptionsPage, getStorage;

// --------------------------------------------------------------------------------------------------------
// Functions

openOptionsPage = function (hash) {
    chrome.tabs.query({ url: options_url }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { active: true, highlighted: true }, function (current_tab) {
                chrome.windows.update(current_tab.windowId, { focused: true });
            });
        } else {
            chrome.tabs.create({ url: (hash !== undefined) ? options_url + '#' + hash : options_url });
        }
    });
};

getStorage = function (callback) {
    chrome.storage.local.get('tab_modifier', function (items) {
        callback(items.tab_modifier);
    });
};

function triggerContentScript(tabId, rule) {
		chrome.tabs.sendMessage(tabId, 'isContentScriptInjected', function (response) {
				if (chrome.runtime.lastError || !response) {
						// console.log("Content.js NOT injected yet in tabId "+tabId+". So inject now!");
						chrome.tabs.executeScript(tabId, {file: 'js/content.js'}, function(results) {
								chrome.tabs.sendMessage(tabId, {runRule: rule}); // wait until the script is injected and just then send run message
						});
				} else {
						console.log("Content.js is already injected, so run with pages rule now.");
						chrome.tabs.sendMessage(tabId, {runRule: rule});
				}
		});
};

function getRule(url, callback) {
		var thisRule = null;
		
		getStorage(function (tab_modifier) {
				if (tab_modifier === undefined) {
						return callback(thisRule);
				}				
				for (var i = 0; i < tab_modifier.rules.length; i++) {
						var listedRule = tab_modifier.rules[i];
						if (listedRule.detection === undefined || listedRule.detection === 'CONTAINS') {
								if (url.indexOf(listedRule.url_fragment) !== -1) {
										thisRule = listedRule;
										break;
								}
						} else {
								switch (listedRule.detection) {
										case 'STARTS':
												if (url.startsWith(listedRule.url_fragment) === true) {
														thisRule = listedRule;
														break;
												}
												break;
										case 'ENDS':
												if (url.endsWith(listedRule.url_fragment) === true) {
														thisRule = listedRule;
														break;
												}
												break;
										case 'REGEXP':
												var regexp = new RegExp(listedRule.url_fragment);
												
												if (regexp.test(url) === true) {
														thisRule = listedRule;
														break;
												}
												break;
										case 'EXACT':
												if (url === listedRule.url_fragment) {
														thisRule = listedRule;
														break;
												}
												break;
								}
						}
				};		
				return callback(thisRule);
		});
};

// --------------------------------------------------------------------------------------------------------
// Events

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		if (changeInfo.status === 'complete') {
				getRule(tab.url, function(rule) {
						if (rule !== null) {
								triggerContentScript(tab.id, rule);
						}
				});
		}
});

chrome.runtime.onMessage.addListener(function (message, sender) {
    switch (message.action) {
        case 'setUnique':
            chrome.tabs.get(sender.tab.id, function (current_tab) {
                if (current_tab === undefined) {
                    return;
                }
                
                let tab, tab_id;
                
                chrome.tabs.query({}, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        tab = tabs[i];
                        
                        if (tab.url.indexOf(message.url_fragment) !== -1 && tab.id !== current_tab.id) {
                            tab_id = tab.id;
                            
                            chrome.tabs.executeScript(current_tab.id, {
                                code: 'window.onbeforeunload = null;'
                            }, function () {
                                chrome.tabs.remove(current_tab.id);
                                
                                chrome.tabs.update(tab_id, {
                                    url: current_tab.url,
                                    highlighted: true
                                });
                            });
                        }
                    }
                });
            });
            break;
        case 'setPinned':
            chrome.tabs.update(sender.tab.id, {
                pinned: true
            });
            break;
        case 'setMuted':
            chrome.tabs.update(sender.tab.id, {
                muted: true
            });
            break;
    }
});

chrome.browserAction.onClicked.addListener(function () {
    openOptionsPage();
});

chrome.runtime.onInstalled.addListener(function (details) {
		// create on intall and add listener every time; see: https://stackoverflow.com/questions/26245888/adding-context-menu-item-on-a-non-persistent-background-script
		chrome.contextMenus.create({
				id: 'rename-tab',
				title: 'Rename Tab',
				contexts: ['all']
		});
		
    switch (details.reason) {
        case 'install':
            openOptionsPage('install');
            break;
        case 'update':
            getStorage(function (tab_modifier) {
                if (tab_modifier === undefined || tab_modifier.settings === undefined) {
                    return;
                }
                
                if (tab_modifier.settings !== undefined && tab_modifier.settings.enable_new_version_notification === true && details.previousVersion !== chrome.runtime.getManifest().version) {
                    openOptionsPage('update/' + chrome.runtime.getManifest().version);
                }
            });
            break;
    }
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'rename-tab') {
        let title = prompt('Enter the new title, a Tab rule will be automatically created for you based on current URL');
				if (title === null) { 
						return; // user pressed cancel
				}
        
        getStorage(function (tab_modifier) {
            if (tab_modifier === undefined) {
                tab_modifier = {
                    settings: {
                        enable_new_version_notification: false
                    },
                    rules: []
                };
            }
            
            let rule = {
                name: 'Rule created from right-click (' + tab.url.replace(/(^\w+:|^)\/\//, '').substring(0, 15) + '...)',
                detection: 'CONTAINS',
                url_fragment: tab.url,
                tab: {
                    title: title,
                    icon: null,
                    pinned: false,
                    protected: false,
                    unique: false,
                    muted: false,
                    title_matcher: null,
                    url_matcher: null
                }
            };
            
            tab_modifier.rules.push(rule);
            
            chrome.storage.local.set({ tab_modifier: tab_modifier });
            
            chrome.tabs.reload(tab.id);
        });
    }
});
