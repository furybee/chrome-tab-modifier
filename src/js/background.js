chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.method) {
        case 'getSettings':
            sendResponse({
                data: {
                    tab_id: sender.tab.id,
                    settings: localStorage.settings
                }
            });
        break;
        case 'setUnique':
            chrome.tabs.get(request.tabId, function (tab) {
                var current_tab = tab;

                chrome.tabs.query({}, function (tabs) {
                    var i, tab;

                    for (i in tabs) {
                        tab = tabs[i];

                        if (tab.url.indexOf(request.match) !== -1) {
                            chrome.tabs.update(tab.id, {
                                highlighted: true
                            });

                            if (tab.id !== current_tab.id) {
                                chrome.tabs.remove(current_tab.id);
                            }
                        }
                    }
                });
            });
        break;
        case 'setPinned':
            chrome.tabs.update(request.tabId, {
                pinned: true
            });
        break;
        default:
            sendResponse({ });
        break;
    }
});
