'use strict';

//
// Dependencies
//

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import del from 'del';
import path from 'path';
import runSequence from 'run-sequence';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config.babel.js';

//
// Configuration
//

const plugins = gulpLoadPlugins();

const config = {
  source: 'source',
  sourceAssets: 'source/assets',
  sourceComponents: 'source/components',
  dev: '.dev',
  devAssets: '.dev/assets',
  dist: 'dist',
  docs: 'docs',
  docsAssets: 'docs/assets',
  docsSite: 'docs/_site',
  docsComponents: 'docs/_components',
  browsers: 'last 2 versions',
  env: {
    production: !!plugins.util.env.production,
    docs: !!plugins.util.env.docs
  }
};

const postcssPlugins = [
  autoprefixer(config.browsers)
];

//
// Tasks
//

// Default
// The default Gulp task is to initialize a server for local development
gulp.task('default', ['serve']);

// Serve
// Initialize a server for local development with browser-sync and watch files
// for changes
gulp.task('serve', ['build'], () => {
  // initialize browser-sync for .dev|docs/
  browserSync.init({
    server: {
      baseDir: config.env.docs ? `${config.docsSite}` : config.dev,
      reloadOnRestart: true,
      open: false
    }
  });

  // watch for file changes and inject|reload
  gulp.watch(`${config.source}/**/*.scss`, ['styles']);
  gulp.watch([`${config.sourceAssets}/scripts/**/*.js`, `${config.sourceComponents}/**/*.js`], ['scripts']);
  gulp.watch(`${config.devAssets}/scripts/*.js`).on('change', browserSync.reload);
  gulp.watch(`${config.sourceComponents}/**/*.html`, ['html', browserSync.reload]);
  if (config.env.docs) {
    gulp.watch([
      `!${config.docsSite}/**/*`,
      `${config.docs}/**/*.{html,markdown,md,yml,json,txt,xml}`,
      `!${config.docs}/_config.yml`,
      `!${config.docs}/_config.prod.yml`,
      `${config.docsComponents}/**/*`,
      `${config.docs}/_data/**/*`,
      `${config.docs}/_includes/**/*`,
      `${config.docs}/_layouts/**/*`,
      `${config.docs}/_plugins/**/*`,
      `${config.docs}/_posts/**/*`,
      `${config.docs}/assets/**/*`
    ], ['jekyll', browserSync.reload]);
  }
});

// Build
// Sequence of tasks to run in order to build the project
gulp.task('build', (callback) => {
  runSequence(
    'clean',
    [
      'scripts',
      'styles'
    ],
    [
      'html'
    ],
    config.env.docs ? ['jekyll'] : 'skip',
    config.env.docs ? ['jekyll:styles'] : 'skip',
    callback
  );
});

// Clean
// Remove generated folders and files
gulp.task('clean', () => {
  return del.sync([
    config.dist,
    config.dev,
    config.docsComponents,
    `${config.docsAssets}/scripts/evolution-ui/`,
    `${config.docsAssets}/styles/evolution-ui/`
  ]);
});

// Scripts
// Use webpack (with babel-loader) to transpile ES6, bundle modules,
// and copy/paste results to the correct location(s)
gulp.task('scripts', ['scripts:lint'], () => {
  return gulp.src(`${config.sourceAssets}/scripts/index.js`)
    .pipe(webpack(webpackConfig))                                  // bundle js modules
    .pipe(plugins.concat('evolution-ui.js'))                       // rename compiled file
    .pipe(gulp.dest(`${config.devAssets}/scripts/`))               // save to dev
    .pipe(gulp.dest(config.dist))                                  // save to dist
    .pipe(plugins.uglify())                                        // minify js
    .pipe(plugins.rename({ suffix: '.min' }))                      // add .min suffix
    .pipe(gulp.dest(`${config.devAssets}/scripts/`))               // save minified file to dev
    .pipe(gulp.dest(`${config.docsAssets}/scripts/evolution-ui/`)) // save minified file to docs
    .pipe(gulp.dest(config.dist));                                 // save minified file to dist
});

