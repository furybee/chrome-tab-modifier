app.controller('MainController', ['$scope', '$mdSidenav', '$q', 'Analytics', 'TabModifierService', 'GitHubService', function ($scope, $mdSidenav, $q, Analytics, TabModifierService, GitHubService) {

    $scope.toggleSideNav = function () {
        $mdSidenav('aside-left').toggle();

        Analytics.trackEvent('sidenav', 'toggle');
    };

    $scope.closeSideNav = function () {
        if ($mdSidenav('aside-left').isOpen() === true) {
            $mdSidenav('aside-left').close();

            Analytics.trackEvent('sidenav', 'close');
        }
    };

    // $q.all([TabModifierService.getManifestFile(), GitHubService.getLatestRelease()]).then(function (request) {
    //     $scope.version = {
    //         current: request[0].data.version,
    //         latest: request[1].data.tag_name
    //     };
    // });

}]);
