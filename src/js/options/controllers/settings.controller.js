app.controller('SettingsController', ['$scope', 'TabModifier', function ($scope, TabModifier) {

    var tab_modifier = new TabModifier();

    // Load saved data
    tab_modifier.getLocalData();

    // Generate JSON url
    $scope.json_url = tab_modifier.export();

    $scope.import = function (content) {
        var result = tab_modifier.import(content);

        if (result === true) {
            document.getElementById('settings').value = '';
        } else {
            switch (tab_modifier.import(content)) {
                case 'INVALID_JSON_FORMAT':
                    alert('Invalid JSON file. Please check it on jsonlint.com.');
                break;
                case 'INVALID_SETTINGS':
                    alert('Invalid settings file. Is this file comes from Tab Modifier?');
                break;
            }
        }
    };

    $scope.deleteRules = function () {
        if (confirm('Are your sure?') === true) {
            tab_modifier.deleteRules();

            tab_modifier.setLocalData();
        }
    };

}]);
