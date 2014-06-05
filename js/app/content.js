(function($) {

    'use strict';

    /**
    * Main Tab Modifier object
    *
    * @param object options
    */
    $.tabModifier = function(options) {

        // Options
        var settings = JSON.parse(options.settings);
        var tabId    = options.tabId;

        // Page
        var page = {
            url:    location.href,
            title:  document.title
        };

        // Main object
        var app = {

            init: function() {
                var found = false;

                // Looping settings
                for(var string_to_match in settings) {
                    // Verifying that the current URL matches the string
                    if(page.url.indexOf(string_to_match) !== -1 && found === false) {
                        // Is title property set?
                        if(settings[string_to_match].title !== undefined) {
                            app.title(settings[string_to_match].title);
                        }

                        // Is icon property set?
                        if(settings[string_to_match].icon !== undefined) {
                            app.icon(settings[string_to_match].icon);
                        }

                        // Is pinned property set?
                        if(settings[string_to_match].pinned !== undefined) {
                            app.pinned(settings[string_to_match].pinned);
                        }

                        found = true;
                    }
                }
            },

            /**
            * Title management
            *
            * @param string title
            */
            title: function(title) {
                // Title tag
                var title_tag = '{title}';

                // Replacing title tag
                if(title.indexOf(title_tag) !== -1) {
                    title = title.replace(title_tag, page.title);
                }

                // Updating the document title
                document.title = title;
            },

            /**
            * Icon management
            *
            * @param string icon
            */
            icon: function(icon) {
                // Removing existing icon(s)
                $('head link[rel*="icon"]').remove();

                // Default icon if needed
                if(icon === '{default}') {
                    icon = chrome.extension.getURL('/img/default_favicon.png');
                }

                // Adding new icon
                $('<link>', {
                    'type': 'image/x-icon',
                    'rel':  'icon',
                    'href': icon
                }).appendTo('head');
            },

            /**
            * Pinned state management
            *
            * @param bool pinned
            */
            pinned: function(pinned) {
                // Want to pin?
                if(pinned === true) {
                    // Updating the pinned state
                    chrome.runtime.sendMessage({
                        method: 'setPinned',
                        tabId: tabId
                    });
                }
            }

        };

        // Do the job
        app.init();
    };
}(jQuery));

/**
* Chrome message pusher
*/
chrome.runtime.sendMessage({
    method: 'getSettings'
}, function(response) {
    var settings = response.data;

    if(settings !== undefined) {
        $.tabModifier(settings);
    }
});
