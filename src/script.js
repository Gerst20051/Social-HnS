Array.prototype.empty=function(){this.splice(0,this.length);};

var aC = {
title: "Social HnS",
logged: false,
loginFocus: false,
registerFocus: false,
currentPage: "login",
profileID: 0,
loadedLeft: [],
loadedContent: [],
loadedRight: [],
user: {},
onKeyDown: function(e){
	var keyCode = e.keyCode || e.which;
	if (keyCode == 13) {
		if (aC.loginFocus) $("#b_login_splash").click();
		else if (aC.registerFocus) $("#b_register").click();
	}
},
stringToBoolean: function(string){
        switch(string.toLowerCase()) {
                case "true": case "yes": case "1": return true;
                case "false": case "no": case "0": case null: return false;
                default: return Boolean(string);
        }
},
empty: function(mixed){
	var key;
	if (mixed === "" || mixed === 0 || mixed === "0" || mixed === null || mixed === false || typeof mixed === 'undefined') return true;
	if (typeof mixed == 'object') {
		for (key in mixed) return false;
		return true;
	}
	return false;
},
setPage: function(name){
	aC.currentPage = name;
},
setTitle: function(title,type){
	if (!type) {
		if (!title) document.title = aC.title;
		else document.title = aC.title + " | " + title;
	} else {
		document.title = title;
	}
},
setHash: function(hash){
	if (!hash) window.location.replace("#");
	else window.location.replace("#" + encodeURI(hash));
},
getHash: function(){
	return decodeURIComponent(window.location.hash.substring(1));
},
init: function(){
	$.get('ajax.php', {p:"logged"}, function(response) {
		if (aC.stringToBoolean(response)) aC.logged = true;
		if (!aC.logged) aC.loadModule('login');
		else {
			if (aC.empty(aC.getHash())) {
				aC.setPage('newsfeed');
				aC.loadModule('home_newsfeed');
				aC.loadModule('home_leftcol','left');
				aC.loadModule('home_rightcol','right');
				aC.loadModule('header','header');
				$("#left").animate({width:200}, 600);
				$("#right").animate({width:210}, 600);
				$("#body").animate({left:200}, 600, function(){ $("#doc").addClass("in").removeClass("out"); });
			} else {
				// handle module loading
				aC.setPage('newsfeed');
				aC.loadModule('home_newsfeed');
				aC.loadModule('home_leftcol','left');
				aC.loadModule('home_rightcol','right');
				aC.loadModule('header','header');
				$("#left").animate({width:200}, 600);
				$("#right").animate({width:210}, 600);
				$("#body").animate({left:200}, 600, function(){ $("#doc").addClass("in").removeClass("out"); });
			}
		}
	});
},
loadModule: function(module){
	if (!arguments[1] || $.isFunction(arguments[1])) var target = "content";
	else var target = arguments[1];
	if (module == "login" && aC.logged) {
		aC.loadedLeft.empty();
		aC.loadedContent.empty();
		aC.loadedRight.empty();
		$("#left,#content,#right,#header").empty();
	}
	switch (target) {
		case "left":
			if ($.inArray(module,aC.loadedLeft) > -1){
				$("#left").children().hide();
				$("#"+module).show();
				return;
			}
		break;
		case "content":
			if ($.inArray(module,aC.loadedContent) > -1){
				$("#content").children().hide();
				$("#"+module).show();
				return;
			}
		break;
		case "right":
			if ($.inArray(module,aC.loadedRight) > -1) {
				$("#right").children().hide();
				$("#"+module).show();
				return;
			}
		break;
	}
	$.get('ajax.php', {p:module}, function(response) {
		switch (target) {
			case "left": aC.loadedLeft.push(module); $("#left").children().hide(); break;
			case "content": aC.loadedContent.push(module); $("#content").children().hide(); break;
			case "right": aC.loadedRight.push(module); $("#right").children().hide(); break;
		}
		$("#"+target).append(response);
		/*
		if (arguments.length > 1) {
			if ($.isFunction(arguments[arguments.length - 1])) {
				arguments[arguments.length - 1];
			}
		}
		*/
	});
},
login: function(){
	var e = false,
	username = $("#lusername"),
	password = $("#lpassword");
	if ($.trim(username.val()) == "") { username.addClass('error'); e = true; } else username.removeClass('error');
	if ($.trim(password.val()) == "") { password.addClass('error'); e = true; } else password.removeClass('error');
	if (!e) {
		$('#f_login input').attr('disabled',true);
		$.post("ajax.php", {login:true,username:$.trim(username.val()),password:secure('hns'+$.trim(password.val()))}, function(response) {
			if (aC.stringToBoolean(response)) aC.logged = true;
			if (!aC.logged) $('#f_login input').attr('disabled',false);
			else {
				$("#content").empty();
				aC.setPage('newsfeed');
				aC.loadModule('home_newsfeed');
				aC.loadModule('home_leftcol','left');
				aC.loadModule('home_rightcol','right');
				aC.loadModule('header','header');
				$("#left").animate({width:200}, 600);
				$("#right").animate({width:210}, 600);
				$("#body").animate({left:200}, 600, function(){ $("#doc").addClass("in").removeClass("out"); });
			}
		});
	}
},
regValidate: function(){
	var e = false,
	username = $("#reg_username"),
	password = $("#reg_password"),
	name = $("#reg_name"),
	email = $("#reg_email"),
	hometown = $("#reg_hometown"),
	city = $("#reg_city"),
	bmonth = $("#reg_bmonth"),
	bday = $("#reg_bday"),
	byear = $("#reg_byear"),
	usernameReg = /\W/,
	nameReg = /[A-Za-z'-]/,
	emailReg = /^[^0-9][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[@][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,4}?$/i;

	if ($.trim(username.val()) == "") { username.addClass('error'); e = true; }
	else if (usernameReg.test($.trim(username.val()))) { username.addClass('error'); e = true; }
	else { aC.checkUsername($.trim(username.val())); if ($("#username").hasClass('error')) e = true; }
	if ($.trim(password.val()) == "") { password.addClass('error'); e = true; } else password.removeClass('error');

	if ($.trim(name.val()) == "") { name.addClass('error'); e = true; }
	else if (!nameReg.test($.trim(name.val()))) { name.addClass('error'); e = true; }
	else if ($.trim(name.val()).split(' ').length < 2) { name.addClass('error'); e = true; } else name.removeClass('error');

	if ($.trim(email.val()) == "") { email.addClass('error'); e = true; }
	else if (!emailReg.test($.trim(email.val()))) { email.addClass('error'); e = true; } else email.removeClass('error');

	if ($.trim(hometown.val()) == "") { hometown.addClass('error'); e = true; } else hometown.removeClass('error');
	if (bmonth.val() == 0) { bmonth.addClass('error'); e = true; } else bmonth.removeClass('error');
	if (bday.val() == 0) { bday.addClass('error'); e = true; } else bday.removeClass('error');
	if (byear.val() == 0) { byear.addClass('error'); e = true; } else byear.removeClass('error');
	
	if (e) return false;
	else return true;
},
checkUsername: function(uname) {
	if (uname != "") {
		$.get('ajax.php', {p:"username",username:uname}, function(data) {
			if (aC.stringToBoolean(data)) $("#reg_username").addClass('error');
			else $("#reg_username").removeClass('error');
		});
	} else $("#reg_username").addClass('error');
},
logout: function() {
	$.post('ajax.php', {logout:true}, function() {
		$("#left,#right").animate({width:0}, 400, function(){ $("#left,#right").empty(); });
		aC.setPage('login'); aC.setTitle(); aC.setHash(); aC.loadModule('login'); aC.logged = false;
		$("#body").animate({left:0}, 400, function(){ $("#doc").addClass("out").removeClass("in"); });
	});
}
};

$(document.documentElement).keydown(aC.onKeyDown);
$(document).ready(function(){ aC.init();
$("#homeLink").live('click',function(){
	if (aC.logged) {
		if (aC.currentPage != "newsfeed") {
			aC.setPage('newsfeed'); aC.setHash(); aC.setTitle();
			aC.loadModule('home_newsfeed');
			aC.loadModule('home_leftcol','left');
			aC.loadModule('home_rightcol','right');
			$("#newsFeedLink").click();
		}
	} else {
		aC.setPage('login'); aC.setTitle();
		aC.loadModule('login');
	}
});
$("#lusername, #lpassword").live('focus',function(){
	aC.loginFocus = true;
}).live('blur',function(){
	aC.loginFocus = false;
});
$("#b_login_splash").live('click',function(){
	aC.login();
});
$("#b_register_splash").live('click',function(){
	aC.loadModule('register'); aC.setTitle('Register');
});
$("#reg_username, #reg_password, #reg_name, #reg_email, #reg_hometown, #reg_city").live('focus',function(){
	aC.registerFocus = true;
}).live('blur',function(){
	aC.registerFocus = false;
});
$("#reg_username").live('blur',function(){
	aC.checkUsername($.trim(this.value));
});
$("#b_register").live('click',function(){
	if (!aC.regValidate()) return;
	$('#f_register input,#f_register select').attr('disabled',true);
	$.post("ajax.php", {register:true,username:$.trim($("#username").val()),password:$.trim($("#password").val()),name:$.trim($("#name").val()),email:$.trim($("#email").val()),hometown:$.trim($("#hometown").val()),city:$.trim($("#city").val()),gender:$.trim($("#gender").val()),bmonth:$("#bmonth").val(),bday:$("#bday").val(),byear:$("#byear").val()}, function() {
		alert("registered");
	});
});
$("#b_login").live('click',function(){
	aC.setPage('login'); aC.setTitle();
	aC.loadModule('login');
});
$("#logout").live('click',function(){
	aC.logout();
});
$(".welcome_image,.welcome_name,#profileLink").live('click',function(){
	if (aC.currentPage != "profile") {
		aC.setPage('profile'); aC.setHash('profile'); aC.setTitle('Profile Full Name',true);
		aC.loadModule('profile');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('profile_rightcol','right');
		$("#wallLink").click();
	}
});
$(".welcome_editlink").live('click',function(){
	if (aC.currentPage != "edit") {
		aC.setPage('edit');
		aC.loadModule('edit');
	}
});
$(".sideNavItem").live('click',function(){
	if (!$(this).hasClass('selectedItem')) {
		$(".sideNav").children().removeClass("selectedItem");
		$(this).addClass("selectedItem");
	}
});
$("#newsFeedLink").live('click',function(){
	if (aC.currentPage != "newsfeed") {
		aC.setPage('newsfeed');
		aC.loadModule('home_newsfeed');
	}
});
$("#messagesLink").live('click',function(){
	if (aC.currentPage != "messages") {
		aC.setPage('messages');
		aC.loadModule('messages');
	}
});
$("#friendsLink").live('click',function(){
	if (aC.currentPage != "friends") {
		aC.setPage('friends');
		aC.loadModule('friends');
	}
});
$("#wallLink").live('click',function(){
	if (aC.currentPage != "profile") {
		aC.setPage('profile');
		aC.loadModule('profile');
	}
});
$("#infoLink").live('click',function(){
	if (aC.currentPage != "info") {
		aC.setPage('info');
		aC.loadModule('info');
	}
});
$("#photosLink").live('click',function(){
	if (aC.currentPage != "photos") {
		aC.setPage('photos');
		aC.loadModule('photos');
	}
});
$(".updateStatus .textarea").live('focus',function(){
	$(this).css('max-height',400);
	$(".updateStatus .buttonTools").show();
}).live('blur',function(){
	if ($(this).val() == "") {
		$(this).css('max-height',16);
		$(".updateStatus .buttonTools").hide();
	}
});
});

function encode(a){if(a===null||typeof a==="undefined"){return""}var b=(a+'');var c="",start,end,stringl=0;start=end=0;stringl=b.length;for(var n=0;n<stringl;n++){var d=b.charCodeAt(n);var e=null;if(d<128){end++}else if(d>127&&d<2048){e=String.fromCharCode((d>>6)|192)+String.fromCharCode((d&63)|128)}else{e=String.fromCharCode((d>>12)|224)+String.fromCharCode(((d>>6)&63)|128)+String.fromCharCode((d&63)|128)}if(e!==null){if(end>start){c+=b.slice(start,end)}c+=e;start=end=n+1}}if(end>start){c+=b.slice(start,stringl)}return c}
function secure(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var c,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!a){return a}a=this.encode(a+'');do{c=a.charCodeAt(i++);o2=a.charCodeAt(i++);o3=a.charCodeAt(i++);bits=c<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b.charAt(h1)+b.charAt(h2)+b.charAt(h3)+b.charAt(h4)}while(i<a.length);enc=tmp_arr.join('');switch(a.length%3){case 1:enc=enc.slice(0,-2)+'==';break;case 2:enc=enc.slice(0,-1)+'=';break}return enc}