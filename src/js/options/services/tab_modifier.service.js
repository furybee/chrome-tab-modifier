app.service('TabModifierService', ['$http', function ($http) {

    this.getManifestFile = function () {
        return $http.get('/manifest.json');
    };

}]);
