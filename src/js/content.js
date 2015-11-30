var w = window;

chrome.runtime.sendMessage({
    method: 'getRules'
}, function (response) {
    if (response !== undefined && response.tab_modifier !== undefined) {
        var tab = new Tab(location.href, document.title, JSON.parse(response.tab_modifier)),
            changed_by_me = false, observer;

        // Set title at loading
        tab.setTitle();

        if (tab.getTitle() !== null) {
            document.title = tab.getTitle();
        }

        // Create an observer to detect when the website changes the title
        observer = new window.WebKitMutationObserver(function (mutations) {
            if (changed_by_me === true) {
                changed_by_me = false;
            } else {
                mutations.forEach(function (mutation) {
                    tab.setCurrentTitle(mutation.target.textContent);
                    tab.setTitle();

                    if (tab.getTitle() !== null) {
                        document.title = tab.getTitle();
                    }

                    changed_by_me = true;
                });
            }
        });

        observer.observe(document.querySelector('head > title'), { subtree: true, characterresponse: true, childList: true });

        // Pin the tab
        if (tab.getPinned() === true) {
            chrome.runtime.sendMessage({
                method: 'setPinned',
                tab_id: response.tab_id
            });
        }

        // Set new icon
        if (tab.getIcon() !== null) {
            var el, icon, link;

            el = document.querySelectorAll('head link[rel*="icon"]');

            // Remove existing favicons
            Array.prototype.forEach.call(el, function (node) {
                node.parentNode.removeChild(node);
            });

            icon = (tab.getIcon() === '{default}') ? chrome.extension.getURL('/img/default_favicon.png') : tab.getIcon();

            // Create new favicon
            link      = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel  = 'icon';
            link.href = icon;

            document.getElementsByTagName('head')[0].appendChild(link);
        }

        // Protect the tab
        if (tab.getProtected() === true) {
            w.onbeforeunload = function () {
                return '';
            };
        }

        // Keep this tab unique
        if (tab.getUnique() === true) {
            chrome.runtime.sendMessage({
                method: 'setUnique',
                match: tab.getUrlFragment(),
                tab_id: response.tab_id
            });
        }

    }
});
