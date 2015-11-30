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
                    return rule;
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

    $scope.confirmDeleteRule = function (evt, rule) {
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

    $scope.closeForm = function () {
        $mdDialog.cancel();
    };

    $scope.save = function (rule) {
        $mdDialog.hide(rule);
    };

}]);
