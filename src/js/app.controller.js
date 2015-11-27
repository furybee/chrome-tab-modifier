(function () {
    'use strict';

    angular
        .module('TabModifier')
        .controller('BaseController', [
            '$scope',
            '$mdSidenav',
            '$mdDialog',
            BaseController
        ]);

    /**
     * Base controller
     *
     * @param $scope
     * @param $mdSidenav
     * @param $mdDialog
     * @constructor
     */
    function BaseController ($scope, $mdSidenav, $mdDialog) {
        $scope.items = [];

        var i;

        for (i = 0; i < 50; i++) {
            $scope.items.push({
                title: 'Rule\'s title ' + i,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            });
        }

        $scope.showForm = function (ev) {
            $mdDialog.show({
              templateUrl: '../html/form.tmpl.min.html',
              targetEvent: ev,
              clickOutsideToClose: true
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
    }
})();
