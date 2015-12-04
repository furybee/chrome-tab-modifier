var app = angular.module('TabModifier', ['ngRoute', 'ngAnimate', 'ngAria', 'ngMaterial', 'angular-google-analytics']);

app.config(['$routeProvider', '$compileProvider', '$mdIconProvider', '$mdThemingProvider', 'AnalyticsProvider', function ($routeProvider, $compileProvider, $mdIconProvider, $mdThemingProvider, AnalyticsProvider) {

    // Allow "chrome-extension" protocol
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(blob|http|https|chrome-extension):/);

    // Load icons list by name
    $mdIconProvider
        .icon('menu', '/icons/menu.svg')
        .icon('backup-restore', '/icons/backup-restore.svg')
        .icon('information-outline', '/icons/information-outline.svg')
        .icon('alert', '/icons/alert.svg')
        .icon('file-import', '/icons/file-import.svg')
        .icon('file-export', '/icons/file-export.svg')
        .icon('file-outline', '/icons/file-outline.svg')
        .icon('options-vertical', '/icons/dots-vertical.svg')
        .icon('close', '/icons/close.svg')
        .icon('plus', '/icons/plus.svg')
        .icon('image', '/icons/image.svg')
        .icon('save', '/icons/content-save.svg')
        .icon('tab', '/icons/checkbox-multiple-marked-outline.svg')
        .icon('list', '/icons/format-list-bulleted.svg')
        .icon('tab', '/icons/tab.svg')
        .icon('list-plus', '/icons/playlist-plus.svg')
        .icon('clear', '/icons/eraser.svg')
        .icon('settings', '/icons/settings.svg')
        .icon('duplicate', '/icons/content-copy.svg')
        .icon('delete', '/icons/delete.svg')
        .icon('edit', '/icons/pencil.svg')
        .icon('google-chrome', '/icons/google-chrome.svg')
        .icon('github-circle', '/icons/github-circle.svg')
        .icon('help', '/icons/help-circle.svg');

    // Configure default theme
    $mdThemingProvider
        .theme('default')
        .primaryPalette('blue-grey', {
            default: '500'
        })
        .accentPalette('pink', {
            default: '400'
        })
        .warnPalette('red', {
            default: '500'
        });

    // Analytics config
    AnalyticsProvider.setAccount('UA-27524593-7');
    AnalyticsProvider.setHybridMobileSupport(true);
    AnalyticsProvider.setDomainName('none');

    var routes = {
        '/': {
            templateUrl: '/html/tab_rules.min.html',
            controller: 'TabRulesController'
        },
        '/settings': {
            templateUrl: '/html/settings.min.html',
            controller: 'SettingsController'
        },
        '/help': {
            templateUrl: '/html/help.min.html',
            controller: 'HelpController'
        }
    };

    for (var path in routes) {
        if (routes.hasOwnProperty(path)) {
            $routeProvider.when(path, routes[path]);
        }
    }

}]);

app.run(['$rootScope', '$location', 'Analytics', function ($rootScope, $location, Analytics) {
    $rootScope.location = $location;
}]);
