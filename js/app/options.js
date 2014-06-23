(function($) {

    'use strict';

    /**
    * Model
    */
    var OptionsModel = Stapes.subclass({

        /**
        * Constructor
        */
        constructor: function() {
            this.$current_file  = $('#current_file');
            this.$settings_file = $('#settings_file');
        },

        /**
        * Gets an attribute
        *
        * @param string attr
        *
        * @return mixed value
        */
        getAttribute: function(attr) {
            return this[attr];
        },

        /**
        * Sets an attribute
        *
        * @param string attr
        * @param mixed value
        */
        setAttribute: function(attr, value) {
            this[attr] = value;
        },

        /**
        * Checks if the string is a valid JSON
        *
        * @param string str
        *
        * @return bool
        */
        isValidJSON: function(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }

            return true;
        },

        /**
        * Gets settings
        *
        * @return string settings
        */
        getSettings: function() {
            return localStorage.settings;
        },

        /**
        * Sets settings
        *
        * @param string content
        */
        setSettings: function(content) {
            localStorage.settings = content;

            this.showCurrentFile();
        },

        /**
        * Shows current file content
        */
        showCurrentFile: function() {
            // Getting settings
            var settings = this.getSettings();

            if(settings !== undefined) {
                // Updating DOM
                this.getAttribute('$current_file').html(JSON.stringify(JSON.parse(settings), undefined, 4));
            }
        }

    });

    /**
    * View
    */
    var OptionsView = Stapes.subclass({

        /**
        * Constructor
        */
        constructor: function(model) {
            var self    = this;
            this.model  = model;

            // Change event for importing
            this.model.getAttribute('$settings_file').on('change', function() {
                // Retrieving given file
                var file = this.files[0];

                // Instanciating FileReader API
                var reader = new FileReader();

                // Async reader event
                reader.onload = function(e) {
                    // Retrieving file content
                    var content = e.target.result;

                    if(content) {
                        // Is valid JSON?
                        if(self.model.isValidJSON(content) === true) {
                            // Set settings
                            self.model.push({
                                item: 'setSettings',
                                content: content
                            });
                        } else {
                            alert('Invalid JSON file. Please check it on jsonlint.com.');
                        }
                    } else {
                        alert('An error has occurred. Please check your file.');
                    }
                };

                // Reading file as text
                reader.readAsText(file);
            });
        }

    });

    /**
    * Controller
    */
    var OptionsController = Stapes.subclass({

        /**
        * Constructor
        */
        constructor: function() {
            var self    = this;
            this.model  = new OptionsModel();
            this.view   = new OptionsView(this.model);

            // Showing settings
            this.model.showCurrentFile();

            this.model.on('change', function(id) {
                var obj = self.model.get(id);

                switch(obj.item) {
                    case 'setSettings':
                        // Set settings
                        self.model.setSettings(obj.content);
                    break;
                }

            });
        }

    });

    var options = new OptionsController();

}(jQuery));
