const {
  src,
  dest,
  watch,
  parallel,
  series
} = require('gulp');

const scss = require('gulp-sass'),
  concat = require('gulp-concat'),
  browserSync = require('browser-sync').create(),
  uglify = require('gulp-uglify-es').default, // !
  autoprefixer = require('gulp-autoprefixer'),
  sourcemaps = require('gulp-sourcemaps'),
  svgSprite = require('gulp-svg-sprite'),
  clean = require('gulp-clean'),
  ttfToWoff2 = require('gulp-ttf2woff2'),
  tinypng = require('gulp-tinypng-compress');

const styles = () => {
  return src([
      'node_modules/normalize.css/normalize.css',
      'node_modules/swiper/swiper-bundle.css',
      'app/scss/**/*.scss'
    ])
    .pipe(sourcemaps.init())
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 30 versions'],
      cascade: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src([
      'node_modules/swiper/swiper-bundle.js',
      'node_modules/smoothscroll-polyfill/dist/smoothscroll.js',
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
};

const fonts = () => {
  return src('app/assets/fonts/**/*')
    .pipe(ttfToWoff2())
    .pipe(dest('app/fonts'));
};

const images = () => {
  return src('app/assets/images/content/*')
    .pipe(dest('app/images'));
};

const svg = () => {
  return src('app/assets/images/sprite/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('app/images'));
};

const watching = () => {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/*.html']).on('change', browserSync.reload);
  watch(['app/images/**/*']).on('change', browserSync.reload);
  watch(['app/assets/fonts/**/*'], fonts);
  watch(['app/assets/images/content/*'], images);
  watch(['app/assets/images/sprite/*'], svg);
};

const browserReload = () => {
  browserSync.init({
    server: {
      baseDir: "app/"
    }
  });
};

const cleanApp = () => {
  return src([
      'app/images/**/*',
      'app/css/**/*',
    ], {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
};

exports.styles = styles;
exports.scripts = scripts;
exports.fonts = fonts;
exports.images = images;
exports.svgSprite = svgSprite;

exports.watching = watching;
exports.browserReload = browserReload;

exports.default = series(cleanApp, parallel(styles, scripts, fonts, images, svg), parallel(browserReload, watching));


const stylesBuild = () => {
  return src([
      'node_modules/normalize.css/normalize.css',
      'app/scss/**/*.scss'
    ])
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 30 versions'],
      cascade: true
    }))
    .pipe(dest('dist/css'));
};

const scriptsBuild = () => {
  return src([
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'));
};

const fontsBuild = () => {
  return src('app/fonts/**/*')
    .pipe(dest('./dist/fonts'));
};

const svgBuild = () => {
  return src('app/images/**/*.svg')
    .pipe(dest('./dist/images'));
};

const imageCompress = () => {
  return src(['app/images/**/*', '!app/images/**/*.svg'])
    .pipe(tinypng({
      key: 'lw8R4jJrTQNTBBH0DQnL8Hg89FYWY9d4',
      sigFile: 'images/.tinypng-sigs',
      parallelMax: 50,
      log: true
    }))
    .pipe(dest('./dist/images'));
};

const cleanDist = () => {
  return src('./dist', {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
};


exports.stylesBuild = stylesBuild;
exports.scriptsBuild = scriptsBuild;
exports.fontsBuild = fontsBuild;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, parallel(stylesBuild, scriptsBuild, fontsBuild, svgBuild, imageCompress));