var Tab = (function (current_url, current_title, options) {
    var title = null, icon = null, pinned = null,
        setTitle, getTitle, getIcon, getPinned;

    for (var string_to_match in options) {
        if (current_url.indexOf(string_to_match) !== -1) {
            title = options[string_to_match].title || null;
            icon = options[string_to_match].icon || null;
            pinned = options[string_to_match].pinned || null;
            break;
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
