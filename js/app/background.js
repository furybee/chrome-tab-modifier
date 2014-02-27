/**
* Tabs listener
*/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    /**
    * Waiting for complete load
    */
    if(changeInfo.status === 'complete') {

        /**
        * Getting the settings
        */
        var settings = localStorage.settings;

        /**
        * settings are set
        */
        if(settings !== undefined) {

            /**
            * Converting string to object
            */
            settings = JSON.parse(settings);

            /**
            * Working variables
            */
            var new_title   = null;
            var pinned      = null;
            var found       = false;

            /**
            * Looping settings
            */
            for (var string_to_match in settings) {
                /**
                * Verifying that the current URL matches the string
                */
                if(tab.url.indexOf(string_to_match) !== -1 && found === false) {
                    /**
                    * Getting the new title
                    */
                    if(settings[string_to_match].title !== undefined) {
                        new_title = settings[string_to_match].title;
                    }

                    /**
                    * Pinned property is set?
                    */
                    if(settings[string_to_match].pinned !== undefined) {
                        pinned = settings[string_to_match].pinned;
                    }

                    found = true;
                }
            }

            /**
            * A new title has been set
            */
            if(found === true) {

                /**
                * Want a new title?
                */
                if(new_title !== null) {
                    var title_tag = '{title}';

                    /**
                    * Replacing {title} tag
                    */
                    if(new_title.indexOf(title_tag) !== -1) {
                        new_title = new_title.replace(title_tag, tab.title);
                    }

                    /**
                    * Updating the document title
                    */
                    chrome.tabs.executeScript(tabId, {
                        code: 'document.title = "'+ new_title + '";'
                    });
                }

                /**
                * Want to pin?
                */
                if(tab.pinned === false && pinned === true) {
                    /**
                    * Updating the pinned state
                    */
                    chrome.tabs.update(tabId, {
                        pinned: true
                    });
                }

            }
        }
    }
});
