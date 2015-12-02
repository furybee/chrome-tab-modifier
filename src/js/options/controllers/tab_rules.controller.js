app.controller('TabRulesController', ['$scope', '$mdDialog', '$mdMedia', 'Rule', 'TabModifier', function ($scope, $mdDialog, $mdMedia, Rule, TabModifier) {

    var tab_modifier = new TabModifier();

    // Avoid BC break
    if (tab_modifier.checkOldSettings() === true) {
        tab_modifier.setLocalData();
    }

    // Load saved data
    tab_modifier.getLocalData();

    $scope.tab_modifier = tab_modifier;

    $scope.showForm = function (evt, rule) {
        var index = (rule === undefined) ? null : tab_modifier.rules.indexOf(rule);

        $mdDialog.show({
            controller: 'FormModalController',
            templateUrl: '../html/form.min.html',
            targetEvent: evt,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('md'),
            resolve: {
                rule: function () {
                    return (index === null) ? new Rule() : rule;
                }
            }
        }).then(function (rule) {
            tab_modifier.save(rule, index);

            tab_modifier.setLocalData();
        });
    };

    $scope.duplicate = function (rule) {
        tab_modifier.save(new Rule(rule));

        tab_modifier.setLocalData();
    };

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

            tab_modifier.setLocalData();
        });
    };

}]);

app.controller('FormModalController', ['$scope', '$mdDialog', 'rule', function ($scope, $mdDialog, rule) {

    $scope.rule = rule;

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
        if (rule.tab.icon === '' || rule.tab.icon === undefined) {
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
