const STORAGE_KEY = 'tab_modifier';
const EVENT_HASH_CHANGE = 'hashchange';

// Helper functions for readability
function getTextBySelector(selector) {
    const el = document.querySelector(selector);
    return el?.childNodes[0]?.textContent?.trim() ?? '';
}

function updateTitle(title, tag, value) {
    return value ? title.replace(tag, value) : title;
}

function processTitle(currentUrl, currentTitle, rule) {
    let title = rule.tab.title;
    const matches = title.match(/\{([^}]+)}/g);

    if (matches) {
        matches.forEach((match) => {
            const selector = match.substring(1, match.length - 1);
            const text = getTextBySelector(selector);
            title = updateTitle(title, match, text);
        });
    }

    if (rule.tab.title_matcher) {
        try {
            const titleMatches = currentTitle.match(new RegExp(rule.tab.title_matcher, 'g'));
            if (titleMatches) {
                titleMatches.forEach((match, i) => {
                    title = updateTitle(title, '@' + i, match);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (rule.tab.url_matcher) {
        try {
            const urlMatches = currentUrl.match(new RegExp(rule.tab.url_matcher, 'g'));
            if (urlMatches) {
                urlMatches.forEach((match, i) => {
                    title = updateTitle(title, '$' + i, match);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    return title;
}

function processIcon(newIcon) {
    const icons = document.querySelectorAll('head link[rel*="icon"]');
    icons.forEach((icon) => icon.parentNode.removeChild(icon));

    const iconUrl = /^(https?|data):/.test(newIcon) ? newIcon : chrome.runtime.getURL(`/assets/${newIcon}`);
    const newIconLink = document.createElement('link');
    newIconLink.type = 'image/x-icon';
    newIconLink.rel = 'icon';
    newIconLink.href = iconUrl;
    document.head.appendChild(newIconLink);

    return true;
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
                    return location.href.includes(urlFragment);
                case 'STARTS':
                    return location.href.startsWith(urlFragment);
                case 'ENDS':
                    return location.href.endsWith(urlFragment);
                case 'REGEXP':
                    return new RegExp(urlFragment).test(location.href);
                case 'EXACT':
                    return location.href === urlFragment;
                default:
                    return false;
            }
        });

        if (!rule) {
            return;
        }

        // Apply tab modifications
        if (rule.tab.title) {
            document.title = processTitle(location.href, document.title, rule);

            const titleObserver = new MutationObserver((mutations) => {
                if (!titleChangedByMe) {
                    document.title = processTitle(location.href, document.title, rule);
                    titleChangedByMe = true;
                } else {
                    titleChangedByMe = false;
                }
            });

            titleObserver.observe(document.querySelector('head > title'), {
                subtree: true,
                characterResponse: true,
                childList: true,
            });
        }

        let titleChangedByMe = false;

        // Pinning, muting handled through Chrome Runtime messages
        if (rule.tab.pinned) {
            chrome.runtime.sendMessage({action: 'setPinned'});
        }

        if (rule.tab.muted) {
            chrome.runtime.sendMessage({action: 'setMuted'});
        }

        let iconChangedByMe = false;

        // Favicon handling
        if (rule.tab.icon) {
            processIcon(rule.tab.icon);

            const iconObserver = new MutationObserver((mutations) => {
                if (!iconChangedByMe) {
                    mutations.forEach((mutation) => {
                        if (mutation.target.type === 'image/x-icon') {
                            processIcon(rule.tab.icon);
                            iconChangedByMe = true;
                        } else if (mutation.addedNodes.length) {
                            mutation.addedNodes.forEach((node) => {
                                if (node.type === 'image/x-icon') {
                                    processIcon(rule.tab.icon);
                                    iconChangedByMe = true;
                                }
                            });
                        } else if (mutation.removedNodes.length) {
                            mutation.removedNodes.forEach((node) => {
                                if (node.type === 'image/x-icon') {
                                    processIcon(rule.tab.icon);
                                    iconChangedByMe = true;
                                }
                            });
                        }
                    });
                } else {
                    iconChangedByMe = false;
                }
            });

            iconObserver.observe(document.head, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true,
                attributeOldValue: true,
                characterDataOldValue: true,
            });
        }

        // Protection (disable beforeunload event) and unique tab handling
        if (rule.tab.protected) {
            window.onbeforeunload = () => '';
        }

        if (rule.tab.unique) {
            chrome.runtime.sendMessage({
                action: 'setUnique',
                urlFragment: rule.url_fragment,
            });
        }
    }

    applyRule();

    // Remove hashchange listener to avoid conflicts (commented out)
    // window.onhashchange = applyRule;
});


