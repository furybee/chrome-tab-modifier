/*jshint loopfunc: true */

var options_url = chrome.extension.getURL('html/options.html'), openOptionsPage, getStorage;

// --------------------------------------------------------------------------------------------------------
// Functions

openOptionsPage = function (hash) {
    chrome.tabs.query({ url: options_url }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { active: true, highlighted: true });
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

// --------------------------------------------------------------------------------------------------------
// Events

chrome.runtime.onMessage.addListener(function (message, sender) {
    switch (message.action) {
        case 'setUnique':
            chrome.tabs.get(sender.tab.id, function (current_tab) {
                if (current_tab === undefined) {
                    return;
                }

                var tab, existingTab;

                chrome.tabs.query({}, function (tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        tab = tabs[i];

                        if (tab.url.indexOf(message.url_fragment) !== -1 && tab.id !== current_tab.id) {
                            existingTab = tab.id;
                            chrome.tabs.executeScript(current_tab.id, {
                                code: 'window.onbeforeunload = function () {};'
                            }, function () {
                                chrome.tabs.update(existingTab, {selected: true});
                                chrome.tabs.remove(current_tab.id);
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
