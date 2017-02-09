/* ===== ПОДКЛЮЧЕНИЕ ПЛАГИНОВ ===== */

var gulp = require('gulp'), //  Gulp
    sass = require('gulp-sass'), //  Sass
    browserSync = require('browser-sync'), //  Browser Sync ("живая" перезагрукзка браузера)
    concat = require('gulp-concat'), //  конкатенация файлов
    uglify = require('gulp-uglifyjs'), //  сжатие JS
    cssnano = require('gulp-cssnano'), //  пакет для минификации CSS
    rename = require('gulp-rename'), //  библиотека для переименования файлов
    del = require('del'), //  библиотека для удаления файлов и папок
    imagemin = require('gulp-imagemin'), //  библиотека для работы с изображениями
    pngquant = require('imagemin-pngquant'), //  библиотека для работы с png
    cache = require('gulp-cache'), //  библиотека кеширования
    autoprefixer = require('gulp-autoprefixer'), //  библиотека для автоматического добавления префиксов
    fileinclude = require('gulp-file-include'), //  подключение файлов в другие файлы
    plumber = require('gulp-plumber'), //  перехват ошибок
    csscomb = require('gulp-csscomb'), //  "рассческа" css
    uncss = require('gulp-uncss'), //  удаление неиспользуемых стилей
    spritesmith = require('gulp.spritesmith'); //  генерация спрайтов

/* ========= ПЕРЕМЕННЫЕ =========== */

// Перезагрузка сервера
var reload = browserSync.reload;

// Пути
var app = 'app/'; //Папка исходников
var dist = 'dist/'; //Папка готового проекта

/* ================================ */



/* ===== ТАСК "BROWSER-SYNC" ====== */
gulp.task('browser-sync', function() {
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: dist // Директория для сервера
        },
        notify: false // Отключаем уведомления
    });
});
/* ================================ */

/* ========= ТАСК "HTML" ========== */
gulp.task('html', function() {
    return gulp.src(app + '*.html') //Выберем файлы по нужному пути
        .pipe(plumber()) // Отслеживаем ошибки
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        })) // Прогоним через file-include
        .pipe(gulp.dest(dist)) //Выплюнем их
        .pipe(reload({
            stream: true
        })); //Перезагрузим сервер
});
/* ================================ */

/* ========= ТАСК "SASS" ========== */
gulp.task('sass', function() {
    return gulp.src(app + 'src/sass/main.scss') // Берём источник
        .pipe(plumber()) // Отслеживаем ошибки
        .pipe(sass({
            outputStyle: 'expanded'
        })) // Преобразуем SCSS в CSS
        .pipe(autoprefixer(['last 15 versions', '>1%', 'ie 8', 'ie 7'], {
            cascade: true
        })) // Создаём префиксы
        .pipe(gulp.dest(dist + 'css/')) // Выгружаем результат
        .pipe(reload({
            stream: true
        })); //Перезагружаем сервер
});
/* ================================ */

/* ======= ТАСК "CSS-LIBS" ======== */
gulp.task('css-libs', function() {
    return gulp.src(app + 'src/libs.scss') // Берём источник
        .pipe(plumber()) // Отслеживаем ошибки
        .pipe(sass({
            outputStyle: 'compressed'
        })) // Преобразуем SCSS в CSS
        .pipe(rename({
            suffix: '.min'
        })) // Добавляем суффикс ".min"
        .pipe(gulp.dest(dist + 'css')) // Выгружаем
        .pipe(reload({
            stream: true
        })); //Перезагружаем сервер
});
/* ================================ */

/* ======== ТАСК "JS" ======== */
gulp.task('js', function() {
    return gulp.src([app + 'src/**/*.js', '!' + app + 'src/libs.js']) // Берём все необходимые скрипты
        .pipe(plumber()) // Отслеживаем ошибки
        .pipe(concat('script.js')) // Собираем их в один файл
        .pipe(gulp.dest(dist + 'js')) // Выгружаем
        .pipe(reload({
            stream: true
        })); //Перезагружаем сервер
});
/* ================================ */

/* ======== ТАСК "JS-LIBS" ======== */
gulp.task('js-libs', function() {
    return gulp.src(app + 'src/libs.js') // Берём все необходимые скрипты
        .pipe(plumber()) // Отслеживаем ошибки
        .pipe(uglify()) //Сжимаем
        .pipe(rename({
            suffix: '.min'
        })) // Добавляем суффикс ".min"
        .pipe(gulp.dest(dist + 'js')) // Выгружаем
        .pipe(reload({
            stream: true
        })); //Перезагружаем сервер
});
/* ================================ */

/* ========== ТАСК "IMG" ========== */
gulp.task('img', function() {
    return gulp.src(app + 'img/**/*') // Берём все изображения
        .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками с учётом кэширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(dist + 'img')) // Выгружаем на продакшн
        .pipe(reload({
            stream: true
        })); //Перезагружаем сервер
});
/* ================================ */

/* ========= ТАСК "FONTS" ========= */
gulp.task('fonts', function() {
    return gulp.src(app + 'fonts/**/*') // Берём шрифты
        .pipe(gulp.dest(dist + 'fonts')) // Выгружаем на продакшн
        .pipe(reload({
            stream: true
        })); //Перезагружаем сервер
});
/* ================================ */

/* ========= ТАСК "CLEAN" ========= */
gulp.task('clean', function() {
    return del.sync(dist); // Удаляем папку "dist" перед сборкой
});
/* ================================ */

/* ========= ТАСК "BUILD" ========= */
gulp.task('build', [
    'clean',
    'html',
    'sass',
    'css-libs',
    'js',
    'js-libs',
    'img',
    'fonts'
]);
/* ================================ */

/* ========= ТАСК "WATCH" ========= */
gulp.task('watch', function() {
    gulp.watch(app + '**/*.html', ['html']); // Наблюдение за HTML файлами
    gulp.watch([app + 'src/**/*.scss', '!' + app + 'src/libs.scss'], ['sass']); // Наблюдение за своими SCSS файлами
    gulp.watch(app + 'src/libs.scss', ['css-libs']); // Наблюдение за скачанными CSS файлами
    gulp.watch([app + 'src/**/*.js', '!' + app + 'src/libs.js'], ['js']); // Наблюдение за своими JS файлами
    gulp.watch(app + 'src/libs.js', ['js-libs']); // Наблюдение за скачанными JS файлами
    gulp.watch(app + 'img/*', ['img']); // Наблюдение за картинками
    gulp.watch(app + 'fonts/*', ['fonts']); // Наблюдение за шрифтами
});
/* ================================ */

/* ===== КОМАНДА ПО УМОЛЧАНИЮ ===== */
gulp.task('default', ['build', 'browser-sync', 'watch']);
/* ================================ */

/* ================================ */
gulp.task('spritesmith', function() {
    var spriteData = gulp.src('app/img/sprite/*.*').pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../img/sprite.png',
        cssName: '_sprite.scss',
        algorithm: 'binary-tree',
        padding: 3
    }));
    spriteData.img.pipe(gulp.dest('app/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('app/sass/')); // путь, куда сохраняем стили
});

gulp.task('uncss', function() {
    return gulp.src('app/css/main.css')
        .pipe(uncss({
            html: ['app/index.html'],
            ignore: ['.visible', '.hidden']
        }))
        .pipe(gulp.dest('app/css'));
});
