/**
* Chrome message receiver
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.method) {
        case 'getSettings':
            sendResponse({
                data: {
                    tabId:      sender.tab.id,
                    settings:   localStorage['settings']
                }
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
