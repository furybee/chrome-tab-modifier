app.controller('MainController', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {

    $scope.toggleAside = function () {
        $mdSidenav('aside-left').toggle();
    };

}]);
