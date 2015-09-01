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
            url_params      = options[string_to_match].url_params || null;

            break;
        }
    }

    setTitle = function () {
        if (title !== null) {
            title = (title.indexOf('{title}') !== -1) ? title.replace('{title}', current_title) : title;
        }
        if (url_params !== null) {
            for (var token in url_params) {
                var match = current_url.match(url_params[token]) || [];
                var value = match[1] || '';
                title = title.replace('{'+token+'}', value);
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
