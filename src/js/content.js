var w = window;

chrome.runtime.sendMessage({
    method: 'getRules'
}, function (response) {
    if (response !== undefined && response.tab_modifier !== undefined) {
        var tab_modifier = JSON.parse(response.tab_modifier), rule = null;

        // Check if a rule is available
        for (var i = 0; i < tab_modifier.rules.length; i++) {
            if (location.href.indexOf(tab_modifier.rules[i].url_fragment) !== -1) {
                rule = tab_modifier.rules[i];
                break;
            }
        }

        // A rule is available
        if (rule !== null) {
            // Process new title depending on current URL & current title
            var processTitle = function (current_url, current_title) {
                var title = rule.tab.title;

                // Handle {title}
                title = (rule.tab.title.indexOf('{title}') !== -1) ? rule.tab.title.replace('{title}', current_title) : rule.tab.title;

                // Handle url_matcher
                if (rule.tab.url_matcher !== null) {
                    var matcher = current_url.match(rule.tab.url_matcher);

                    if (matcher !== null) {
                        for (var i = 0; i <= matcher.length; i++) {
                            title = title.replace('$'+ i, matcher[i] || '');
                        }
                    }
                }

                return title;
            };

            // Set title
            if (rule.tab.title !== null) {
                document.title = processTitle(location.href, document.title);
            }

            var changed_by_me = false, observer;

            // Set up a new observer
            observer = new window.WebKitMutationObserver(function (mutations) {
                if (changed_by_me === true) {
                    changed_by_me = false;
                } else {
                    mutations.forEach(function (mutation) {
                        if (rule.tab.title !== null) {
                            document.title = processTitle(location.href, mutation.target.textContent);
                        }

                        changed_by_me = true;
                    });
                }
            });

            // Observe when the website has changed the title
            observer.observe(document.querySelector('head > title'), {
                subtree: true,
                characterresponse: true,
                childList: true
            });

            // Pin the tab
            if (rule.tab.pinned === true) {
                chrome.runtime.sendMessage({
                    method: 'setPinned',
                    tab_id: response.tab_id
                });
            }

            // Set new icon
            if (rule.tab.icon !== null) {
                var el, icon, link;

                el = document.querySelectorAll('head link[rel*="icon"]');

                // Remove existing favicons
                Array.prototype.forEach.call(el, function (node) {
                    node.parentNode.removeChild(node);
                });

                icon = (rule.tab.icon === '{default}') ? chrome.extension.getURL('/img/default_favicon.png') : rule.tab.icon;

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
                    method: 'setUnique',
                    url_fragment: tab_modifier.url_fragment(),
                    tab_id: response.tab_id
                });
            }

            // Mute the tab
            if (rule.tab.muted === true) {
                chrome.runtime.sendMessage({
                    method: 'setMuted',
                    tab_id: response.tab_id
                });
            }

        }
    }
});
