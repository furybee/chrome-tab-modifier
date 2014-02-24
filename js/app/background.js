/**
* Tabs listener
*/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    /**
    * Waiting for complete load
    */
    if(changeInfo.status === 'complete') {

        /**
        * Getting the projects
        */
        var projects = localStorage.projects;

        /**
        * Projects are set
        */
        if(projects !== undefined) {

            /**
            * Converting string to object
            */
            projects = JSON.parse(projects);

            var prefix = null;

            /**
            * Looping projects
            */
            for (var i in projects) {
                /**
                * Looping environments
                */
                for (var j in projects[i]) {
                    console.log(projects[i][j].url);

                    /**
                    * Verifying that the current URL matches an environment URL
                    */
                    if(tab.url.indexOf(projects[i][j].url) != -1) {
                        /**
                        * Getting the prefix
                        */
                        prefix = projects[i][j].prefix;
                    }
                }
            }

            /**
            * A prefix has been set
            */
            if(prefix !== null) {
                /**
                * Updating the document title
                */
                chrome.tabs.executeScript(tabId, {
                    code: 'document.title = "'+ prefix +' ' + tab.title + '";'
                });
            }
        }
    }
});
