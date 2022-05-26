"use strict";

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  del = require('del'),
  // svgstore = require('gulp-svgstore'),
  // svgmin = require('gulp-svgmin'),
  uglify = require('gulp-uglify'),
  cleanCSS = require('gulp-clean-css'),
  rename = require("gulp-rename"),
  merge = require('merge-stream'),
  htmlreplace = require('gulp-html-replace'),
  autoprefixer = require('gulp-autoprefixer'),
  // path = require('path'),
//  imageminJpegRecompress = require('imagemin-jpeg-recompress'),
 // imagemin = require('gulp-imagemin'),
  browserSync = require('browser-sync').create();

// Clean task
gulp.task('clean', function () {
  return del(['dist', 'assets/css/app.css']);
});

// Copy third party libraries from node_modules into /vendor
// gulp.task('vendor:js', function () {
//   return gulp.src([
//     './node_modules/bootstrap/dist/js/*',
//     './node_modules/@popperjs/core/dist/umd/popper.*'
//   ])
//     .pipe(gulp.dest('./assets/js/vendor'));
// });

// Copy bootstrap-icons from node_modules into /fonts
// gulp.task('vendor:fonts', function () {
//   return gulp.src([
//     './node_modules/bootstrap-icons/**/*',
//     '!./node_modules/bootstrap-icons/package.json',
//     '!./node_modules/bootstrap-icons/README.md',
//   ])
//     .pipe(gulp.dest('./assets/fonts/bootstrap-icons'))
// });

// vendor task
// gulp.task('vendor', gulp.parallel('vendor:fonts', 'vendor:js'));

// Copy vendor's js to /dist
gulp.task('vendor', function () {
 
  var fontStream = gulp.src(['./assets/fonts/**/*.*']).pipe(gulp.dest('./dist/assets/fonts'));
  return merge(jsStream, fontStream);
})

// Compile SCSS(SASS) files
gulp.task('scss', function compileScss() {
  return gulp.src(['./assets/scss/*.scss'])
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./assets/css'))
});

// Minify CSS
gulp.task('css:minify', gulp.series('scss', function cssMinify() {
  return gulp.src("./assets/css/*.css")
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
}));

// Minify Js
gulp.task('js:minify', function () {
  return gulp.src([
    './assets/js/app.js'
  ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(browserSync.stream());
});

// Optimize SVG files
// gulp.task('buildSVGs', function () {
//   return gulp.src('./assets/svg/*.svg')
//     .pipe(svgmin(function getOptions(file) {
//       var prefix = path.basename(file.relative, path.extname(file.relative));
//       return {
//         plugins: [{
//           cleanupIDs: {
//             prefix: prefix + '-',
//             minify: true
//           }
//         }]
//       }
//     }))
//     .pipe(svgstore())
//     .pipe(gulp.dest('./dist/assets/svg'))
//     .pipe(browserSync.stream());
// });


gulp.task('images:minify', function () {
  return gulp.src('./assets/img/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imageminJpegRecompress({ progressive: true, method: 'smallfry', quality: 'low' }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(gulp.dest('./dist/assets/img'))
});

// Replace HTML block for Js and Css file to min version upon build and copy to /dist
gulp.task('replaceHtmlBlock', function () {
  return gulp.src(['*.html'])
    .pipe(htmlreplace({
      'js': 'assets/js/app.min.js',
      'css': 'assets/css/app.min.css'
    }))
    .pipe(gulp.dest('dist/'));
});

// Configure the browserSync task and watch file path for change
gulp.task('dev', function browserDev(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  gulp.watch(['assets/scss/*.scss', 'assets/vendor/BS5/scss/**'], gulp.series('css:minify', function cssBrowserReload(done) {
    browserSync.reload();
    done(); //Async callback for completion.
  }));
  gulp.watch('assets/js/app.js', gulp.series('js:minify', function jsBrowserReload(done) {
    browserSync.reload();
    done();
  }));
  gulp.watch(['*.html']).on('change', browserSync.reload);
  done();
});

// Build task
gulp.task("build", gulp.series(gulp.parallel('css:minify', 'images:minify', 'js:minify', 'vendor'), function copyAssets() {
  return gulp.src([
    '*.html',
    "assets/img/**"
  ], { base: './' })
    .pipe(gulp.dest('dist'));
}));

// Default task
gulp.task("default", gulp.series("clean", 'build', 'replaceHtmlBlock'));
