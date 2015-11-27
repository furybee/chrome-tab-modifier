(function() {

    'use strict';

    // Gulp dependencies
    var gulp       = require('gulp'),
        jshint     = require('gulp-jshint'),
        concat     = require('gulp-concat'),
        rename     = require('gulp-rename'),
        uglify     = require('gulp-uglify'),
        jscs       = require('gulp-jscs'),
        less       = require('gulp-less'),
        minifyCSS  = require('gulp-minify-css'),
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

    gulp.task('build_app_script', function () {
        return gulp
            .src([
                'src/js/app.module.js',
                'src/js/app.controller.js'
            ])
            .pipe(concat('app.js'))
            .pipe(uglify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/js'));
    });

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

    gulp.task('build_options_script', function () {
        return gulp
            .src(['src/js/options.js'])
            .pipe(uglify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('build_options_html', function () {
        return gulp
            .src(['src/html/options.html', 'src/html/form.tmpl.html'])
            .pipe(minifyHTML())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/html'));
    });

    gulp.task('build_options_less', function () {
        return gulp
            .src(['src/less/options.less'])
            .pipe(less())
            .pipe(minifyCSS())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/css'));
    });

    // ------------------------------------------------------------------------------------------------------

    gulp.task('tests', function() {
        return qunit('tests/index.html');
    });

    gulp.task('build', [
        'build_app_script',
        'build_background_script',
        'build_content_script',
        'build_options_script',
        'build_options_html',
        'build_options_less',
        'lint'
    ]);

    gulp.task('watch', function() {
        gulp.watch('src/**/*', ['build']);
    });

    // Default tasks (called when running `gulp` from cli)
    gulp.task('default', [
        'build',
        'watch'
    ]);

}());
