var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');

gulp.task('html', function() {
  return gulp.src('src/templates/img-gallery.html')
    .pipe(gulp.dest('demo/assets/templates'));
})

gulp.task('js', function() {
  return browserify({ entries: 'demo/src/js/demo.js' })
    .transform(babelify, { presets: ['modern-browsers'] })
    .bundle()
    .pipe(source('demo.js'))
    .pipe(buffer())
    .pipe(gulp.dest('demo/assets/js'));
});

gulp.task('vendorCSS', function() {
  return gulp.src('node_modules/highlight.js/styles/github.css')
    .pipe(rename('syntax.css'))
    .pipe(gulp.dest('demo/assets/styles'));
});

gulp.task('vendorJS', function() {
  return gulp.src([
      'node_modules/web-components/webcomponents-*.js',
      'demo/src/js/highlight.pack.js'
    ])
    .pipe(gulp.dest('demo/assets/js'));
});

gulp.task('sass', function() {
  return gulp.src('demo/src/styles/demo.scss')
    .pipe(sass())
    .pipe(gulp.dest('demo/assets/styles'));
});

gulp.task('default', [ 'html', 'js', 'vendorCSS', 'vendorJS', 'sass' ]);
