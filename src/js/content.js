chrome.runtime.sendMessage({
    method: 'getSettings'
}, function(response) {
    var settings = response.data;

    if (settings !== undefined) {
        var tab = new Tab(location.href, document.title, JSON.parse(settings.settings));

        if (tab.title !== null) {
            // Title tag
            var title_tag = '{title}';

            // Updating the document title
            document.title = (tab.title.indexOf(title_tag) !== -1) ? tab.title.replace(title_tag, document.title) : tab.title;
        }

        if (tab.pinned === true) {
            // Updating the pinned state
            chrome.runtime.sendMessage({
                method: 'setPinned',
                tabId: settings.tab_id
            });
        }

        if (tab.icon !== null) {
            var el, icon, link;

            el = document.querySelectorAll('head link[rel*="icon"]'),

            // Remove existing favicons
            Array.prototype.forEach.call(el, function (node) {
                node.parentNode.removeChild(node);
            });

            icon = (tab.icon === '{default}') ? chrome.extension.getURL('/dist/img/default_favicon.png') : tab.icon;

            // Create new favicon
            link      = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel  = 'icon';
            link.href = icon;

            document.head.appendChild(link);
        }
    }
});
