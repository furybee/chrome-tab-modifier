(function () {

    'use strict';

    // Gulp dependencies
    var args       = require('yargs').argv,
        gulp       = require('gulp'),
        jshint     = require('gulp-jshint'),
        concat     = require('gulp-concat'),
        rename     = require('gulp-rename'),
        jscs       = require('gulp-jscs'),
        jsonminify = require('gulp-jsonminify'),
        Server     = require('karma').Server;

    // Linter
    // ------------------------------------------------------------------------------------------------------

    gulp.task('lint', function () {
        return gulp
            .src(['src/js/**/*.js', '!src/js/libs/*.js'])
            .pipe(jscs())
            .pipe(jscs.reporter())
            .pipe(jscs.reporter('fail'))
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    // Core
    // ------------------------------------------------------------------------------------------------------

    gulp.task('build_core', ['build_background_and_content_scripts']);

    gulp.task('build_background_and_content_scripts', function () {
        return gulp
            .src(['src/js/background.js', 'src/js/content.js'])
            .pipe(gulp.dest('dist/js'));
    });

    // Options
    // ------------------------------------------------------------------------------------------------------

    gulp.task('build_options', ['build_options_styles', 'build_options_libs', 'build_options_script', 'build_options_html', 'build_options_icons']);

    gulp.task('build_options_styles', function () {
        return gulp
            .src(['src/css/libs/**/*.css', 'src/css/options.css'])
            .pipe(concat('options.css'))
            .pipe(gulp.dest('dist/css'));
    });

    gulp.task('build_options_libs', function () {
        return gulp
            .src(['src/js/libs/**/*.js'])
            .pipe(concat('libs.js'))
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/js/libs'));
    });

    gulp.task('build_options_script', function () {
        return gulp
            .src(['src/js/options/**/*.js'])
            .pipe(concat('options.js'))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('build_options_icons', function () {
        return gulp
            .src(['src/js/options/icons.json'])
            .pipe(jsonminify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/js'));
    });

    gulp.task('build_options_html', function () {
        return gulp
            .src(['src/html/**/*.html'])
            .pipe(gulp.dest('dist/html'));
    });

    // ------------------------------------------------------------------------------------------------------

    // gulp tests --coverage=html
    gulp.task('tests', function (done) {
        var reporters         = ['spec'],
            coverage_reporter = { type: 'text', dir: 'coverage/' };

        if (args.coverage) {
            reporters.push('coverage');

            if (typeof args.coverage === 'string') {
                coverage_reporter.type = args.coverage;
            }
        }

        new Server({
            configFile: __dirname + '/karma.conf.js',
            reporters: reporters,
            coverageReporter: coverage_reporter
        }, done).start();
    });

    gulp.task('build', [
        'build_core',
        'build_options',
        'lint'
    ]);

    gulp.task('watch', function () {
        gulp.watch('src/**/*', ['build_core', 'build_options']);
    });

    // Default tasks (called when running `gulp` from cli)
    gulp.task('default', [
        'build_core',
        'build_options',
        'watch'
    ]);

}());
