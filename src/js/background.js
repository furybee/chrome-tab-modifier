/*jshint loopfunc: true */

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.method) {
        case 'getSettings':
            sendResponse({
                data: {
                    tab_id: sender.tab.id,
                    settings: localStorage.settings
                }
            });
        break;
        case 'setUnique':
            chrome.tabs.get(message.tab_id, function (tab) {
                var current_tab = tab;

                chrome.tabs.query({}, function (tabs) {
                    var i, tab;

                    for (i in tabs) {
                        tab = tabs[i];

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
