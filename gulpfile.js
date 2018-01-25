var gulp = require('gulp');
var pug = require('gulp-pug');
var stylus = require('gulp-stylus');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var del = require('del');
var concat = require('gulp-concat');
var svgSprite = require('gulp-svg-sprite');
var gcmq = require('gulp-group-css-media-queries');
var processors = [
    autoprefixer({
        browsers: ['last 10 version']
    })
];


// Basic configuration example
var config = {
    shape: {
        dimension: { // Set maximum dimensions
            maxWidth: 40,
            maxHeight: 40
        },
        spacing: { // Add padding
            padding: 5
        }
        // dest: 'build/assets/svg/intermediate-svg' // Keep the intermediate files
    },
    mode: {
        // view: { // Activate the «view» mode
        //     bust: false,
        //     render: {
        //         styl: true // Activate Sass output (with default options)
        //     }
        // },
        symbol: true // Activate the «symbol» mode
    }
};



gulp.task('sprites', function () {
    return gulp.src('src/assets/svg/*.svg')
        .pipe(svgSprite(config))
        .pipe(gulp.dest('build/assets/svg'));
});


const ignorePug = [
    '!src/layouts/**',
    '!src/blocks/**',
    '!src/globals/**'
];

gulp.task('html', function () {
    return gulp.src(['src/**/*.pug', ...ignorePug])
        .pipe(pug())
        .pipe(gulp.dest('build'))
});


gulp.task('js', function () {
    return gulp.src('src/assets/**/*.js')
        .pipe(concat('main.js'))
        .pipe(gulp.dest('build/assets'));
});

gulp.task('css', function () {
    return gulp.src('src/assets/*.styl')
        .pipe(stylus().on('error', function (errorInfo) {
            console.log(errorInfo.toString());
            this.emit('end');
        }))
        .pipe(postcss(processors))
        .pipe(gcmq())
        .pipe(gulp.dest('build/assets'))
        .pipe(browserSync.stream())
});

gulp.task('vendor:css', function () {
    return gulp.src('src/vendor/css/*.css')
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('build/assets'));
});

gulp.task('vendor:js', function () {
    return gulp.src('src/vendor/js/*.js')
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('build/assets'));
});

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
});

var reload = function (done) {
    browserSync.reload();
    done();
}

gulp.task('watch', function () {
    gulp.watch('src/**/*.pug', gulp.series('html', reload));
    gulp.watch('src/**/*.styl', gulp.series('css'));
    gulp.watch('src/**/*.js', gulp.series('js', reload));
});

gulp.task('copy', function () {
    return gulp.src([
            'src/assets/**/*.{jpg,png,jpeg,gif}'
        ])
        .pipe(gulp.dest('build/assets'))
});

gulp.task('clean', function () {
    return del('build');
});

gulp.task('build', gulp.parallel('html', 'css', 'js', 'sprites', 'copy', 'vendor:css', 'vendor:js'));
gulp.task('start', gulp.parallel('watch', 'serve'));

gulp.task('default', gulp.series('clean', 'build', 'start'));