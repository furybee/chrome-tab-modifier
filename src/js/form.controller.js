(function () {
    'use strict';

    angular
        .module('TabModifier')
        .controller('FormController', [
            '$scope',
            '$mdDialog',
            FormController
        ]);

    /**
     * Form controller
     *
     * @param $scope
     * @param $mdDialog
     * @constructor
     */
    function FormController ($scope, $mdDialog) {

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
    }
})();
