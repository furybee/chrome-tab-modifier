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

        this.deleteRules();

        angular.forEach(data.rules, function (rule) {
            self.addRule(new Rule(rule));
        });
    };

    TabModifier.prototype.sync = function () {
        chrome.storage.sync.set({ tab_modifier: this });
    };

    TabModifier.prototype.checkFileBeforeImport = function (json) {
        if (json !== undefined) {
            try {
                var settings = JSON.parse(json);

                if ('rules' in settings === false) {
                    return 'INVALID_SETTINGS';
                }
            } catch (e) {
                return 'INVALID_JSON_FORMAT';
            }

            return true;
        } else {
            return false;
        }
    };

    TabModifier.prototype.import = function (json) {
        this.build(JSON.parse(json));

        return this;
    };

    TabModifier.prototype.export = function () {
        var blob = new Blob([JSON.stringify(this, null, 4)], { type: 'text/plain' });

        return (window.URL || window.webkitURL).createObjectURL(blob);
    };

    TabModifier.prototype.deleteRules = function () {
        this.setModel({ rules: [] });

        return this;
    };

    return TabModifier;

}]);
