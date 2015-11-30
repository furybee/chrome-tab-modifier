var Tab = (function (current_url, current_title, tab_modifier) {
    var title = null, rule,
        current_rule = {
            name: null,
            tab: {
                title: null,
                icon: null,
                pinned: null,
                protected: null,
                unique: null,
                url_matcher: null
            }
        };

    for (var i = 0; i < tab_modifier.rules.length; i++) {
        rule = tab_modifier.rules[i];

        if (current_url.indexOf(rule.url_fragment) !== -1) {
            current_rule = rule;
            break;
        }
    }

    getUrlFragment = function () {
        return current_rule.url_fragment;
    };

    getRuleName = function () {
        return current_rule.name;
    };

    getTitle = function () {
        return title;
    };

    getIcon = function () {
        return current_rule.tab.icon;
    };

    getPinned = function () {
        return current_rule.tab.pinned;
    };

    getProtected = function () {
        return current_rule.tab.protected;
    };

    getUnique = function () {
        return current_rule.tab.unique;
    };

    setCurrentTitle = function (new_title) {
        current_title = new_title;
    };

    setTitle = function () {
        if (current_rule.tab !== undefined && current_rule.tab.title !== null) {
            title = (current_rule.tab.title.indexOf('{title}') !== -1) ? current_rule.tab.title.replace('{title}', current_title) : current_rule.tab.title;
        }

        if (current_rule.tab !== undefined && current_rule.tab.url_matcher !== null) {
            var matcher = current_url.match(current_rule.tab.url_matcher);

            if (matcher !== null) {
                for (var i = 0; i <= matcher.length; i++) {
                    title = title.replace('$'+ i, matcher[i] || '');
                }
            }
        }
    };

    // Public
    return {
        getUrlFragment: getUrlFragment,
        getTitle: getTitle,
        getIcon: getIcon,
        getPinned: getPinned,
        getProtected: getProtected,
        getUnique: getUnique,

        setCurrentTitle: setCurrentTitle,
        setTitle: setTitle
    };
});
