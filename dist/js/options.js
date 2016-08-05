var app = angular.module('TabModifier', ['ngRoute', 'ngAnimate', 'ngAria', 'ngMaterial', 'angular-google-analytics']);

app.config(['$routeProvider', '$compileProvider', '$mdIconProvider', '$mdThemingProvider', 'AnalyticsProvider', function ($routeProvider, $compileProvider, $mdIconProvider, $mdThemingProvider, AnalyticsProvider) {

    // Allow "chrome-extension" protocol
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|chrome-extension|file|blob):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension|file|blob):|data:image\//);

    // Load icons list by name
    $mdIconProvider
        .icon('menu', '/icons/menu.svg')
        .icon('backup-restore', '/icons/backup-restore.svg')
        .icon('information-outline', '/icons/information-outline.svg')
        .icon('alert', '/icons/alert.svg')
        .icon('file-import', '/icons/file-import.svg')
        .icon('file-export', '/icons/file-export.svg')
        .icon('file-outline', '/icons/file-outline.svg')
        .icon('options-vertical', '/icons/dots-vertical.svg')
        .icon('close', '/icons/close.svg')
        .icon('plus', '/icons/plus.svg')
        .icon('image', '/icons/image.svg')
        .icon('save', '/icons/content-save.svg')
        .icon('tab', '/icons/checkbox-multiple-marked-outline.svg')
        .icon('list', '/icons/format-list-bulleted.svg')
        .icon('tab', '/icons/tab.svg')
        .icon('list-plus', '/icons/playlist-plus.svg')
        .icon('clear', '/icons/eraser.svg')
        .icon('settings', '/icons/settings.svg')
        .icon('content-duplicate', '/icons/content-duplicate.svg')
        .icon('delete', '/icons/delete.svg')
        .icon('edit', '/icons/pencil.svg')
        .icon('google-chrome', '/icons/google-chrome.svg')
        .icon('github-circle', '/icons/github-circle.svg')
        .icon('help', '/icons/help-circle.svg')
        .icon('credit-card', '/icons/credit-card.svg')
        .icon('bell-ring-outline', '/icons/bell-ring-outline.svg');

    // Configure default theme
    $mdThemingProvider
        .theme('default')
        .primaryPalette('blue', {
            default: '600'
        })
        .accentPalette('yellow', {
            default: '700'
        })
        .warnPalette('red', {
            default: 'A700'
        });

    // Analytics config
    AnalyticsProvider.setAccount('UA-27524593-7');
    AnalyticsProvider.setHybridMobileSupport(true);
    AnalyticsProvider.setDomainName('none');

    var routes = {
        '/settings': {
            templateUrl: '/html/settings.html',
            controller: 'SettingsController'
        },
        '/help': {
            templateUrl: '/html/help.html',
            controller: 'HelpController'
        },
        '/:event?/:version?': {
            templateUrl: '/html/tab_rules.html',
            controller: 'TabRulesController'
        }
    };

    for (var path in routes) {
        if (routes.hasOwnProperty(path)) {
            $routeProvider.when(path, routes[path]);
        }
    }

}]);

app.run(['$rootScope', '$location', 'Analytics', function ($rootScope, $location, Analytics) {

    $rootScope.location = $location;

}]);

app.directive('inputFileButton', function () {
    return {
        restrict: 'E',
        link: function (scope, elem) {
            var button = elem.find('button'),
                input  = elem.find('input');

            input.css({ display: 'none' });

            button.bind('click', function () {
                input[0].click();
            });
        }
    };
});

app.directive('onReadFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function (onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function (onLoadEvent) {
                    scope.$apply(function () {
                        fn(scope, {
                            $fileContent: onLoadEvent.target.result
                        });
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
}]);

