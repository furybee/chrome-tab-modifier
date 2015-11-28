(function () {
    'use strict';

    angular
        .module('TabModifier')
        .controller('BaseController', [
            '$scope',
            '$mdSidenav',
            '$mdDialog',
            '$mdMedia',
            BaseController
        ]);

    /**
     * Base controller
     *
     * @param $scope
     * @param $mdSidenav
     * @param $mdDialog
     * @param $mdMedia
     * @constructor
     */
    function BaseController ($scope, $mdSidenav, $mdDialog, $mdMedia) {
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
                controller: 'FormController',
                templateUrl: '../html/form.tmpl.min.html',
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
    }
})();
