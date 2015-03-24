var Tab = (function (hey) {
    var self = {};

    self.init = function (url_to_match, options) {
        for (var string_to_match in options) {
            if (url_to_match.indexOf(string_to_match) !== -1) {
                return {
                    title: options[string_to_match].title || null,
                    icon: options[string_to_match].icon || null,
                    pinned: options[string_to_match].pinned || null
                };
            }
        }

        return {};
    };

    return self;
})();
