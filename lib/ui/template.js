//模板解析
/**
 * @Class	Template
 * @Package	util.template
 * @Description	模板解析
 * 				例：
 * 					require('util/template',function(tmpl){
 * 						var html = tmpl(template,data);
 * 						
 * 					}
 * @Author	xiaomin@lifang.com
 * */
define([
],function(){
	//随便来点注释   xiaomin@lifang.com
	var cache = {};
	function template(str, data) {
		if (!data)
			data = {};
		return tmpl(str, data);
	}
	function tmpl(str, data) {
		var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").replace(/'(?=[^%]*%>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<%=(.+?)%>/g, "',$1,'").split("<%").join("');").split("%>").join("p.push('") + "');}return p.join('');");
		return data ? fn(data) : fn;
	}
	
	return template;
});
