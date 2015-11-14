(function () {
    'use strict';

    angular
        .module('TabModifier')
        .controller('BaseController', [
            '$mdSidenav',
            '$scope',
            BaseController
        ]);

    /**
     * Base controller
     *
     * @param $mdSidenav
     * @param $scope
     * @constructor
     */
    function BaseController ($mdSidenav, $scope) {
        $scope.items = [];

        var i;

        for (i = 0; i < 20; i++) {
            $scope.items.push({
                title: 'Rule\'s title ' + i,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            });
        }
    }
})();
