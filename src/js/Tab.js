var Tab = (function (current_url, current_title, options) {
    var match = null, title = null, icon = null, pinned = null, protected_state = null, unique = null, url_params = null,
        setTitle, getTitle, getIcon, getPinned;

    for (var string_to_match in options) {
        if (current_url.indexOf(string_to_match) !== -1) {
            match = string_to_match;

            title           = options[string_to_match].title || null;
            icon            = options[string_to_match].icon || null;
            pinned          = options[string_to_match].pinned || null;
            protected_state = options[string_to_match].protected || null;
            unique          = options[string_to_match].unique || null;
            url_matcher     = options[string_to_match].url_matcher || null;

            break;
        }
    }

    setTitle = function () {
        if (title !== null) {
            title = (title.indexOf('{title}') !== -1) ? title.replace('{title}', current_title) : title;
        }
        if (url_matcher !== null) {
            var match = current_url.match(url_matcher) || [];
            for (var i = 1; i < match.length; i++) {
                title = title.replace('$'+i, match[i] || '');
            }
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
        return protected_state;
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
