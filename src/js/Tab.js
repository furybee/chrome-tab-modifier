var Tab = (function (current_url, current_title, options) {
    var match = null, title = null, icon = null, pinned = null, protected_state = null, unique = null,
        setTitle, getTitle, getIcon, getPinned;

    for (var string_to_match in options) {
        if (current_url.indexOf(string_to_match) !== -1) {
            match = string_to_match;

            title           = options[string_to_match].title || null;
            icon            = options[string_to_match].icon || null;
            pinned          = options[string_to_match].pinned || null;
            protected_state = options[string_to_match].protected || null;
            unique          = options[string_to_match].unique || null;

            break;
        }
    }

    getMatch = function () {
        return match;
    };

    getTitle = function () {
        return title;
    };

    setTitle = function () {
        if (title !== null) {
            title = (title.indexOf('{title}') !== -1) ? title.replace('{title}', current_title) : title;
        }
    };

    getIcon = function () {
        return icon;
    };

    getPinned = function () {
        return pinned;
    };

    getProtected = function () {
        return protected_state;
    };

    getUnique = function () {
        return unique;
    };

    // Public
    return {
        getMatch: getMatch,
        getTitle: getTitle,
        setTitle: setTitle,
        getIcon: getIcon,
        getPinned: getPinned,
        getProtected: getProtected,
        getUnique: getUnique
    };
});
