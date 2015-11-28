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
    }
})();
