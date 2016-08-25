'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');

var del = require('del');

var runSequence = require('run-sequence');

var browserSync = require('browser-sync').create();

const sassPath = "./src/scss/**/*.scss";
const jsPath = "./src/js/**/*.js";

gulp.task('clean:dist', function() {
  del.sync('dist');
});

gulp.task('sass', function() {
  gulp.src(sassPath)
    .pipe(sass())
    .pipe(gulp.dest('./src/css'))
    .pipe(browserSync.reload({
      stream: true,
    }));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: '.'
    },
  })
});

gulp.task('useref', function(){
  gulp.src('./index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Watch Setting
gulp.task('watch', ['browserSync', 'sass'], function() {
  gulp.watch(sassPath, ['sass']); 
  gulp.watch('./*.html', browserSync.reload);
  gulp.watch(jsPath, browserSync.reload);
});

// Build Setting
gulp.task('build', function(callback) {
  runSequence(
    'clean:dist', 
    ['sass', 'useref'],
    callback
  );
});

// Default Setting
gulp.task('default', ['sass', 'browserSync', 'watch']);
