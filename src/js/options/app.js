var app = angular.module('TabModifier', ['ngRoute', 'ngAnimate', 'ngAria', 'ngMaterial', 'angular-google-analytics', 'ui.tree']);

app.config(['$routeProvider', '$compileProvider', '$mdIconProvider', '$mdThemingProvider', 'AnalyticsProvider', function ($routeProvider, $compileProvider, $mdIconProvider, $mdThemingProvider, AnalyticsProvider) {
    
    // Allow "chrome-extension" protocol
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|chrome-extension|file|blob):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension|file|blob):|data:image\//);
    
    // Load icons list by name
    $mdIconProvider
        .icon('menu', '/icons/menu.svg')
        .icon('backup-restore', '/icons/backup-restore.svg')
        .icon('information-outline', '/icons/information-outline.svg')
        .icon('alert', '/icons/alert.svg')
        .icon('file-add', '/icons/file-add.svg')
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
        .icon('content-duplicate', '/icons/content-duplicate.svg')
        .icon('delete', '/icons/delete.svg')
        .icon('edit', '/icons/pencil.svg')
        .icon('google-chrome', '/icons/google-chrome.svg')
        .icon('github-circle', '/icons/github-circle.svg')
        .icon('help', '/icons/help-circle.svg')
        .icon('credit-card', '/icons/credit-card.svg')
        .icon('swap-vertical', '/icons/swap-vertical.svg')
        .icon('bell-ring-outline', '/icons/bell-ring-outline.svg');
    
    // Configure default theme
    $mdThemingProvider
        .theme('default')
        .primaryPalette('blue', {
            default: '600'
        })
        .accentPalette('yellow', {
            default: '700'
        })
        .warnPalette('red', {
            default: 'A700'
        });
    
    // Analytics config
    AnalyticsProvider.setAccount('UA-27524593-7');
    AnalyticsProvider.setHybridMobileSupport(true);
    AnalyticsProvider.setDomainName('none');
    
    var routes = {
        '/settings': {
            templateUrl: '/html/settings.html',
            controller: 'SettingsController'
        },
        '/help': {
            templateUrl: '/html/help.html',
            controller: 'HelpController'
        },
        '/:event?/:version?': {
            templateUrl: '/html/tab_rules.html',
            controller: 'TabRulesController'
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
