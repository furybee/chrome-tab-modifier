const STORAGE_KEY = 'tab_modifier';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo['url']) {
        return;
    }

    chrome.storage.local.get(STORAGE_KEY, (items) => {
        const tabModifier = items?.[STORAGE_KEY];

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
                const tmGroup = tabModifier.groups.find((g) => g.id === rule.tab.group_id);

                const tabGroupsQueryInfo = {
                    title: tmGroup.title,
                    windowId: tab.windowId
                };

                chrome.tabGroups.query(tabGroupsQueryInfo, (groups: chrome.tabGroups.TabGroup[]) => {
                    if (groups.length === 0) {
                        const groupCreateProperties = {
                            tabIds: [tab.id]
                        };

                        chrome.tabs.group(groupCreateProperties, (groupId: number) => {
                            const updateProperties = {
                                title: tmGroup.title,
                                color: tmGroup.color,
                                collapsed: tmGroup.collapsed,
                            };

                            chrome.tabGroups.update(groupId, updateProperties, (updatedGroup: chrome.tabGroups.TabGroup) => {
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
                            const updateProperties = {
                                title: tmGroup.title,
                                color: tmGroup.color,
                                collapsed: tmGroup.collapsed,
                            };

                            chrome.tabGroups.update(groupId, updateProperties, (updatedGroup: chrome.tabGroups.TabGroup) => {
                                console.log('update', updatedGroup);

                                chrome.tabs.get(tab.id, function(tab: chrome.tabs.Tab) {
                                    chrome.tabs.highlight({'tabs': tab.index}, function() {});
                                });
                            });

                        });
                    }
                });
            }

        }

        applyRule();
    });
});

chrome.runtime.onMessage.addListener(function (message, sender) {
    switch (message.action) {
        case 'setUnique':
            chrome.tabs.get(sender.tab.id, function (currentTab: chrome.tabs.Tab) {
                if (currentTab === undefined) {
                    return;
                }

                let tab: chrome.tabs.Tab, tabId: number;

                chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
                    for (let i = 0; i < tabs.length; i++) {
                        tab = tabs[i];

                        if (tab.url.indexOf(message.url_fragment) !== -1 && tab.id !== currentTab.id) {
                            tabId = tab.id;

                            const injectDetails = {
                                code: 'window.onbeforeunload = null;'
                            };

                            chrome.tabs.executeScript(currentTab.id, injectDetails, () => {
                                chrome.tabs.remove(currentTab.id);

                                chrome.tabs.update(tabId, {
                                    url: currentTab.url,
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
