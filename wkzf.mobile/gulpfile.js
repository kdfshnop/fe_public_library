"use strict";

var gulp = require("gulp");
var clean = require("gulp-clean");
var less = require("gulp-less");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var jshint = require("gulp-jshint");
var rename = require("gulp-rename");
var minifyCss = require("gulp-minify-css");
var gulpSequence = require('gulp-sequence');
var plumber = require('gulp-plumber');
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
需要编译到css目录下对应目录的less文件路径定义
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
var compileLessPath = [
    "less/app.less"
] ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
需要编译到js目录下对应目录的jssrc目录源文件路径定义
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
var concatJsPath = [    
    "jssrc/lib/*.js"    
] ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义清空编译目录(css | js)任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task("clean", function() {
    return gulp.src([
            "css",
            "js"
        ], {
            read: false
        })
        .pipe(clean());
});
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义对less编译的任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task("compileLess", function() {
    return gulp.src(compileLessPath)
        .pipe(less())
        .pipe(minifyCss())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest("css"));
}) ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义对核心js合并的任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task("concatUglifyToApp", function() {
    return gulp.src(concatJsPath)
        .pipe(plumber())
        .pipe(concat("app.min.js"))        
        .pipe(gulp.dest("js"));
}) ;

gulp.task("default", ["clean", "compileLess", "concatUglifyToApp"]) ;
