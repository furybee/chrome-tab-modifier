app.factory('TabModifier', ['Rule', function (Rule) {

    var TabModifier = function (properties) {
        this.rules = [];

        angular.extend(this, properties);
    };

    TabModifier.prototype.setModel = function (obj) {
        angular.extend(this, obj);
    };

    TabModifier.prototype.addRule = function (rule) {
        this.rules.push(rule);
    };

    TabModifier.prototype.removeRule = function (rule) {
        this.rules.splice(this.rules.indexOf(rule), 1);
    };

    TabModifier.prototype.save = function (rule, index) {
        if (index === null || index === undefined) {
            this.addRule(rule);
        } else {
            this.rules[index] = rule;
        }
    };

    TabModifier.prototype.build = function (data) {
        var self = this;

        this.rules = [];

        angular.forEach(data.rules, function (rule) {
            self.addRule(new Rule(rule));
        });
    };

    TabModifier.prototype.getLocalData = function () {
        if (localStorage.tab_modifier !== undefined) {
            this.build(JSON.parse(localStorage.tab_modifier));
        }
    };

    TabModifier.prototype.setLocalData = function () {
        localStorage.tab_modifier = JSON.stringify(this);
    };

    TabModifier.prototype.checkOldSettings = function () {
        var self = this, old_settings, rule, i = 0;

        if (localStorage.settings !== undefined) {
            this.rules = [];

            old_settings = JSON.parse(localStorage.settings);

            for (var key in old_settings) {
                if (old_settings.hasOwnProperty(key)) {
                    rule = new Rule({
                        name: 'Rule '+ (i + 1),
                        url_fragment: key,
                        tab: {
                            title: old_settings[key].title || null,
                            icon: old_settings[key].icon  || null,
                            pinned: old_settings[key].pinned  || false,
                            protected: old_settings[key].protected  || false,
                            unique: old_settings[key].unique  || false,
                            muted: old_settings[key].muted  || false,
                            url_matcher: old_settings[key].url_matcher  || null
                        }
                    });

                    self.addRule(rule);
                }

                i++;
            }

            localStorage.removeItem('settings');

            return true;
        } else {
            return false;
        }
    };

    TabModifier.prototype.import = function (json) {
        try {
            var settings = JSON.parse(json);
            console.log(settings);

            if ('rules' in settings === false) {
                return 'INVALID_SETTINGS';
            }
        } catch (e) {
            return 'INVALID_JSON_FORMAT';
        }

        localStorage.tab_modifier = json;

        return true;
    };

    TabModifier.prototype.export = function () {
        var blob = new Blob([JSON.stringify(this, null, 4)], { type: 'text/plain' });

        return (window.URL || window.webkitURL).createObjectURL(blob);
    };

    TabModifier.prototype.deleteRules = function () {
        this.setModel({ rules: [] });
    };

    return TabModifier;

}]);
