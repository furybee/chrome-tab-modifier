/**
* Chrome message receiver
*
* @param object request
* @param object sender
* @param function sendResponse
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.method) {
        case 'getSettings':
            sendResponse({
                data: {
                    tab_id:   sender.tab.id,
                    settings: localStorage.settings
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
