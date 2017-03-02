/*-----------------------------------------------------------------------------------------------------------
1. 插件名称：音频播放
2. 插件描述：仿微信音频播放
3. 版本：1.0
4. 原理：
5. 使用范例：  
    
6. 未尽事宜：
7. 作者：luwei@lifang.com
-----------------------------------------------------------------------------------------------------------*/
;
(function($) {
    'use strict';

    /*-----------------------------------------------------------------------------------------------------------
    定义插件的构造方法
    @param element 选择器对象
    @param options 配置项
    @constructor
    -----------------------------------------------------------------------------------------------------------*/
    var Plugin = function(element, options) {
        //将选择器对象赋值给插件，方便后续调用
        this.$element = $(element);

        this.$Audio = this.$element.children('#media');
        this.Audio = this.$Audio[0];
        this.$audio_area = this.$element.find('#audio_area');
        this.$audio_length = this.$element.find('#audio_length');
        this.$audio_progress = this.$element.find('#audio_progress');
        //属性
        this.currentState = 'pause';
        this.time = null;
        //合并参数设置
        this.options = $.extend({}, Plugin.defaults, options);
        //进行一些初始化工作
        this.init();
    };

    /*-----------------------------------------------------------------------------------------------------------
    插件名称，即调用时的名称（$.fn.pluginName）
    @type {string}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.pluginName = "wechatAudio";

    /*-----------------------------------------------------------------------------------------------------------
    插件缓存名称，插件通过 data 方法缓存在 dom 结构里，存储数据的名称
    @type {string}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.dataName = "wechataudio";

    /*-----------------------------------------------------------------------------------------------------------
    插件版本
    @type {string}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.version = "1.0.0";

    /*-----------------------------------------------------------------------------------------------------------
    插件默认配置项
    @type {{}}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.defaults = {
        autoplay: false,
        src: '',
        callback: $.noop
    };

    /*-----------------------------------------------------------------------------------------------------------
    定义私有方法
    -----------------------------------------------------------------------------------------------------------*/
    var privateMethod = {

    };

    /*-----------------------------------------------------------------------------------------------------------
    定义插件的方法
    @type {{}}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.prototype = {
        init: function() {
            var self = this;
            self.Audio.addEventListener('durationchange', function(e) {
                self.updateTotalTime(e.target.duration);
                console.log(e.target.duration); //FIRST 0, THEN REAL DURATION
            });
            // window.addEventListener('load',function(){
            //     self.updateTotalTime();
            // })
            self.events();
            // 设置src
            if (self.options.src !== '') {
                self.changeSrc(self.options.src, this.options.callback);
            }
            // 设置自动播放
            if (self.options.autoplay) {
                self.play();
            }
        },
        play: function() {
            var self = this;
            if (self.currentState === "play") {
                self.pause();
                return;
            }
            self.Audio.play();
            clearInterval(self.timer);
            self.timer = setInterval(self.run.bind(self), 50);
            self.currentState = "play";
            self.$audio_area.addClass('playing');
        },
        pause: function() {
            var self = this;
            self.Audio.pause();
            self.currentState = "pause";
            clearInterval(self.timer);
            self.$audio_area.removeClass('playing');
        },
        stop: function() {

        },
        events: function() {
            var self = this;
            var updateTime;
            self.$audio_area.on('click', function() {
                self.play();
                if (!updateTime) {
                    self.updateTotalTime();
                    updateTime = true;
                }
            });
        },
        //正在播放
        run: function() {
            var self = this;
            self.animateProgressBarPosition();
            if (self.Audio.ended) {
                self.pause();
            }
        },
        //进度条
        animateProgressBarPosition: function() {
            var self = this,
                percentage = (self.Audio.currentTime * 100 / self.Audio.duration) + '%';
            if (percentage == "NaN%") {
                percentage = 0 + '%';
            }
            var styles = {
                "width": percentage
            };
            self.$audio_progress.css(styles);
        },
        //获取时间秒
        getAudioSeconds: function(string) {
            var self = this,
                string = string % 60;
            string = self.addZero(Math.floor(string), 2);
            (string < 60) ? string = string: string = "00";
            return string;
        },
        //获取时间分
        getAudioMinutes: function(string) {
            var self = this,
                string = string / 60;
            string = self.addZero(Math.floor(string), 2);
            (string < 60) ? string = string: string = "00";
            return string;
        },
        //时间+0
        addZero: function(word, howManyZero) {
            var word = String(word);
            // while (word.length < howManyZero) word = "0" + word;
            return word;
        },
        //更新总时间
        updateTotalTime: function(time) {
             var self = this,
                time = time || self.Audio.duration,
                minutes = self.getAudioMinutes(time),
                seconds = self.getAudioSeconds(time),
                audioTime = '';
                if(minutes == "00"){
                    audioTime = seconds + "''"
                }else{
                    audioTime = minutes + "'" + seconds + "''";
                }
                self.$audio_length.text(audioTime);
        },
        //改变音频源
        changeSrc: function(src, callback) {
            var self = this;
            self.pause();
            self.Audio.src = src;
            self.play();
            callback();
            return this;
        },

    };

    /*-----------------------------------------------------------------------------------------------------------
    缓存同名插件
    -----------------------------------------------------------------------------------------------------------*/
    var old = $.fn[Plugin.pluginName];

    /*-----------------------------------------------------------------------------------------------------------
    定义插件，扩展$.fn，为jQuery对象提供新的插件方法
    调用方式：$.fn.pluginName()
    @param option {string/object}
    @param args {string/object}
    -----------------------------------------------------------------------------------------------------------*/
    $.fn[Plugin.pluginName] = function(option, args) {
        return this.each(function() {
            var $this = $(this);

            var data = $this.data(Plugin.dataName);
            var options = typeof option == 'object' && option;

            //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
            if (!data) {
                $this.data(Plugin.dataName, (data = new Plugin(this, options)));
            }
            //如果插件的参数是一个字符串，则直接调用插件的名称为此字符串方法
            if (typeof option == 'string') data[option](args);
            return this;
        });
    };

    $.fn[Plugin.pluginName].Constructor = Plugin;

    /*-----------------------------------------------------------------------------------------------------------
    为插件增加 noConflict 方法，在插件重名时可以释放控制权
    @returns {*}
    -----------------------------------------------------------------------------------------------------------*/
    $.fn[Plugin.pluginName].noConflict = function() {
        $.fn[Plugin.pluginName] = old;
        return this
    };
})(Zepto || jQuery);
