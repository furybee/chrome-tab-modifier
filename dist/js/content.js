var Tab = (function (current_url, current_title, options) {
    var title = null, icon = null, pinned = null,
        setTitle, getTitle, getIcon, getPinned;

    for (var string_to_match in options) {
        if (current_url.indexOf(string_to_match) !== -1) {
            title = options[string_to_match].title || null;
            icon = options[string_to_match].icon || null;
            pinned = options[string_to_match].pinned || null;
        }
    }

    setTitle = function () {
        if (title !== null) {
            title = (title.indexOf('{title}') !== -1) ? title.replace('{title}', current_title) : title;
        }
    };

    setTitle();

    getTitle = function () {
        return title;
    };

    getIcon = function () {
        return icon;
    };

    getPinned = function () {
        return pinned;
    };

    // Public
    return {
        getTitle: getTitle,
        getIcon: getIcon,
        getPinned: getPinned
    };
});

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
