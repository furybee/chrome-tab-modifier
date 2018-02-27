app.controller('SettingsController', ['$scope', '$mdDialog', '$mdToast', '$location', 'TabModifier', 'Analytics', function ($scope, $mdDialog, $mdToast, $location, TabModifier, Analytics) {

    var tab_modifier = new TabModifier();

    chrome.storage.local.get('tab_modifier', function (items) {
        if (items.tab_modifier === undefined) {
            tab_modifier.build(new TabModifier());
        } else {
            tab_modifier.build(items.tab_modifier);
        }

        $scope.tab_modifier = tab_modifier;

        // Generate JSON url
        $scope.json_url = tab_modifier.export();

        $scope.$apply();
    });

    // Import tab rules action
    $scope.showImportDialog = function (evt) {
        $mdDialog.show({
            controller: 'SettingsController',
            templateUrl: '../html/import_dialog.html',
            parent: angular.element(document.body),
            targetEvent: evt,
            clickOutsideToClose: true
        });
    };

    $scope.cancelDialog = function () {
        $mdDialog.cancel();
    };

    // Import tab rules action
    $scope.import = function (content, replaceExistingRules = true) {
        var result = tab_modifier.checkFileBeforeImport(content);

        if (result === true) {
            var inputId = replaceExistingRules ? 'importReplace' : 'importAdd';
            document.getElementById(inputId).value = '';

            tab_modifier.import(content, replaceExistingRules).sync();

            $mdDialog.hide();

            $location.path('/');

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your tab rules have been successfully imported')
                    .position('top right')
            );

            Analytics.trackEvent('tab-rules', 'import-success');
        } else {
            var message;

            switch (result) {
                case 'INVALID_JSON_FORMAT':
                    message = 'Invalid JSON file. Please check it on jsonlint.com.';

                    Analytics.trackEvent('tab-rules', 'import-error-json');
                    break;
                case 'INVALID_SETTINGS':
                    message = 'Invalid settings file. Is this file comes from Tab Modifier?';

                    Analytics.trackEvent('tab-rules', 'import-error-format');
                    break;
            }
            $mdDialog.hide();
            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Failed to import tab rules')
                    .textContent(message)
                    .ariaLabel('Failed to import tab rules')
                    .ok('OK, sorry')
            );
        }
    };

    // Delete all tab rules action
    $scope.deleteRules = function (evt) {
        var confirm = $mdDialog
            .confirm()
            .clickOutsideToClose(false)
            .title('Delete all')
            .textContent('Do you really want to delete all of your tab rules?')
            .ariaLabel('Delete all')
            .targetEvent(evt)
            .ok('Delete all')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            tab_modifier.deleteRules().sync();

            $mdToast.show(
                $mdToast.simple()
                    .textContent('Your tab rules have been successfully deleted')
                    .position('top right')
            );

            Analytics.trackEvent('tab-rules', 'delete-all');
        });
    };

}]);
