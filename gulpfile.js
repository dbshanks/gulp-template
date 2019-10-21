const {
  src,
  dest,
  watch,
  series,
  parallel
} = require('gulp');
const babel = require('gulp-babel');
const autoprefixer = require('autoprefixer');
const rename = require("gulp-rename");
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const responsivefont = require('postcss-responsive-font');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

const files = {
  scssPath: 'app/scss/**/*.scss',
  jsPath: 'app/js/**/*.js'
}

function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(postcss([responsivefont(), autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

function jsTask() {
  return src(files.jsPath)
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(uglify())
    .pipe(dest('dist/js'));
}

const cbString = new Date().getTime();

function cacheBustTask() {
  return src(['index.html'])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('.'));
}


function watchTask() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  watch([files.scssPath, files.jsPath],
    parallel(scssTask, jsTask));
  watch('./**/*.html').on('change', browserSync.reload);
  watch(files.jsPath).on('change', browserSync.reload);
}

exports.default = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  watchTask
);