app.factory('Rule', function () {

    var Rule = function (properties) {
        this.name         = null;
        this.url_fragment = null;
        this.tab          = {
            title: null,
            icon: null,
            pinned: false,
            protected: false,
            unique: false,
            muted: false,
            url_matcher: null
        };

        angular.extend(this, properties);
    };

    Rule.prototype.setModel = function (obj) {
        angular.extend(this, obj);
    };

    return Rule;

});

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

    TabModifier.prototype.build = function (data) {
        var self = this;

        if (data.settings !== undefined) {
            this.settings = data.settings;
        }

        this.deleteRules();

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

app.controller('HelpController', function () {

});

app.controller('MainController', ['$scope', '$mdSidenav', '$q', 'Analytics', function ($scope, $mdSidenav, $q, Analytics) {

    $scope.toggleSideNav = function () {
        $mdSidenav('aside-left').toggle();

        Analytics.trackEvent('sidenav', 'toggle');
    };

    $scope.closeSideNav = function () {
        if ($mdSidenav('aside-left').isOpen() === true) {
            $mdSidenav('aside-left').close();

            Analytics.trackEvent('sidenav', 'close');
        }
    };

}]);

app.controller('SettingsController', ['$scope', '$mdDialog', '$mdToast', '$location', 'TabModifier', 'Analytics', function ($scope, $mdDialog, $mdToast, $location, TabModifier, Analytics) {

    var tab_modifier = new TabModifier();

    chrome.storage.local.get('tab_modifier', function (items) {
        if (items.tab_modifier === undefined) {
            tab_modifier.build(new TabModifier());
        } else {
            tab_modifier.build(items.tab_modifier);
        }

        $scope.tab_modifier = tab_modifier;

        // Generate JSON url
        $scope.json_url = tab_modifier.export();

        $scope.$apply();
    });

    // Import tab rules action
    $scope.import = function (content) {
        var result = tab_modifier.checkFileBeforeImport(content);

        if (result === true) {
            document.getElementById('settings').value = '';

            tab_modifier.import(content).sync();

            $location.path('/');

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your tab rules have been successfully imported')
                    .position('top right')
            );

            Analytics.trackEvent('tab-rules', 'import-success');
        } else {
            var message;

            switch (result) {
                case 'INVALID_JSON_FORMAT':
                    message = 'Invalid JSON file. Please check it on jsonlint.com.';

                    Analytics.trackEvent('tab-rules', 'import-error-json');
                    break;
                case 'INVALID_SETTINGS':
                    message = 'Invalid settings file. Is this file comes from Tab Modifier?';

                    Analytics.trackEvent('tab-rules', 'import-error-format');
                    break;
            }

            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Failed to import tab rules')
                    .textContent(message)
                    .ariaLabel('Failed to import tab rules')
                    .ok('OK, sorry')
            );
        }
    };

    // Delete all tab rules action
    $scope.deleteRules = function (evt) {
        var confirm = $mdDialog
            .confirm()
            .clickOutsideToClose(false)
            .title('Delete all')
            .textContent('Do you really want to delete all of your tab rules?')
            .ariaLabel('Delete all')
            .targetEvent(evt)
            .ok('Delete all')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            tab_modifier.deleteRules().sync();

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your tab rules have been successfully deleted')
                    .position('top right')
            );

            Analytics.trackEvent('tab-rules', 'delete-all');
        });
    };

}]);

