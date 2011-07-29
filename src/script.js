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
loadedProfile: [],
loadedRight: [],
user: {},
newestUpdate: 0,
oldestUpdate: 0,
timestamp: Date.now || function(){
	return +new Date;
},
timestamp_sec: Date.now / 1000 || function(){
	return +new Date / 1000;
},
stringToBoolean: function(string){
        switch(string.toLowerCase()) {
                case "true": case "yes": case "1": return true;
                case "false": case "no": case "0": case null: return false;
                default: return false;
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
			$.getJSON('ajax.php', {p:"userdata"}, function(response) {
				aC.user = response;
				if (aC.user.middlename != "") aC.user.fullname = aC.user.firstname+' '+aC.user.middlename+' '+aC.user.lastname;
				else aC.user.fullname = aC.user.firstname+' '+aC.user.lastname;
			});
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
			if ($.inArray(module,aC.loadedLeft) > -1) {
				$("#left").show().children().hide();
				$("#"+module).show();
				return;
			}
		break;
		case "content":
			if ($.inArray(module,aC.loadedContent) > -1) {
				$("#content").children().hide();
				$("#"+module).show();
				var profilePages = ['profile','about','photos','friends','posts','likes'];
				if ($.inArray(aC.currentPage,profilePages) == -1) {
					if ($("#right").is(":hidden")) aC.toggleModule('right');
				}
				return;
			}
		break;
		case "profile":
			if ($.inArray(module,aC.loadedProfile) > -1) {
				return;
			}
		break;
		case "right":
			if ($.inArray(module,aC.loadedRight) > -1) {
				$("#right").show().children().hide();
				$("#"+module).show();
				return;
			}
		break;
	}
	$.get('ajax.php', {p:module}, function(response) {
		switch (target) {
			case "left": aC.loadedLeft.push(module); $("#left").show().children().hide(); break;
			case "content": aC.loadedContent.push(module); $("#content").children().hide(); break;
			case "right": aC.loadedRight.push(module); $("#right").show().children().hide(); break;
		}
		$("#"+target).append(response);
		if (aC.currentPage == "newsfeed") {
			$(".loadingMostRecent,.loadingMore").hide();
			$(".loadMore").css('display','block');
		}
		/*
		if (arguments.length > 1) {
			if ($.isFunction(arguments[arguments.length - 1])) {
				arguments[arguments.length - 1];
			}
		}
		*/
	});
},
toggleModule: function(module,callback) {
	if (module == "left") {
		if ($("#left").is(":hidden")) {
			$("#left").animate({width:200}, 600);
			$("#body").animate({left:200}, 600);
		} else {
			$("#left").animate({width:0}, 400);
			$("#body").animate({left:0}, 400);
		}
	} else if (module == "right") {
		if ($("#right").is(":hidden")) {
			$("#right").show();
			$("#content").css('width',568);
		} else {
			$("#right").hide();
			$("#content").css('width',778);
		}
	}
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
logout: function(){
	$.post('ajax.php', {logout:true}, function() {
		$("#left,#right").animate({width:0}, 400, function(){ $("#left,#right").empty(); });
		aC.setPage('login'); aC.setTitle(); aC.setHash(); aC.loadModule('login'); aC.logged = false;
		$("#body").animate({left:0}, 400, function(){ $("#doc").addClass("out").removeClass("in"); });
	});
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
checkUsername: function(uname){
	if (uname != "") {
		$.get('ajax.php', {p:"username",username:uname}, function(response) {
			if (aC.stringToBoolean(response)) $("#reg_username").addClass('error');
			else $("#reg_username").removeClass('error');
		});
	} else $("#reg_username").addClass('error');
},
onKeyDown: function(e){
	var keyCode = e.keyCode || e.which;
	if (aC.logged) {

	} else {
		if (keyCode == 13) {
			if (aC.loginFocus) $("#b_login_splash").click();
			else if (aC.registerFocus) $("#b_register").click();
		}
	}
},
handleError: function(error){
	return error;
},
addNewStatusUpdate: function(sid,status){
	var datetime = new Date(), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	if (minutes < 10) { minutes = '0'+minutes; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + datetime.getSeconds() + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDay() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	var s = '<li id="update-'+sid+'" style="display:none">';
	s += '<div class="updateWrapper"><div class="updateTitle">';
	s += '<a href="#" class="updateImageLink"><img class="updateImg" src="/uploads/'+aC.user.username+'/images/thumb/'+aC.user.default_image+'"/></a>';
	s += '<div class="updateNameDate"><a href="#" class="updateNameLink">'+aC.user.fullname+'</a>';
	s += '<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateDateLink" target="_blank" title="'+title+'">'+time+'</a></span>';
	s += '</div></div>';
	s += '<div class="updateBody">'+status+'</div>';
	s += '<div class="updateAttachments"></div>';
	s += '<div class="updateActions">';
	s += '<ul class="streamActions">';
	s += '<li class="updateLinks"><a href="#" class="updateLikeLink">Like</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateCommentLink">Comment</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateShareLink">Share</a></li>';
	s += '<li class="updateLikes"></li>';
	s += '<li class="updateShares"></li>';
	s += '<li class="updateOlderComments clickable"></li>';
	s += '<li class="updateComments"></li>';
	s += '<li class="updateNewComments clickable"></li>';
	s += '<li class="updateComment">';
	s += '<div class="updateCommentBox">';
	s += '<form class="f_updateComment" action="#" method="post" onsubmit="return false">';
	s += '<div id="updateComposer"><div class="commentBox"><div class="wrap"><div class="innerWrap">';
	s += '<textarea class="textarea" placeholder="Add a comment..." cols="30" rows="4"></textarea>';
	s += '</div></div></div></div>';
	s += '<div class="buttonTools cf"><ul class="toolList rfloat">';
	s += '<li class="listItem"><label class="commentButton" for="comment"><input value="Add comment" type="submit" id="comment"/></label></li>';
	s += '</ul></div></form></div></li></ul></div></div></li>';
	return s;
},
addStatusUpdate: function(sid,timestamp,status,username,image,name,likes,shares,oldcomments,comments,newcomments){
	var datetime = new Date(timestamp), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	if (minutes < 10) { minutes = '0'+minutes; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + datetime.getSeconds() + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDay() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	var s = '<li id="update-'+sid+'">';
	s += '<div class="updateWrapper"><div class="updateTitle">';
	s += '<a href="#" class="updateImageLink"><img class="updateImg" src="/uploads/'+username+'/images/thumb/'+image+'"/></a>';
	s += '<div class="updateNameDate"><a href="#" class="updateNameLink">'+name+'</a>';
	s += '<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateDateLink" target="_blank" title="'+title+'">'+time+'</a></span>';
	s += '</div></div>';
	s += '<div class="updateBody">'+status+'</div>';
	s += '<div class="updateAttachments"></div>';
	s += '<div class="updateActions">';
	s += '<ul class="streamActions">';
	s += '<li class="updateLinks"><a href="#" class="updateLikeLink">Like</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateCommentLink">Comment</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateShareLink">Share</a></li>';
	s += '<li class="updateLikes"><a href="#" class="updateLikesLink">'+likes+' likes</a> by '+likes+' others</li>';
	s += '<li class="updateShares"><a href="#" class="updateSharesLink">'+shares+' shares</a> - '+shares+'</li>';
	s += '<li class="updateOlderComments clickable"><a href="#" class="updateOlderCommentsLink">'+oldcomments+' older comments</a> from '+oldcomments+'</li>';
	s += '<li class="updateComments"><ul class="streamComments"><li>'+comments+'</li></ul></li>';
	s += '<li class="updateNewComments clickable"><a href="#" class="updateNewCommentsLink">'+newcomments+' more comments</a> from '+newcomments+'</li>';
	s += '<li class="updateComment">';
	s += '<div class="updateCommentBox">';
	s += '<form class="f_updateComment" action="#" method="post" onsubmit="return false">';
	s += '<div id="updateComposer"><div class="commentBox"><div class="wrap"><div class="innerWrap">';
	s += '<textarea class="textarea" placeholder="Add a comment..." cols="30" rows="4"></textarea>';
	s += '</div></div></div></div>';
	s += '<div class="buttonTools cf"><ul class="toolList rfloat">';
	s += '<li class="listItem"><label class="commentButton" for="comment"><input value="Add comment" type="submit" id="comment"/></label></li>';
	s += '</ul></div></form></div></li></ul></div></div></li>';
},
addNewComment: function(cid,comment){
	var datetime = new Date(), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	if (minutes < 10) { minutes = '0'+minutes; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + datetime.getSeconds() + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDay() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	var c = '<li id="comment-'+cid+'">';
	c += '<div class="commentWrapper">';
	c += '<div class="commentContent">';
	c += '<a href="#" class="commentImageLink"><img class="commentImg" src="/uploads/'+aC.user.username+'/images/thumb/'+aC.user.default_image+'"/></a>';
	c += '<div class="commentNameBody">';
	c += '<a href="#" class="commentNameLink">'+aC.user.fullname+'</a> - <span class="commentBody">'+comment+'</span>';
	c += '</div>';
	c += '<span class="expandComment"><a href="#" class="expandCommentLink">Expand this comment &#187;</a></span>';
	c += '<span class="collapseComment"><a href="#" class="collapseCommentLink">Collapse this comment</a></span>';
	c += '<div class="commentTimeTools">';
	c += '<span class="commentTime" title="'+title+'">'+time+'</span></span>&nbsp;&nbsp;';
	c += '<span class="commentTools"><a href="#" class="commentLikeLink">Like</a></span>';
	c += '</div>';
	c += '</div>';
	c += '</div>';
	c += '</li>';
},
addComment: function(cid,timestamp,comment,image,name){
	var datetime = new Date(timestamp), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	if (minutes < 10) { minutes = '0'+minutes; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + datetime.getSeconds() + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDay() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	var c = '<li id="comment-'+cid+'">';
	c += '<div class="commentWrapper">';
	c += '<div class="commentContent">';
	c += '<a href="#" class="commentImageLink"><img class="commentImg" src="/uploads/Andrew/images/thumb/IMG_1271.JPG"/></a>';
	c += '<div class="commentNameBody">';
	c += '<a href="#" class="commentNameLink">Phillip Tunstall</a> - <span class="commentBody">Watch "Ghost in the Shell" to be better prepared...</span>';
	c += '</div>';
	c += '<span class="expandComment"><a href="#" class="expandCommentLink">Expand this comment &#187;</a></span>';
	c += '<span class="collapseComment"><a href="#" class="collapseCommentLink">Collapse this comment</a></span>';
	c += '<div class="commentTimeTools">';
	c += '<span class="commentTime" title="Jul 28, 2011 9:13:25 AM">9:13 AM</span></span>&nbsp;&nbsp;';
	c += '<span class="commentTools"><a href="#" class="commentLikeLink">Like</a></span>';
	c += '</div>';
	c += '</div>';
	c += '</div>';
	c += '</li>';
},
bbCode: function(text){
	return;
}
};

$(document.documentElement).keydown(aC.onKeyDown);
$(document).ready(function(){ aC.init();
$(".homeLink").live('click',function(){
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
$("#headerLogoutLink").live('click',function(){
	aC.logout();
});
$(".welcome_image,.welcome_name,.profileLink").live('click',function(){
	if (aC.currentPage != "profile") {
		aC.setPage('profile'); aC.setHash('profile'); aC.setTitle(aC.user.fullname,true);
		aC.toggleModule('right');
		aC.loadModule('profile');
		aC.loadModule('profile_leftcol','left');
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
	if (aC.currentPage != "profile") {
		aC.setPage('profile'); aC.setHash('profile'); aC.setTitle(aC.user.fullname,true);
		aC.toggleModule('right');
		aC.loadModule('profile');
		aC.loadModule('profile_leftcol','left');
		$("#friendsLink").click();
	}
});
$("#wallLink").live('click',function(){
	if (aC.currentPage != "profile") {
		aC.setPage('profile');
		aC.loadModule('profile');
	}
});
$("#infoLink").live('click',function(){
	if (aC.currentPage != "about") {
		aC.setPage('about');
		aC.loadModule('about');
	}
});
$("#photosLink").live('click',function(){
	if (aC.currentPage != "photos") {
		aC.setPage('photos');
		aC.loadModule('photos');
	}
});
$(".updateNewsFeed").live('click',function(){
	$(".loadingMostRecent").css('display','block');
	$.getJSON('ajax.php', {p:"stream",id:aC.profileID,newest:aC.newestUpdate}, function(response) {
		$("ul#stream").prepend(response);
		$(".loadingMostRecent").hide();
	});
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
$("#share").live('click',function(){
	if ($.trim($(".updateStatus .textarea").val()).length > 0) {
		$.post("ajax.php", {p:"status",data:$.trim($(".updateStatus .textarea").val())}, function(response) {
			if (response != "0") {
				var s = aC.addNewStatusUpdate(response,$.trim($(".updateStatus .textarea").val()));
				$(".updateStatus .textarea").val('').blur();
				$("ul#stream").prepend(s);
				$("ul#stream li:first").fadeIn();
			}
		});
	}
});
$("ul#stream > li").live('click',function(){
	$("ul#stream > li").removeClass('active borderActive');
	$(this).addClass('active').prev().addClass('borderActive')
	$(this).next().addClass('borderActive');
});
$(".updateComment .textarea").live('focus',function(){
	$(this).css('max-height',300);
	$(".updateComment .buttonTools").show();
}).live('blur',function(){
	if ($(this).val() == "") {
		$(this).css('max-height',16);
		$(".updateComment .buttonTools").hide();
	}
});
$("#comment").live('click',function(){
	if ($.trim($(".updateComment .textarea").val()).length > 0) {
		$.post("ajax.php", {p:"comment",data:$.trim($(".updateComment .textarea").val())}, function(response) {
			if (response != "0") {
				var c = aC.addNewComment(response,$.trim($(".updateComment .textarea").val()));
				$(".updateComment .textarea").val('').blur();
				alert($(this).closest("ul#streamActions").children("ul#streamComments").html());
				$(this).closest("ul#streamActions").children("ul#streamComments").append(c);
				$(this).parents().find("ul#streamActions").children().find("ul#streamComments li:last").fadeIn();
			}
		});
	}
});
$(".loadMore").live('click',function(){
	$(this).hide();
	$(".loadingMore").css('display','block');
	$.getJSON('ajax.php', {p:"stream",uid:aC.profileID,oldest:aC.oldestUpdate}, function(response) {
		$("ul#stream").append(response);
		$(".loadingMore").hide();
		$(".loadMore").show();
	});
});
});

function encode(a){if(a===null||typeof a==="undefined"){return""}var b=(a+'');var c="",start,end,stringl=0;start=end=0;stringl=b.length;for(var n=0;n<stringl;n++){var d=b.charCodeAt(n);var e=null;if(d<128){end++}else if(d>127&&d<2048){e=String.fromCharCode((d>>6)|192)+String.fromCharCode((d&63)|128)}else{e=String.fromCharCode((d>>12)|224)+String.fromCharCode(((d>>6)&63)|128)+String.fromCharCode((d&63)|128)}if(e!==null){if(end>start){c+=b.slice(start,end)}c+=e;start=end=n+1}}if(end>start){c+=b.slice(start,stringl)}return c}
function secure(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var c,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!a){return a}a=this.encode(a+'');do{c=a.charCodeAt(i++);o2=a.charCodeAt(i++);o3=a.charCodeAt(i++);bits=c<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b.charAt(h1)+b.charAt(h2)+b.charAt(h3)+b.charAt(h4)}while(i<a.length);enc=tmp_arr.join('');switch(a.length%3){case 1:enc=enc.slice(0,-2)+'==';break;case 2:enc=enc.slice(0,-1)+'=';break}return enc}