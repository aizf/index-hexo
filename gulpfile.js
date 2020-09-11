const path = require('path');
const { src, dest, series, parallel } = require('gulp');
const del = require('del');
// const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const htmlmin = require('gulp-htmlmin');
const gzip = require('gulp-gzip');

const inputPath = path.join(__dirname, 'public');
const outputPath = path.join(__dirname, 'dist');


async function clean() {
    await del(outputPath);
}

function copy() {
    return src(path.join(inputPath, '**/*'))
        .pipe(dest(outputPath));
}


function css() {
    return src(path.join(inputPath, 'css', '*.css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(dest(path.join(outputPath, 'css')));
}

function javascript() {
    return src(path.join(inputPath, 'js', '*.js'))
        .pipe(uglify())
        .pipe(dest(path.join(outputPath, 'js')));
}

function html() {
    return src(path.join(inputPath, "**", '*.html'))
        .pipe(htmlmin({
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            customAttrAssign: [],
            keepClosingSlash: true,
            minifyJS: true,             // 压缩页面JS
            minifyCSS: true,            // 压缩页面CSS
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            sortAttributes: true,
            sortClassName: true,
        }
        ))
        .pipe(dest(outputPath));
}

function xml() {
    return src(path.join(inputPath, "**", '*.xml'))
        .pipe(htmlmin({
            collapseWhitespace: true,
            keepClosingSlash: true,
        }
        ))
        .pipe(dest(outputPath));
}

const minify = parallel(css, javascript, html, xml);

function gzipFiles() {
    return src(path.join(outputPath, '**', '*.+(js|css|xml)'))
        .pipe(gzip({ threshold: 10240 }))
        .pipe(dest(outputPath));
}


exports.default = series(
    clean,
    copy,
    minify,
    gzipFiles
);
