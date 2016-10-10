//cookie的增删改查
define(function() {

    var toReString = function(val){
        var h={'\r':'\\r','\n':'\\n','\t':'\\t'};
        return val.replace(/([\.\\\/\+\*\?\[\]\{\}\(\)\^\$\|])/g,"\\$1").replace(/[\r\t\n]/g,function(a){return h[a]});
    };

	var cookie = {

		/**
		 * @method set
		 * 设置cookie
		 * @param {string} cookie的名称
		 * @param {string} cokie的子键
		 * @param {string} 值
		 * @param {object} 配置项
		 */
		set: function(name, value, opts) {
			opts = opts || {};
			if (value === null) {
				value = '';
				opts.expires = -1;
			}
			var expires = '';
			if (opts.expires && (typeof opts.expires == 'number' || opts.expires.toUTCString)) {
				var date;
				if (typeof opts.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (opts.expires * 24 * 60 * 60 * 1000));
				} else {
					date = opts.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			var path = opts.path ? '; path=' + opts.path : '';
			var domain = opts.domain ? '; domain=' + opts.domain : '';
			var secure = opts.secure ? '; secure' : '';
			
			document.cookie = [encodeURIComponent(name), '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		},

		/**
		 * @method get
		 * 获取cookie
		 * @param {string} cookie的名称
		 * @param {string} cokie的子键
		 */
		get: function(name) {
			var arr = document.cookie.match(new RegExp('(?:^|;)\\s*' + toReString(encodeURIComponent(name) ) + '=([^;]+)'));
			return arr ? decodeURIComponent(arr[1]) : null;
		},
		del: function(name, opts) {
			opts = opts || {};
			var path = opts.path ? '; path=' + opts.path : '';
			var domain = opts.domain ? '; domain=' + opts.domain : '';
			var expires = new Date();
			expires.setTime(expires.getTime() - 1);
			document.cookie = encodeURIComponent(name) + '=' + (domain ? '; domain=' + domain : '') + '; path=' + (path || '/') + '; expires=' + expires.toGMTString();
		}
	};
	return cookie;
});