
// let options_url = chrome.extension.getURL('options.html'), openOptionsPage, getStorage;

// console.log('options_url', options_url);

// getStorage = function (callback) {
//     chrome.storage.local.get('tab_modifier', function (items) {
//         callback(items.tab_modifier);
//     });
// };

// openOptionsPage = function (hash) {
//     console.log('openOptionsPage', options_url, hash);
//     // chrome.tabs.query({ url: options_url }, function (tabs) {
//     //     if (tabs.length > 0) {
//     //         chrome.tabs.update(tabs[0].id, { active: true, highlighted: true }, function (current_tab) {
//     //             chrome.windows.update(current_tab.windowId, { focused: true });
//     //         });
//     //     } else {
//     //         chrome.tabs.create({ url: (hash !== undefined) ? options_url + '#' + hash : options_url });
//     //     }
//     // });
// };

// chrome.contextMenus.create({
//     id: 'rename-tab',
//     title: 'Rename Tab',
//     contexts: ['all']
// });

// @ts-expect-error: Ignore chrome not defined error

// chrome.tabs.onUpdated.addListener((tabId: any, changeInfo: any, tab: any): void => {
//     console.log(`Change URL: ${tabId}`);
//     console.log(`Change URL: ${tab.url}`);
//     console.log(`Change URL: ${changeInfo}`);
//     console.log(`Change URL: ${tab}`);
// });

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
        case 'setGroup':
            chrome.tabs.group({
                groupId: message.groupId,
                tabIds: [sender.tab.id]
            });
            break;
        case 'setMuted':
            chrome.tabs.update(sender.tab.id, {
                muted: true
            });
            break;
    }
});

export {};
