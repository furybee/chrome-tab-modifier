app.controller('TabRulesController', ['$scope', '$mdDialog', '$mdMedia', 'Rule', 'TabModifier', function ($scope, $mdDialog, $mdMedia, Rule, TabModifier) {

    var tab_modifier = new TabModifier();

    // Avoid BC break
    tab_modifier.checkOldSettings();

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
            console.log('save', rule);

            tab_modifier.save(rule, index);
        }, function () {
            console.log('exit');
        });
    };

    $scope.duplicate = function (rule) {
        tab_modifier.save(new Rule(rule));
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
        }, function () {
            console.log('exit');
        });
    };

}]);

app.controller('FormModalController', ['$scope', '$mdDialog', 'rule', function ($scope, $mdDialog, rule) {

    $scope.rule = rule;

    $scope.$watch('rule.name', function () {
        if (rule.name === '' || rule.name === undefined) {
            rule.setModel({ name: null });
        }
    });

    $scope.$watch('rule.url_fragment', function () {
        if (rule.url_fragment === '' || rule.url_fragment === undefined) {
            rule.setModel({ url_fragment: null });
        }
    });

    $scope.$watch('rule.title', function () {
        if (rule.title === '' || rule.title === undefined) {
            rule.setModel({ title: null });
        }
    });

    $scope.$watch('rule.icon', function () {
        if (rule.icon === '' || rule.icon === undefined) {
            rule.setModel({ icon: null });
        }
    });

    $scope.$watch('rule.url_matcher', function () {
        if (rule.url_matcher === '' || rule.url_matcher === undefined) {
            rule.setModel({ url_matcher: null });
        }
    });

    $scope.closeForm = function () {
        $mdDialog.cancel();
    };

    $scope.save = function (rule) {
        $mdDialog.hide(rule);
    };

}]);
