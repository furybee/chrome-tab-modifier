// Karma configuration
// Generated on Mon Sep 07 2015 14:03:02 GMT+0200 (CEST)

module.exports = function(config) {

    var configuration = {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jasmine-jquery',
            'jasmine',
            'jasmine-matchers'
        ],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/angular/angular.js',
            'node_modules/angular-animate/angular-animate.js',
            'node_modules/angular-aria/angular-aria.js',
            'node_modules/angular-material/angular-material.js',
            'node_modules/angular-google-analytics/dist/angular-google-analytics.js',
            'node_modules/angular-route/angular-route.js',
            'node_modules/angular-ui-tree/dist/angular-ui-tree.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'dist/js/options.js',
            'tests/**/*.js',
            {
                pattern: 'tests/**/*.json',
                included: false
            }
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/js/options/**/*.js': ['coverage']
        },

        coverageReporter: {
            type: 'text',
            dir: 'coverage/'
        },

        // tests results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],
        //specReporter: { maxLogLines: 5 },

        // web server port
        port: 8080,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // you can define custom flags
        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS',
                options: {
                    windowName: 'my-window',
                    settings: {
                        webSecurityEnabled: false
                    }
                },
                flags: ['--load-images=true'],
                debug: true
            }
        },

        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
            exitOnResourceError: true
        }
    };

    config.set(configuration);
};
