function CookieProc(){
	this.setCookie = function(name,value,hour){
		var date = new Date();
		date.setTime(date.getTime() + hour*60*60*1000);
		document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
	}

	this.getCookie = function(name){
		var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
		return value? value[2] : null;
	}

	this.delCookie = function(name){
		this.setCookie(name,'',-1);
	}
}

// 기본클래스 생성
var CookieProc = new CookieProc();