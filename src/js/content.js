chrome.runtime.sendMessage({
    method: 'getSettings'
}, function(response) {
    var settings = response.data;

    if (settings !== undefined) {
        var tab = new Tab(location.href, document.title, JSON.parse(settings.settings));

        if (tab.getTitle() !== null) {
            document.title = tab.getTitle();
        }

        if (tab.getPinned() === true) {
            // Updating the pinned state
            chrome.runtime.sendMessage({
                method: 'setPinned',
                tabId: settings.tab_id
            });
        }

        if (tab.getIcon() !== null) {
            var el, icon, link;

            el = document.querySelectorAll('head link[rel*="icon"]'),

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
    }
});
