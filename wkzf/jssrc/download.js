function Terminal(){
	var u = navigator.userAgent.toLocaleLowerCase();
	// 判断是否为微信
	this.isWeChat = function(){
		return u.indexOf('micromessenger') > -1;
	}
	// 判断是否为IOS
	this.isIPhone = function(){
		return u.indexOf('iphone') > -1;
	}
	// 判断是否为安卓
	this.isAndroid = function(){
		return u.indexOf('android') > -1 || u.indexOf('linux') > -1;
	}
}