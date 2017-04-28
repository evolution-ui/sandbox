//
// Dependencies
//

var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var changed = require('gulp-changed');
var childProcess = require('child_process');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var del = require('del');
var eslint = require('gulp-eslint');
var flatten = require('gulp-flatten');
var frontMatter = require('gulp-front-matter');
var ghPages = require('gulp-gh-pages');
var imagemin = require('gulp-imagemin');
var insert = require('gulp-insert');
var path = require('path');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');

//
// Configuration
//

// Base Paths
var paths = {
  source: 'source/',
  sourceAssets: 'source/assets/',
  sourceComponents: 'source/components/',
  dev: '.dev/',
  devAssets: '.dev/assets/',
  dist: 'dist/',
  docs: 'docs/',
  docsComponents: 'docs/_components/'
};

// Supported Browsers
var browsers = 'last 2 versions';

//
// Tasks
//

// Clean
gulp.task('clean', function () {
  return del.sync([paths.dist, paths.dev, paths.docsComponents]);
});

// Styles
gulp.task('styles', function () {
  // define postcss plugins
  var postcssPlugins = [
    autoprefixer(browsers)
  ];

  return gulp.src(paths.sourceAssets + 'styles/index.scss')
    .pipe(sass().on('error', sass.logError))       // compile sass
    .pipe(postcss(postcssPlugins))                 // run through postcss processors (autoprefixer)
    .pipe(rename({ basename: 'evolution-ui' }))    // rename compiled file
    .pipe(gulp.dest(paths.dev + 'assets/styles/')) // save to dev
    .pipe(gulp.dest(paths.dist))                   // save to dist
    .pipe(browserSync.reload({ stream: true }))    // inject changes into browser
    .pipe(cssmin())                                // minify compiled file
    .pipe(rename({ suffix: '.min' }))              // insert .min suffix
    .pipe(gulp.dest(paths.dist))                   // save minified file to dist
    .pipe(browserSync.reload({ stream: true }));   // inject changes into browser
});

// Scripts: Lint
gulp.task('scripts:lint', function () {
  return gulp.src(paths.sourceComponents + '/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Scripts: Transpile
gulp.task('scripts', ['scripts:lint'], function () {
  return gulp.src(paths.sourceAssets + 'scripts/index.js')
    .pipe(webpack(webpackConfig))
    .pipe(concat('evolution-ui.js'))
    .pipe(gulp.dest(paths.dev + 'assets/scripts/'))
    .pipe(gulp.dest(paths.dist))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist));
});

// HTML: Copy source HTML files to docs
gulp.task('html:copy-to-docs', function () {
  return gulp.src([paths.sourceComponents + '**/*.html'])
    .pipe(changed(paths.docsComponents))
    .pipe(rename(function (path) {
      path.base = '/';
      path.basename = path.dirname + '-' + path.basename;
    }))
    .pipe(flatten())
    .pipe(gulp.dest(paths.docsComponents));
});

// HTML: Copy source HTML files to dev
gulp.task('html:copy-to-dev', ['html:copy-to-docs'], function () {
  return gulp.src(paths.sourceComponents + '**/*.html')
    .pipe(changed(paths.dev))
    .pipe(gulp.dest(paths.dev));
});

// HTML: Build dev files for each component from source HTML files
gulp.task('html', ['html:copy-to-dev'], function () {
  var prefix = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Evolution UI</title><link rel="stylesheet" href="/assets/styles/evolution-ui.css"></head><body>';
  var suffix = '<script src="/assets/scripts/evolution-ui.js"></script></body></html>';

  return gulp.src(paths.sourceComponents + '**/*.html')
    .pipe(frontMatter({ property: 'frontMatter', remove: true })) // remove yml front matter
    .pipe(insert.prepend(prefix))                                 // add prefix to source html file
    .pipe(insert.append(suffix))                                  // add suffix to source html file
    .pipe(gulp.dest(paths.dev));                                  // save to dev
});

// Build
gulp.task('build', function (callback) {
  runSequence(
    'clean',
    [
      'styles',
      'scripts',
      'html'
    ],
    callback
  );
});

// Serve
gulp.task('serve', ['build'], function () {
  // initialize browser-sync
  browserSync.init({
    server: {
      baseDir: [paths.dev],
      reloadOnRestart: true,
      open: false
    }
  });

  // watch for file changes and inject|reload
  gulp.watch(paths.source + '**/*.scss', ['styles']);
  gulp.watch([paths.sourceAssets + 'scripts/**/*.js', paths.sourceComponents + '**/*.js'], ['scripts']);
  gulp.watch(paths.devAssets + 'scripts/*.js').on('change', browserSync.reload);
  gulp.watch(paths.sourceComponents + '**/*.html', ['html', browserSync.reload]);
});

// Default
gulp.task('default', ['serve']);
