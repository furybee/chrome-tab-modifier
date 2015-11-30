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
            chrome.tabs.get(message.tab_id, function (tab) {
                var current_tab = tab;

                chrome.tabs.query({}, function (tabs) {
                    for (var tab in tabs) {
                        if (tab.url.indexOf(message.match) !== -1) {
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
            });
        break;
        case 'setPinned':
            chrome.tabs.update(message.tab_id, {
                pinned: true
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
        for (var tab in tabs) {
            if (tab.url === options_url) {
                chrome.tabs.update(tab.id, {
                    highlighted: true
                });

                found = true;
            }
        }

        if (found === false) {
            chrome.tabs.create({ url: relative_options_page_file });
        }
    });
});
