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
            templateUrl: '../html/form.min.html',
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
            templateUrl: '../html/toast_new_version.min.html',
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
