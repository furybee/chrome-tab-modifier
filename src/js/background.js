/*jshint loopfunc: true */

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.method) {
        case 'getRules':
            sendResponse({
                tab_id: sender.tab.id,
                tab_modifier: localStorage.tab_modifier
            });
            break;
        case 'setUnique':
            chrome.tabs.getCurrent(function (current_tab) {
                if (current_tab !== undefined) {
                    var tab;

                    chrome.tabs.query({}, function (tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            tab = tabs[i];

                            if (tab.url.indexOf(message.url_fragment) !== -1) {
                                chrome.tabs.update(tab.id, {
                                    highlighted: true
                                });

                                if (tab.id !== current_tab.id) {
                                    chrome.tabs.executeScript(current_tab.id, {
                                        code: 'window.onbeforeunload = function () {};'
                                    }, function () {
                                        chrome.tabs.remove(current_tab.id);
                                    });
                                }
                            }
                        }
                    });
                }
            });
            break;
        case 'setPinned':
            chrome.tabs.update(message.tab_id, {
                pinned: true
            });
            break;
        case 'setMuted':
            chrome.tabs.update(message.tab_id, {
                muted: true
            });
            break;
        default:
            sendResponse({ });
            break;
    }
});

chrome.browserAction.onClicked.addListener(function (tab) {
    var relative_options_page_file = 'html/options.min.html',
        options_url = chrome.extension.getURL(relative_options_page_file),
        found = false;

    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            tab = tabs[i];

            if (tab.url.indexOf(options_url) !== -1) {
                chrome.tabs.get(tab.id, function (tab) {
                    chrome.tabs.highlight({ tabs: tab.index });
                });

                found = true;
            }
        }

        if (found === false) {
            chrome.tabs.create({ url: relative_options_page_file });
        }
    });
});
