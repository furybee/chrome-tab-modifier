const STORAGE_KEY = 'tab_modifier';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo['url']) {
        return;
    }

    console.log('Tab Url Changed', tabId, changeInfo, tab);

    chrome.storage.local.get(STORAGE_KEY, (items) => {
        const tabModifier = items?.[STORAGE_KEY];

        console.log('tabModifier', tabModifier);

        if (!tabModifier) {
            return;
        }

        let rule = null;

        function applyRule() {
            rule = tabModifier.rules.find((r) => {
                const detectionType = r.detection ?? 'CONTAINS';
                const urlFragment = r.url_fragment;

                switch (detectionType) {
                    case 'CONTAINS':
                        return tab.url.includes(urlFragment);
                    case 'STARTS':
                        return tab.url.startsWith(urlFragment);
                    case 'ENDS':
                        return tab.url.endsWith(urlFragment);
                    case 'REGEXP':
                        return new RegExp(urlFragment).test(tab.url);
                    case 'EXACT':
                        return tab.url === urlFragment;
                    default:
                        return false;
                }
            });

            if (!rule) {
                return;
            }

            if (rule.tab.group_id) {
                const group = tabModifier.groups.find((g) => g.id === rule.tab.group_id);
                console.log('Tab modifier Group', group);

                const tabGroupsQueryInfo = {
                    title: group.title,
                    windowId: tab.windowId
                };

                chrome.tabGroups.query(tabGroupsQueryInfo, (groups: chrome.tabGroups.TabGroup[]) => {
                    console.log('query', groups.length);

                    if (groups.length === 0) {
                        const groupCreateProperties = {
                            tabIds: [tab.id]
                        };

                        chrome.tabs.group(groupCreateProperties, (groupId: number) => {
                            console.log('create', groupId);

                            const updateProperties = {
                                title: group.title,
                                color: group.color,
                            };

                            chrome.tabGroups.update(groupId, updateProperties, (updatedGroup: chrome.tabGroups.TabGroup) => {
                                console.log('update', updatedGroup);

                                chrome.tabs.get(tab.id, function(tab) {
                                    chrome.tabs.highlight({'tabs': tab.index}, function() {});
                                });
                            });
                        });
                    } else if (groups.length === 1) {
                        const group = groups[0];

                        const tabGroupsQueryInfo = {
                            groupId: group.id,
                            tabIds: [tab.id]
                        };

                        chrome.tabs.group(tabGroupsQueryInfo, (groupId: number) => {
                            chrome.tabs.get(tab.id, function(tab) {
                                chrome.tabs.highlight({'tabs': tab.index}, function() {});
                            });
                        });
                    } else {
                        console.log('group ?');
                    }
                });
            }

        }

        applyRule();

        // Remove hashchange listener to avoid conflicts (commented out)
        // window.onhashchange = applyRule;
    });
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
        case 'setGroup':
            if (sender.tab.url === "chrome://newtab/") {
                return;
            }

            const tabGroupsQueryInfo = {
                title: message.groupTitle
            };

            console.log('sender.tab', sender.tab);

            chrome.tabGroups.query(tabGroupsQueryInfo, (groups: chrome.tabGroups.TabGroup[]) => {
                if (groups.length === 0) {
                    const groupCreateProperties = {
                        tabIds: [sender.tab.id]
                    };

                    chrome.tabs.group(groupCreateProperties, (groupId: number) => {
                        console.log('group 0', groupId);

                        const updateProperties = {
                            title: message.groupTitle,
                            color: message.groupColor,
                        };

                        chrome.tabGroups.update(groupId, updateProperties, (updatedGroup: chrome.tabGroups.TabGroup) => {
                            console.log('group 0 update', updatedGroup);
                        });
                    });
                } else if (groups.length === 1) {
                    const group = groups[0];

                    console.log('group 1', group);

                    chrome.tabs.group({
                        groupId: group.id,
                        tabIds: [sender.tab.id]
                    });
                } else {
                    console.log('group ?');
                }
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
