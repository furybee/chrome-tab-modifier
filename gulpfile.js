(function() {

    'use strict';

    // Gulp dependencies
    var gulp      = require('gulp'),
        concat    = require('gulp-concat'),
        rename    = require('gulp-rename'),
        minifyCSS = require('gulp-minify-css'),
        qunit     = require('node-qunit-phantomjs');


    gulp.task('concat', function () {
        return gulp
            .src(['src/js/Tab.js', 'src/js/content.js'])
            .pipe(concat('content.js'))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('test', function() {
        return qunit('test/index.html');
    });

    // Default tasks (called when running `gulp` from cli)
    gulp.task('default', [
        'less_modules',
        'watch'
    ]);

}());
