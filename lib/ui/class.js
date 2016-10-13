define(function() {
	var Class = (function() {
		
		function subclass() {}

		function isFunction(val) {
			return Object.prototype.toString.call(val) == '[object Function]';
		}

		function ext() {
			var arg = arguments,
				a = arg.length == 1 ? NM : arg[0],
				b = arg.length > 1 ? arg[1] : arg[0];
			if (b == null) return a;
			try {
				for (var n in b) {
					!a.hasOwnProperty(b[n]) && (a[n] = b[n] );
				}
				return a;
			} catch (e) {

			}
		}
		var extend = function () {
	        var arg = arguments,
	            a = arg.length == 1 ? NM : arg[0],
	            b = arg.length > 1 ? arg[1] : arg[0];
	        if (b == null) return a;
	        try {
	            for (var n in b) { !a.hasOwnProperty(b[n]) && ((typeof a == 'object' && (a[n] = b[n])) || (typeof a == 'function' && (a.prototype[n] = b[n]))); }
	            return a;
	        } catch (e) {
	
	        }
	    };
		function create() {
			var parent = null,
				properties = arguments;
			if (isFunction(properties[0]))
				parent = properties.shift();

			function klass() {
				this.init.apply(this, arguments);
			}

			ext(klass, Class.Methods);
			extend(klass,{
				extend:extend,
				setOptions:setOptions
			});
			klass.superclass = parent;
			klass.subclasses = [];

			if (parent) {
				subclass.prototype = parent.prototype;
				klass.prototype = new subclass;
				parent.subclasses.push(klass);
			}

			for (var i = 0, length = properties.length; i < length; i++)
				klass.addMethods(properties[i]);

			if (!klass.prototype.init)
				klass.prototype.init = function(){};

			klass.prototype.constructor = klass;
			return klass;
		}
		
		function setOptions(newOpt){
			this.extend(this.options,newOpt);
			this.extend(this,this.options);
		}
		
		function addMethods(source) {
			var _hasOwnProperty = Object.prototype.hasOwnProperty,
				properties = [];

			for (var property in source) {
				if (_hasOwnProperty.call(source, property)) {
					properties.push(property);
				}

			}

			for (var i = 0, length = properties.length; i < length; i++) {
				var property = properties[i],
					value = source[property];
				this.prototype[property] = value;
			}

			return this;
		}
		return {
			create: create,
			Methods: {
				addMethods: addMethods
			}
		};
	})();
	return Class;
});