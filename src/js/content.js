var w = window;

chrome.runtime.sendMessage({
    method: 'getSettings'
}, function (response) {
    var data = response.data;

    if (data !== undefined && data.settings !== undefined) {
        var tab = new Tab(location.href, document.title, JSON.parse(data.settings));

        // Set title at loading
        tab.setTitle();

        if (tab.getTitle() !== null) {
            // Write the new title
            document.title = tab.getTitle();
        }

        // Pin the tab
        if (tab.getPinned() === true) {
            chrome.runtime.sendMessage({
                method: 'setPinned',
                tabId: data.tab_id
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
                match: tab.getMatch(),
                tabId: data.tab_id
            });
        }

    }
});
