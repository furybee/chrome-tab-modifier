app.controller('MainController', ['$scope', '$mdSidenav', 'Analytics', function($scope, $mdSidenav, Analytics) {

    $scope.toggleSideNav = function () {
        $mdSidenav('aside-left').toggle();

        Analytics.trackEvent('sidenav', 'toggle');
    };

    $scope.closeSideNav = function () {
        $mdSidenav('aside-left').close();

        Analytics.trackEvent('sidenav', 'close');
    };

}]);
