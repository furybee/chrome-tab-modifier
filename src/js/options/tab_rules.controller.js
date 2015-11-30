app.controller('TabRulesController', ['$scope', '$mdDialog', '$mdMedia', function ($scope, $mdDialog, $mdMedia) {

    console.log('TabRulesController');

    $scope.items = [];

    var i;

    for (i = 0; i < 50; i++) {
        $scope.items.push({
            name: 'Tab\'s name ' + i,
            url_fragment: 'name-' + i + '.com'
        });
    }

    $scope.showForm = function (ev) {
        $mdDialog.show({
            controller: 'FormModalController',
            templateUrl: '../html/form.min.html',
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: $mdMedia('md')
        });
    };

    $scope.confirmDeleteRule = function (ev) {
        var confirmDeleteRule = $mdDialog
            .confirm()
            .clickOutsideToClose(false)
            .title('Delete rule')
            .textContent('Do you really want to delete this rule?')
            .ariaLabel('Delete rule')
            .targetEvent(ev)
            .ok('Delete')
            .cancel('Cancel');

        $mdDialog.show(confirmDeleteRule);
    };

}]);

app.controller('FormModalController', ['$scope', '$mdDialog', function ($scope, $mdDialog) {

    $scope.closeForm = function () {
        $mdDialog.cancel();
    };

    $scope.confirmDeleteRule = function (ev) {
        var confirmDeleteRule = $mdDialog
            .confirm()
            .clickOutsideToClose(false)
            .title('Delete rule')
            .textContent('Do you really want to delete this rule?')
            .ariaLabel('Delete rule')
            .targetEvent(ev)
            .ok('Delete')
            .cancel('Cancel');

        $mdDialog.show(confirmDeleteRule);
    };

}]);
