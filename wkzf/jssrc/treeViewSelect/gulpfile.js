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
var os = require('os');

var gulpif = require("gulp-if");
var isTest = gulp.env.env === 'test';


gulp.task('js', function() {
    return gulp.src(['src/bootstrap-treeview.js','src/jquery.treeViewSelect.js'])
        .pipe(plumber())
        .pipe(concat("jquery.treeViewSelect.js"))
        .pipe(gulpif(isTest, uglify()))
        .pipe(gulp.dest("dist"));

})

/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义watch 任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task('watch', function() {
    gulp.watch('src/*.js',['js']);
})


/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义清空编译目录(css | js)任务
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task("clean", function() {
    return gulp.src([
            "dist"
        ], {
            read: false
        })
        .pipe(clean());
});


/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
build task
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
gulp.task("build", gulpSequence("clean","js"));

gulp.task('default',['watch']);

