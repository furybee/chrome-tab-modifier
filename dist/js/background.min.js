/*jshint loopfunc: true */

chrome.runtime.onMessage.addListener(function (message, sender) {
    switch (message.action) {
        case 'setUnique':
            chrome.tabs.get(sender.tab.id, function (current_tab) {
                if (current_tab === undefined) {
                    return;
                }

                var tab;

                chrome.tabs.query({}, function (tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        tab = tabs[i];

                        if (tab.url.indexOf(message.url_fragment) !== -1 && tab.id !== current_tab.id) {
                            chrome.tabs.executeScript(current_tab.id, {
                                code: 'window.onbeforeunload = function () {};'
                            }, function () {
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

var openOptionsPage = function (hash) {
    var options_url = chrome.extension.getURL('html/options.min.html');

    chrome.tabs.query({ url: options_url }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { active: true, highlighted: true });
        } else {
            chrome.tabs.create({ url: (hash !== undefined) ? options_url + '#' + hash : options_url });
        }
    });
};

chrome.browserAction.onClicked.addListener(function () {
    openOptionsPage();
});

chrome.runtime.onInstalled.addListener(function (details) {
    switch (details.reason) {
        case 'install':
            openOptionsPage('install');
            break;
        case 'update':
            if (details.previousVersion !== chrome.runtime.getManifest().version) {
                openOptionsPage('update/' + chrome.runtime.getManifest().version);
            }
            break;
    }
});
