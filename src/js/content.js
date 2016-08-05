var w = window;

chrome.storage.local.get('tab_modifier', function (items) {
    if (items.tab_modifier === undefined) {
        return;
    }

    var tab_modifier = items.tab_modifier, rule = null;

    // Check if a rule is available
    for (var i = 0; i < tab_modifier.rules.length; i++) {
        if (tab_modifier.rules[i].detection === undefined || tab_modifier.rules[i].detection === 'CONTAINS') {
            if (location.href.indexOf(tab_modifier.rules[i].url_fragment) !== -1) {
                rule = tab_modifier.rules[i];
                break;
            }
        } else {
            switch (tab_modifier.rules[i].detection) {
                case 'STARTS':
                    if (location.href.startsWith(tab_modifier.rules[i].url_fragment) === true) {
                        rule = tab_modifier.rules[i];
                        break;
                    }
                    break;
                case 'ENDS':
                    if (location.href.endsWith(tab_modifier.rules[i].url_fragment) === true) {
                        rule = tab_modifier.rules[i];
                        break;
                    }
                    break;
            }
        }
    }

    // No rule available
    if (rule === null) {
        return;
    }

    var getTextBySelector, updateTitle, processTitle;

    /**
     * Returns the text related to the given CSS selector
     * @param selector
     * @returns {string}
     */
    getTextBySelector = function (selector) {
        var el = document.querySelector(selector), value = '';

        if (el !== null) {
            value = el.innerText || el.textContent;
        }

        return value.trim();
    };

    /**
     * Update title string by replacing given tag by value
     * @param title
     * @param tag
     * @param value
     * @returns {*}
     */
    updateTitle = function (title, tag, value) {
        if (value === '') {
            return title;
        }

        return title.replace(tag, value);
    };

    /**
     * Process new title depending on current URL & current title
     * @param current_url
     * @returns {*}
     */
    processTitle = function (current_url) {
        var title = rule.tab.title, matches = title.match(/\{([^}]+)}/g), i;

        // Handle curly braces tags inside title
        if (matches !== null) {
            var selector, text;

            for (i = 0; i < matches.length; i++) {
                selector = matches[i].substring(1, matches[i].length - 1);
                text     = getTextBySelector(selector);
                title    = updateTitle(title, matches[i], text);
            }
        }

        // Handle url_matcher
        if (rule.tab.url_matcher !== null) {
            try {
                matches = current_url.match(new RegExp(rule.tab.url_matcher), 'g');

                if (matches !== null) {
                    for (i = 0; i < matches.length; i++) {
                        title = updateTitle(title, '$' + i, matches[i]);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }

        return title;
    };

    // Set title
    if (rule.tab.title !== null) {
        document.title = processTitle(location.href);
    }

    var changed_by_me = false, observer;

    // Set up a new observer
    observer = new window.WebKitMutationObserver(function (mutations) {
        if (changed_by_me === true) {
            changed_by_me = false;
        } else {
            mutations.forEach(function () {
                if (rule.tab.title !== null) {
                    document.title = processTitle(location.href);
                }

                changed_by_me = true;
            });
        }
    });

    // Observe when the website has changed the title
    if (document.querySelector('head > title') !== null) {
        observer.observe(document.querySelector('head > title'), {
            subtree: true,
            characterresponse: true,
            childList: true
        });
    }

    // Pin the tab
    if (rule.tab.pinned === true) {
        chrome.runtime.sendMessage({ action: 'setPinned' });
    }

    // Set new icon
    if (rule.tab.icon !== null) {
        var el, icon, link;

        el = document.querySelectorAll('head link[rel*="icon"]');

        // Remove existing favicons
        Array.prototype.forEach.call(el, function (node) {
            node.parentNode.removeChild(node);
        });

        // Set preconfigured or custom ("http" catched) icon
        icon = (rule.tab.icon.indexOf('http') === -1) ? chrome.extension.getURL('/img/' + rule.tab.icon) : rule.tab.icon;

        // Create new favicon
        link      = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel  = 'icon';
        link.href = icon;

        document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Protect the tab
    if (rule.tab.protected === true) {
        w.onbeforeunload = function () {
            return '';
        };
    }

    // Keep this tab unique
    if (rule.tab.unique === true) {
        chrome.runtime.sendMessage({
            action: 'setUnique',
            url_fragment: rule.url_fragment
        });
    }

    // Mute the tab
    if (rule.tab.muted === true) {
        chrome.runtime.sendMessage({ action: 'setMuted' });
    }
});
