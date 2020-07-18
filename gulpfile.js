const path = require('path');
const fs = require('fs');
const { src, dest, series, parallel } = require('gulp');
const del = require('del');
// const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const htmlmin = require('gulp-htmlmin');
const gzip = require('gulp-gzip');
const { sync } = require('del');

const { copyFileX } = require('./utils');

const inputPath = path.resolve(__dirname, 'public/');
const outputPath = path.resolve(__dirname, 'dist/');


async function clean() {
    await del(outputPath);
}


/**
 * 1. 遍历public所有文件
 * 2. .html结尾的添加到htmlTasks
 * 3. 其他的直接复制
 */
async function __dfs(curr) {
    const files = await fs.promises.readdir(curr);
    for (let file of files) {
        const resolvePath = path.resolve(curr, file);
        const relativePath = path.relative(inputPath, resolvePath)
        const stats = await fs.promises.stat(resolvePath);

        // console.log(resolvePath);

        if (stats.isDirectory()) {
            await __dfs(resolvePath);
            continue;
        }

        const targetPath = path.resolve(outputPath, relativePath);
        if (!/\.html$/.test(file)) {
            await copyFileX(resolvePath, targetPath);
            continue;
        } else {
            // console.log(resolvePath);
            htmlTasks.push(
                function htmlTask() {
                    return src(resolvePath)
                        .pipe(htmlmin({
                            removeComments: true,       // 清除HTML注释
                            collapseWhitespace: true,   // 压缩HTML
                            minifyJS: true,             // 压缩页面JS
                            minifyCSS: true             // 压缩页面CSS
                        }
                        ))
                        .pipe(dest(path.dirname(targetPath)));
                }
            )
        }
    }
}
const dfs = async function () {
    await __dfs(inputPath);
    await del(path.resolve(outputPath, '.vscode'));
}


function css() {
    const basename = 'css/';
    return src(path.resolve(inputPath, basename, '*.css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(dest(path.resolve(outputPath, basename)));
}


function javascript() {
    const basename = 'js/';
    return src(path.resolve(inputPath, basename, '*.js'))
        .pipe(uglify())
        .pipe(dest(path.resolve(outputPath, basename)));
}


/**
 * htmlTasks依赖于dfs的执行
 * 因此，htmlTasks需要惰性获取
 */
const htmlTasks = [];
function html(cb) {
    console.log("htmlTasks: ", htmlTasks.length);
    if (htmlTasks.length === 0) return;
    parallel(...htmlTasks)(cb);
}


const minify = parallel(css, javascript, html);


function __gzipFiles() {
    const basenames = ["css/", "js/"];
    const tasks =
        basenames.map(basename => {
            return function gzipFile() {
                return src(path.resolve(outputPath, basename, '*'))
                    .pipe(gzip({ threshold: 10240 }))
                    .pipe(dest(path.resolve(outputPath, basename)));
            }
        })
    return tasks;
}
const gzipFiles = parallel(...__gzipFiles());


exports.default = series(
    clean,
    dfs,
    minify,
    gzipFiles
);
