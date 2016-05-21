app.service('GitHubService', ['$http', function ($http) {

    this.getLatestRelease = function () {
        return $http.get('https://api.github.com/repos/sylouuu/chrome-tab-modifier/releases/latest');
    };

}]);
