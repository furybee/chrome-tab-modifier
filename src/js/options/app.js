var app = angular.module('TabModifier', ['ngRoute', 'ngAnimate', 'ngMaterial']);

app.config(['$routeProvider', '$compileProvider', '$mdIconProvider', '$mdThemingProvider', function ($routeProvider, $compileProvider, $mdIconProvider, $mdThemingProvider) {

    // Allow "chrome-extension" protocol
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(blob|http|https|chrome-extension):/);

    // Load icons list by name
    $mdIconProvider
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

app.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.location = $location;
}]);

app.directive('onReadFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function (onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function (onLoadEvent) {
                    scope.$apply(function () {
                        fn(scope, {
                            $fileContent: onLoadEvent.target.result
                        });
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
}]);

app.directive('inputFileButton', function() {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            var button = elem.find('button');
            var input = elem.find('input');

            input.css({ display:'none' });

            button.bind('click', function() {
                input[0].click();
            });
        }
    };
});
