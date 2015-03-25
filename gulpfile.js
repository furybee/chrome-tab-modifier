(function() {

    'use strict';

    // Gulp dependencies
    var gulp      = require('gulp'),
        concat    = require('gulp-concat'),
        rename    = require('gulp-rename'),
        uglify    = require('gulp-uglify'),
        jscs      = require('gulp-jscs'),
        minifyCSS = require('gulp-minify-css'),
        qunit     = require('node-qunit-phantomjs');

    gulp.task('lint', function () {
        return gulp
            .src('src/js/**/*.js')
            .pipe(jscs())
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    gulp.task('build_background_script', function () {
        return gulp
            .src(['src/js/background.js'])
            .pipe(concat('background.js'))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('build_content_script', function () {
        return gulp
            .src(['src/js/Tab.js', 'src/js/content.js'])
            .pipe(concat('content.js'))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('build_options_script', function () {
        return gulp
            .src(['src/js/options.js'])
            .pipe(concat('options.js'))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('tests', function() {
        return qunit('tests/index.html');
    });

    gulp.task('build', [
        'build_background_script',
        'build_content_script',
        'build_options_script'
    ]);

    // Default tasks (called when running `gulp` from cli)
    gulp.task('default', [
        ''
    ]);

}());
