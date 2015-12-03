app.controller('MainController', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {

    $scope.toggleAside = toggleAside;

    function toggleAside() {
        $mdSidenav('aside-left').toggle();
    }
}]);
