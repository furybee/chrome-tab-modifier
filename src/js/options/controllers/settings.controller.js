app.controller('SettingsController', ['$scope', 'TabModifier', function ($scope, TabModifier) {

    var tab_modifier = new TabModifier();

    // Load saved data
    tab_modifier.getLocalData();

    // Generate JSON url
    $scope.json_url = tab_modifier.export();

    $scope.import = function () {

    };

}]);
