var Tab = (function (current_url, current_title, options) {
    var match = null, title = null, icon = null, pinned = null, protected = null, unique = null,
        setTitle, getTitle, getIcon, getPinned;

    for (var string_to_match in options) {
        if (current_url.indexOf(string_to_match) !== -1) {
            match = string_to_match;

            title = options[string_to_match].title || null;
            icon = options[string_to_match].icon || null;
            pinned = options[string_to_match].pinned || null;
            protected = options[string_to_match].protected || null;
            unique = options[string_to_match].unique || null;

            break;
        }
    }

    setTitle = function () {
        if (title !== null) {
            title = (title.indexOf('{title}') !== -1) ? title.replace('{title}', current_title) : title;
        }
    };

    setTitle();

    getMatch = function () {
        return match;
    };

    getTitle = function () {
        return title;
    };

    getIcon = function () {
        return icon;
    };

    getPinned = function () {
        return pinned;
    };

    getProtected = function () {
        return protected;
    };

    getUnique = function () {
        return unique;
    };

    // Public
    return {
        getMatch: getMatch,
        getTitle: getTitle,
        getIcon: getIcon,
        getPinned: getPinned,
        getProtected: getProtected,
        getUnique: getUnique
    };
});
