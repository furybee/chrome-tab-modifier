var Tab = (function (current_url, current_title, options) {
    var match = null, title = null,
        settings = {
            title: null,
            icon: null,
            pinned: null,
            protected: null,
            unique: null,
            url_matcher: null,
        };

    for (var string_to_match in options) {
        if (current_url.indexOf(string_to_match) !== -1) {
            match = string_to_match;

            settings.title       = options[string_to_match].title || null;
            settings.icon        = options[string_to_match].icon || null;
            settings.pinned      = options[string_to_match].pinned || null;
            settings.protected   = options[string_to_match].protected || null;
            settings.unique      = options[string_to_match].unique || null;
            settings.url_matcher = options[string_to_match].url_matcher || null;

            break;
        }
    }

    getMatch = function () {
        return match;
    };

    getTitle = function () {
        return title;
    };

    getIcon = function () {
        return settings.icon;
    };

    getPinned = function () {
        return settings.pinned;
    };

    getProtected = function () {
        return settings.protected;
    };

    getUnique = function () {
        return settings.unique;
    };

    setCurrentTitle = function (new_title) {
        current_title = new_title;
    };

    setTitle = function () {
        if (settings.title !== null) {
            title = (settings.title.indexOf('{title}') !== -1) ? settings.title.replace('{title}', current_title) : settings.title;
        }

        if (settings.url_matcher !== null) {
            var matcher = current_url.match(settings.url_matcher);

            if (matcher !== null) {
                for (var i = 0; i <= matcher.length; i++) {
                    title = title.replace('$'+ i, matcher[i] || '');
                }
            }
        }
    };

    // Public
    return {
        getMatch: getMatch,
        getTitle: getTitle,
        getIcon: getIcon,
        getPinned: getPinned,
        getProtected: getProtected,
        getUnique: getUnique,

        setCurrentTitle: setCurrentTitle,
        setTitle: setTitle
    };
});
