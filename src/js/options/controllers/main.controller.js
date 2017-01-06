app.controller('MainController', ['$scope', '$mdSidenav', '$q', 'Analytics', function ($scope, $mdSidenav, $q, Analytics) {
    
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
    
}]);
