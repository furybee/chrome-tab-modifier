app.controller('MainController', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {

    $scope.toggleSideNav = function () {
        $mdSidenav('aside-left').toggle();
    };

    $scope.closeSideNav = function () {
        $mdSidenav('aside-left').close();
    };

}]);