app.controller('TabRulesController', ['$scope', '$routeParams', '$http', '$mdDialog', '$mdMedia', '$mdToast', 'Rule', 'TabModifier', 'Analytics', function ($scope, $routeParams, $http, $mdDialog, $mdMedia, $mdToast, Rule, TabModifier, Analytics) {

    var tab_modifier = new TabModifier(), icon_list = [];

    // Load icon list
    $http.get('/js/icons.min.json').then(function (request) {
        icon_list = request.data;
    });

    // Avoid BC break
    chrome.storage.sync.get('tab_modifier', function (items) {
        if (items.tab_modifier !== undefined && items.tab_modifier !== null) {
            tab_modifier.build(items.tab_modifier);
            tab_modifier.sync();
        }

        chrome.storage.sync.clear();
    });

    chrome.storage.local.get('tab_modifier', function (items) {
        if (items.tab_modifier !== undefined) {
            tab_modifier.build(items.tab_modifier);
        }

        $scope.tab_modifier = tab_modifier;

        $scope.$apply();
    });

    // Show modal form
    $scope.showForm = function (evt, rule) {
        var index = (rule === undefined) ? null : tab_modifier.rules.indexOf(rule);

        $mdDialog.show({
            controller: 'FormModalController',
            templateUrl: '../html/form.html',
            targetEvent: evt,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs'),
            resolve: {
                icon_list: function () {
                    return icon_list;
                },
                rule: function () {
                    return (index === null) ? new Rule() : rule;
                }
            }
        }).then(function (rule) {
            // Save a rule
            tab_modifier.save(rule, index);

            tab_modifier.sync();

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your rule has been successfully saved')
                    .position('top right')
            );
        }, function () {
            Analytics.trackEvent('tab-rules', 'close-form');
        });
    };

    // Duplicate a rule
    $scope.duplicate = function (rule) {
        tab_modifier.save(new Rule(angular.copy(rule)));

        tab_modifier.sync();

        $mdToast.show(
            $mdToast.simple()
                .textContent('Your rule has been successfully duplicated')
                .position('top right')
        );
    };

    // Delete a rule
    $scope.delete = function (evt, rule) {
        var confirm = $mdDialog
            .confirm()
            .clickOutsideToClose(false)
            .title('Delete rule')
            .textContent('Do you really want to delete this rule?')
            .ariaLabel('Delete rule')
            .targetEvent(evt)
            .ok('Delete')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            tab_modifier.removeRule(rule);

            tab_modifier.sync();

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your rule has been successfully deleted')
                    .position('top right')
            );
        });
    };

    // --------------------------------------------------------------------------------------------------------
    // Events

    // New install
    if ($routeParams.event === 'install') {
        var confirm = $mdDialog
            .confirm()
            .clickOutsideToClose(true)
            .title('Greetings')
            .textContent('Hello, thank you for installing Tab Modifier, start by creating your first rule!')
            .ariaLabel('Greetings')
            .targetEvent()
            .ok('Create my first rule')
            .cancel('Close');

        $mdDialog.show(confirm).then(function () {
            Analytics.trackEvent('greetings-dialog', 'close');

            $scope.showForm();
        }, function () {
            Analytics.trackEvent('greetings-dialog', 'show-form');
        });
    }

    // New version
    if ($routeParams.event === 'update' && $routeParams.version !== undefined) {
        $mdToast.show({
            hideDelay: 0,
            position: 'top right',
            controller: 'ToastNewVersionController',
            templateUrl: '../html/toast_new_version.html',
            locals: {
                version: $routeParams.version
            }
        });
    }

}]);

app.controller('ToastNewVersionController', ['$scope', '$location', '$mdToast', 'version', function ($scope, $location, $mdToast, version) {
    $scope.version = version;

    $scope.closeToast = function () {
        $mdToast.hide().then(function () {
            $location.path('/');
        });
    };

    $scope.openGitHubReleases = function () {
        chrome.tabs.create({ url: 'https://github.com/sylouuu/chrome-tab-modifier/releases' });

        $scope.closeToast();
    };
}]);

app.controller('FormModalController', ['$scope', '$mdDialog', 'rule', 'icon_list', function ($scope, $mdDialog, rule, icon_list) {

    $scope.rule      = rule;
    $scope.icon_list = icon_list;

    $scope.$watch('rule.url_fragment', function () {
        if (rule.url_fragment === '' || rule.url_fragment === undefined) {
            rule.setModel({ url_fragment: null });
        }
    });

    $scope.$watch('rule.tab.title', function () {
        if (rule.tab.title === '' || rule.tab.title === undefined) {
            rule.tab.title = null;
        }
    });

    $scope.$watch('rule.tab.icon', function () {
        if (rule.tab.icon === '' || rule.tab.title === undefined) {
            rule.tab.icon = null;
        }
    });

    $scope.$watch('rule.tab.url_matcher', function () {
        if (rule.tab.url_matcher === '' || rule.tab.url_matcher === undefined) {
            rule.tab.url_matcher = null;
        }
    });

    $scope.closeForm = function () {
        $mdDialog.cancel();
    };

    $scope.save = function (rule) {
        $mdDialog.hide(rule);
    };

}]);
