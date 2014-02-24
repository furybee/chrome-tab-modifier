'use strict';

/**
* Model
*/
var OptionsModel = Stapes.subclass({

    /**
    * Constructor
    */
    constructor: function() {
        this.$current_file = $('#current_file');
        this.$projects_file = $('#projects_file');
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
    * Gets projects
    *
    * @return mixed projects
    */
    getProjects: function() {
        return localStorage.projects;
    },

    /**
    * Sets projects
    *
    * @param string content
    */
    setProjects: function(content) {
        localStorage.projects = content;

        this.showCurrentFile();
    },

    /**
    * Shows current file content
    */
    showCurrentFile: function() {
        /**
        * Getting projects
        */
        var projects = this.getProjects();

        if(projects !== undefined) {
            /**
            * Updating DOM
            */
            this.getAttribute('$current_file').html(JSON.stringify(JSON.parse(projects), undefined, 4));
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

        /**
        * Change event for importing
        */
        this.model.getAttribute('$projects_file').on('change', function() {
            /**
            * Retrieving given file
            */
            var file = this.files[0];

            /**
            * Instanciating FileReader API
            */
            var reader = new FileReader();

            /**
            * Async reader event
            */
            reader.onload = function(e) {
                /**
                * Retrieving file content
                */
                var content = e.target.result;

                if(content) {
                    /**
                    * Is valid JSON?
                    */
                    if(self.model.isValidJSON(content) === true) {
                        /**
                        * Setting projects
                        */
                        self.model.push({
                            item: 'setProjects',
                            content: content
                        });
                    } else {
                        alert('Unvalid JSON file');
                    }
                } else {
                    alert('Content KO');
                }
            };

            /**
            * Reading file as text
            */
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

        /**
        * Showing projects
        */
        this.model.showCurrentFile();

        this.model.on('change', function(id) {
            var obj = self.model.get(id);

            switch(obj.item) {
                case 'setProjects':
                    /**
                    * Setting projects
                    */
                    self.model.setProjects(obj.content);
                break;
            }

        });
    }

});

var options = new OptionsController();
