(function () {
    'use strict';

    angular
        .module('TabModifier', ['ngMaterial'])
        .config([
            '$mdIconProvider',
            '$mdThemingProvider',
            ConfigureModule
        ]);

    /**
     * Configure le module
     *
     * @param $mdIconProvider
     * @constructor
     */
    function ConfigureModule ($mdIconProvider, $mdThemingProvider) {

        // Load icons list by name
        $mdIconProvider
            .icon('save', 'icons/content-save.svg')
            .icon('tab', 'icons/checkbox-multiple-marked-outline.svg')
            .icon('list', 'icons/format-list-bulleted.svg')
            .icon('tab', 'icons/tab.svg')
            .icon('list-plus', 'icons/playlist-plus.svg')
            .icon('clear', 'icons/eraser.svg')
            .icon('settings', 'icons/settings.svg')
            .icon('duplicate', 'icons/content-copy.svg')
            .icon('delete', 'icons/delete.svg')
            .icon('edit', 'icons/pencil.svg')
            .icon('google-chrome', 'icons/google-chrome.svg')
            .icon('github-circle', 'icons/github-circle.svg');

        // Configure default theme
        $mdThemingProvider
            .theme('default')
            .primaryPalette('teal', {
                'default': '700'
            })
            .accentPalette('blue', {
                'default': '700'
            })
            .warnPalette('red', {
                'default': '700'
            });
    }
})();
