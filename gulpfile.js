(function() {

    'use strict';

    // Gulp dependencies
    var gulp       = require('gulp'),
        jshint     = require('gulp-jshint'),
        concat     = require('gulp-concat'),
        rename     = require('gulp-rename'),
        uglify     = require('gulp-uglify'),
        jscs       = require('gulp-jscs'),
        minifyHTML = require('gulp-minify-html'),
        qunit      = require('node-qunit-phantomjs');

    // Linter
    // ------------------------------------------------------------------------------------------------------

    gulp.task('lint', function () {
        return gulp
            .src('src/js/**/*.js')
            .pipe(jscs())
            .pipe(jscs.reporter())
            .pipe(jscs.reporter('fail'))
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    // Core
    // ------------------------------------------------------------------------------------------------------

    gulp.task('build_core', ['build_background_script', 'build_content_script']);

    gulp.task('build_background_script', function () {
        return gulp
            .src(['src/js/background.js'])
            .pipe(uglify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('build_content_script', function () {
        return gulp
            .src(['src/js/Tab.js', 'src/js/content.js'])
            .pipe(concat('content.js'))
            .pipe(uglify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/js'));
    });

    // Options
    // ------------------------------------------------------------------------------------------------------

    gulp.task('build_options', ['build_options_script', 'build_options_html']);

    gulp.task('build_options_script', function () {
        return gulp
            .src([
                'src/js/options/app.js',
                'src/js/options/models/tab_modifier.model.js',
                'src/js/options/models/rule.model.js',
                'src/js/options/controllers/tab_rules.controller.js',
                'src/js/options/controllers/settings.controller.js'
            ])
            .pipe(concat('options.js'))
            .pipe(uglify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('build_options_html', function () {
        return gulp
            .src([
                'src/html/options.html',
                'src/html/tab_rules.html',
                'src/html/form.html',
                'src/html/settings.html'
            ])
            .pipe(minifyHTML())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/html'));
    });

    // ------------------------------------------------------------------------------------------------------

    gulp.task('tests', function() {
        return qunit('tests/index.html');
    });

    gulp.task('build', [
        'build_core',
        'build_options',
        'lint'
    ]);

    gulp.task('watch', function() {
        gulp.watch('src/**/*', ['build_core', 'build_options']);
    });

    // Default tasks (called when running `gulp` from cli)
    gulp.task('default', [
        'build_core',
        'build_options',
        'watch'
    ]);

}());
