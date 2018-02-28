app.factory('TabModifier', ['Rule', function (Rule) {
    
    var TabModifier = function (properties) {
        this.settings = {
            enable_new_version_notification: false
        };
        this.rules    = [];
        
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

    TabModifier.prototype.build = function (data, replace_existing_rules) {
        replace_existing_rules = typeof replace_existing_rules !== 'undefined' ? replace_existing_rules : true;
        var self = this;
        
        if (data.settings !== undefined) {
            this.settings = data.settings;
        }

        if (replace_existing_rules === true) {
            this.deleteRules();
        }

        angular.forEach(data.rules, function (rule) {
            self.addRule(new Rule(rule));
        });
    };
    
    TabModifier.prototype.sync = function () {
        chrome.storage.local.set({ tab_modifier: this });
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

    TabModifier.prototype.import = function (json, replace_existing_rules) {
        replace_existing_rules = typeof replace_existing_rules !== 'undefined' ? replace_existing_rules : true;

        this.build(JSON.parse(json), replace_existing_rules);
        
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
