'use strict';

var gulp = require('gulp'),
    Filter = require('gulp-filter'),
    bower = require('gulp-bower'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    svgmin = require('gulp-svgmin'),
    notify = require('gulp-notify'),
    rimraf = require('gulp-rimraf'),
    mocha = require('gulp-mocha');

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest('assets/scripts/vendor'));
});

gulp.task('clean', function() {
    return gulp.src('dist/**/*.{js,css}', { read: false })
        .pipe(rimraf());
});

gulp.task('styles', function() {
    return gulp.src('assets/styles/**/*.{css,scss,sass}')
        .pipe(compass({
            style: 'expanded',
            css: 'dist/styles',
            sass: 'assets/styles'
        }))
        .pipe(autoprefixer())
        .pipe(minifycss())
        .pipe(gulp.dest('dist/styles'))

        .pipe(notify({message: 'Styles task complete' }));
});

gulp.task('scripts', ['mocha'], function() {
    var filter = new Filter([
        '*',
        '!assets/scripts/models',
        '!assets/scripts/lib',
        '!assets/scripts/vendor',
    ]);

    return gulp.src([
        'assets/scripts/**/*.js',
        '!assets/scripts/vendor/**',
    ])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))

    .pipe(filter)
    .pipe(browserify())
    .pipe(uglify())

    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('images', function() {
    var imageFilter = new Filter('**/*.{png,jpg,jpeg}'),
        svgFilter = new Filter('**/*.svg');

    return gulp.src('assets/images/**/*.{png,jpg,jpeg,svg}')
        .pipe(imageFilter)
        .pipe(
            imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            }))
        .pipe(imageFilter.restore())

        .pipe(svgFilter)
        .pipe(svgmin())
        .pipe(svgFilter.restore())

        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
    var filter = new Filter('**/*.svg');

    return gulp.src('assets/fonts/**/*.{eot,ttf,woff,svg}')
        .pipe(filter)
        .pipe(svgmin())
        .pipe(filter.restore())

        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('watch', ['client'], function() {
    var lr = require('gulp-livereload')();

    // Styles
    gulp.watch('assets/styles/**/*.{css,scss,sass}', ['styles']);

    // Scripts
    gulp.watch('assets/scripts/**/*.js', ['scripts']);

    // Images
    gulp.watch('assets/images/**', ['images']);

    // Fonts
    gulp.watch('assets/fonts/**', ['fonts']);

    // Live Reload
    gulp.watch([
        '**/*.html',
        'dist/**',
    ], function(file) {
        lr.changed(file.path);
    });
});



gulp.task('mocha', function() {
    gulp.src('test/**/*.js')
        .pipe(mocha({ reporter: 'list' }));
});

gulp.task('lint', function() {
    return gulp.src([
            'gulpfile.js',
            'test/**/*.js'
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
});

gulp.task('client', ['lint', 'bower', 'clean'], function() {
    gulp.start('styles', 'scripts', 'images', 'fonts');
});



gulp.task('test', ['lint', 'mocha']);

// Build what we got
gulp.task('default', ['watch']);
