'use strict';


// Требуемые плагины
var gulp        = require('gulp'),
    pug         = require('gulp-pug'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    plumber     = require('gulp-plumber'),
    gulpif      = require('gulp-if'),
    emitty      = require('emitty').setup('src', 'pug'),
    notify      = require('gulp-notify'), // Уведомления об ошибках
    babel       = require('gulp-babel'),
    rename      = require("gulp-rename"),
    fileinclude = require('gulp-file-include'),
    sass        = require('gulp-sass'),
    prefixer    = require('gulp-autoprefixer'),
    sourcemaps  = require('gulp-sourcemaps'),
    cleanCSS    = require('gulp-clean-css'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    svgstore    = require('gulp-svgstore'),
    rimraf      = require('rimraf'),
    args        = require('yargs').argv,
    header      = require('gulp-header'),
    gutil        = require('gulp-util'),
    webpack     = require("webpack"),
    webpackConfig = require('./webpack.config');


// Создание переменных для путей
var path = {

    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        style: 'build/resources/css/',
        js: 'build/resources/js/',
        img: 'build/resources/img/',
        fonts: 'build/resources/fonts/',
        temp: 'build/temp/',
        favicons: 'build'

    },

    src: { //Пути откуда брать исходники
        html: 'src/pages/*/*.pug',
        style: ['src/globals/style/*.scss','src/pages/**/*.scss','!src/globals/style/_tools.scss'],
        style_libs: 'src/globals/style/*.css',
        js_libs: 'src/globals/js/libs_global.js',
        fonts: 'src/globals/fonts/**/*.*',
        img: 'src/globals/img/**/*.*',
        sprite_svg: ['src/globals/img/sprite/*.svg', 'src/components/*/img/*.svg'],
        temp: 'src/temp/**/*.*',
        favicons: 'src/globals/favicons/*.*'

    },

    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: ['src/pages/**/*.pug', 'src/components/*/*.pug', ],
        style: ['src/globals/style/*.scss','src/pages/**/*.scss','src/components/*/*.scss'],
        style_libs: 'src/globals/style/*.css',
        js_libs: 'src/globals/js/libs_global.js',
        fonts: 'src/globals/fonts/**/*.*',
        img: 'src/globals/img/**/*.*',
        sprite_svg: ['src/globals/img/sprite/*.svg', 'src/components/*/img/*.svg'],
        temp: 'src/temp/**/*.*',
        favicons: 'src/globals/favicons/*.*'
    },
    clean: './build'
};

var cssToolsPath = '../../globals/style/_tools';

// Задачи для HTML
gulp.task('html:build', function () {
    return gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(gulpif(global.watch, emitty.stream(global.emittyChangedFile)))
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") })) //ловим ошибки
        .pipe(pug({pretty: true})) //параметр отключает минификацию
        .pipe(plumber.stop())
        .pipe(rename(function (path) {
            path.basename = path.dirname;
            path.dirname = '';
            console.log('Pug files compiled: /' + path.basename + path.extname);
        }))
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

// Задачи для стилей
gulp.task('style:build', function () {
    return gulp.src(path.src.style) //Выберем наш style.scss
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") }))
        .pipe(header(`@import "${cssToolsPath}";`)) // Добавляем ссылку на переменные и миксины в каждый файл
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(sass({outputStyle: !!args.prod ? 'compressed' : 'nested'})) //Скомпилируем sass параметр - минификация
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(rename(function (path) {
            if (path.dirname != '.'){
                path.basename = path.dirname;
                path.dirname = '';
            }
        }))
        .pipe(gulp.dest(path.build.style)) //И в build
        .pipe(browserSync.stream({match: '**/*.css'}));
});

//Таск либ
gulp.task('style_libs:build', function () {
    return gulp.src(path.src.style_libs) 
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") }))
        .pipe(fileinclude())
        .pipe(cleanCSS()) //минификация по дефолту
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.style)) //И в build
        .pipe(browserSync.stream({match: '**/*.css'}));
});


// Задачи для скриптов
gulp.task('js_libs:build', function () {
    return gulp.src(path.src.js_libs) //собираем файлик с библиотеками и плагинами
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error %>") })) //ловим ошибки
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(fileinclude()) //склеим файлы
        .pipe(babel({
            presets: ['es2015']
        })) //прогоним через babel
        .pipe(sourcemaps.write('.')) //Пропишем карты
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

//Таск шрифтов
gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});

gulp.task('temp:build', function () {
    return gulp.src(path.src.temp)
        .pipe(gulp.dest(path.build.temp))
        .pipe(reload({stream: true}));
});

gulp.task('favicons:build', function () {
    return gulp.src(path.src.favicons)
        .pipe(rename(function (path) {
            if (path.extname == '.ico'){
                path.dirname = '';
            }
            else {
                path.dirname = 'resources/img/favicons';
            }
        }))
        .pipe(gulp.dest(path.build.favicons))
        .pipe(reload({stream: true}));
});


// Задачи для картинок
gulp.task('image:build', function () {
    return gulp.src(path.src.img) //Выберем наши картинки
        .pipe(gulpif(!!args.prod, imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});


// сборка спрайта svg
gulp.task('sprite_svg:build', function() {
    return gulp.src( path.src.sprite_svg )
       .pipe(svgstore())
       .pipe(gulpif(!!args.prod, imagemin({ multipass: true })))
       .pipe(gulp.dest(path.build.img))
       .pipe(reload({stream: true}));
});

// задача для запуска сборки
gulp.task('build', gulp.parallel([
    'html:build',
    'style:build',
    'style_libs:build',
    'js_libs:build',
    'fonts:build',
    'image:build',
    'favicons:build',
    'sprite_svg:build',
    'temp:build'
]));


// Задача watch
gulp.task('watch', function(){
    global.watch = true;
    gulp.watch( path.watch.html, gulp.series('html:build')).on('all', (event, filepath) => {
            global.emittyChangedFile = filepath;
            console.log('Pug files changed: ' + filepath);
        });

    gulp.watch( path.watch.style, gulp.series('style:build'));

    gulp.watch( path.watch.style_libs, gulp.parallel('style_libs:build'));

    gulp.watch( path.watch.fonts, gulp.series('fonts:build'));

    gulp.watch( path.watch.img, gulp.series('image:build'));

    gulp.watch( path.watch.favicons, gulp.series('favicons:build'));

    gulp.watch( path.watch.sprite_svg, gulp.series('sprite_svg:build'));

    gulp.watch( path.watch.temp, gulp.series('temp:build'));
});



// задача запускает сервер
gulp.task('webserver', function () {
    browserSync({
        server: {
            baseDir: "./build"
        },
        tunnel: false,
        host: 'localhost',
        port: 11424,
        logPrefix: "kdx_serv"
    });
});


// Задачи для очистки
gulp.task('clean', function (done) {
    rimraf(path.clean, done);
});




gulp.task('js', () => {
  webpackConfig.watch = true;

  webpack(webpackConfig, (err, stats) => {
    if(err) throw new util.PluginError("webpack", err);

    gutil.log("[webpack]", stats.toString('normal'));
    browserSync.reload();
  })
});

// Задача по умолчанию
gulp.task('default', gulp.series( 'build', gulp.parallel('watch','webserver', 'js')));