// Scripts: Lint
// Lint JS scripts to ensure they follow rules specified in .eslintrc
gulp.task('scripts:lint', () => {
  return gulp.src(`${config.sourceComponents}/**/*.js`)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

// Styles
// Compile Sass and copy/paste results to the correct location(s)
gulp.task('styles', () => {
  return gulp.src(`${config.sourceAssets}/styles/main.scss`)
    .pipe(plugins.sass().on('error', plugins.sass.logError))      // compile sass
    .pipe(plugins.postcss(postcssPlugins))                        // run through postcss processors (autoprefixer)
    .pipe(plugins.rename({ basename: 'evolution-ui' }))           // rename compiled file
    .pipe(gulp.dest(`${config.devAssets}/styles/`))               // save to dev
    .pipe(gulp.dest(config.dist))                                 // save to dist
    .pipe(browserSync.reload({ stream: true }))                   // inject changes into browser
    .pipe(plugins.cssmin())                                       // minify compiled file
    .pipe(plugins.rename({ suffix: '.min' }))                     // add .min suffix
    .pipe(gulp.dest(`${config.devAssets}/styles/`))               // save to dev
    .pipe(gulp.dest(`${config.docsAssets}/styles/evolution-ui/`)) // save minified file to docs
    .pipe(gulp.dest(config.dist))                                 // save minified file to dist
    .pipe(browserSync.reload({ stream: true }));                  // inject changes into browser
});

// HTML
// Sequence of HTML-related tasks
gulp.task('html', (callback) => {
  runSequence(
    'html:copy-to-dev',
    'html:copy-to-docs',
    callback
  );
});

// HTML: Copy to Docs
// Rename and copy/paste raw HTML files to the /docs directory
gulp.task('html:copy-to-docs', () => {
  return gulp.src([`${config.sourceComponents}/**/*.html`])
    .pipe(plugins.changed(config.docsComponents))  // only transform changed files (faster)
    .pipe(plugins.rename( (file) => {              // prepend "directory name + hyphen" to filename
      file.base = '/';
      file.basename = file.dirname + '-' + file.basename;
    }))
    .pipe(plugins.flatten())                       // flatten directory structure of HTML files
    .pipe(gulp.dest(config.docsComponents)); // save to docs
});

// HTML: Copy to Dev
// Wrap raw HTML files in appropriate tags and copy/paste results to the .dev/
// directory so they can be served by browser-sync
gulp.task('html:copy-to-dev', () => {
  // Wrap each HTML partial with root elements and include compiled assets
  // Use minified versions if running "production mode"
  const prefix = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Evolution UI</title><link rel="stylesheet" href="/assets/styles/evolution-ui' + (config.env.production ? '.min' : '') + '.css"></head><body>';
  const suffix = '<script src="/assets/scripts/evolution-ui' + (config.env.production ? '.min' : '') + '.js"></script></body></html>';

  return gulp.src(`${config.sourceComponents}/**/*.html`)
    .pipe(plugins.changed(config.dev))                                    // only transform changed files (faster)
    .pipe(plugins.frontMatter({ property: 'frontMatter', remove: true })) // remove yml front matter
    .pipe(plugins.insert.prepend(prefix))                                 // add prefix to source html file
    .pipe(plugins.insert.append(suffix))                                  // add suffix to source html file
    .pipe(gulp.dest(config.dev));                                         // save to dev
});

// Jekyll
// Build Jekyll files for the /docs website
gulp.task('jekyll', plugins.shell.task([
  `jekyll build --source=${config.docs} --destination=${config.docsSite} --config=${config.docs}/_config.yml${config.env.production ? ',_config.prod.yml' : ''}`
]));

gulp.task('jekyll:styles', () => {
  return gulp.src(`${config.docsSite}/assets/styles/main.css`)
    .pipe(plugins.postcss(postcssPlugins))                // run through postcss processors (autoprefixer)
    .pipe(plugins.cssmin())                               // minify compiled file
    .pipe(plugins.rename({ suffix: '.min' }))             // add .min suffix
    .pipe(gulp.dest(`${config.docsSite}/assets/styles/`)) // save minified file to dist
});

// Skip
// Use this task to skip a conditional task to prevent runSequence errors
gulp.task('skip', () => { return; });

// Deploy
gulp.task('deploy', ['build'], function () {
  return gulp.src(config.docsSite)
    .pipe(plugins.ghPages());
});
