(function () {
    'use strict';

    angular
        .module('TabModifier', ['ngMaterial'])
        .config([
            '$mdIconProvider',
            ConfigureModule
        ]);

    /**
     * Configure le module
     *
     * @param $mdIconProvider
     * @constructor
     */
    function ConfigureModule ($mdIconProvider) {

        // Load icons list by name
        $mdIconProvider
            .icon('duplicate', 'icons/content-copy.svg')
            .icon('delete', 'icons/delete.svg')
            .icon('edit', 'icons/pencil.svg')
            .icon('google-chrome', 'icons/google-chrome.svg')
            .icon('github-circle', 'icons/github-circle.svg');
    }
})();
