/*
var userProfiles = {
"1":{
lastupdated: "",
firstname: "Andy",
middlename: "Anthony",
lastname: "Gerst",
username: "Andrew",
following: [],
followers: [],
default_image: "IMG_1271.JPG",
stream: {}
},
"92":{

}
};

if (this.id in aC.userProfiles) {
// get lastupdatedtime
if (aC.userProfiles[this.id].lastupdated < response.
} else {
aC.userProfiles[this.id] = response;
}



friends
stream
info
online status
pictures (how to store/reference pictures)


Probe userProfiles on list....
*/

function main() {
var aC = {
title: "Social HnS",
logged: false,
loginFocus: false,
registerFocus: false,
currentPage: "",
profileID: 0,
loadedLeft: [],
loadedContent: [],
loadedRight: [],
preloadedContent: ['uploadImages'],
profilePages: ['profile','about','photos','following','followers','likes'],
user: {},
userProfiles: {},
urlParams: {},
streamUpdates: {},
newestUpdate: 0,
oldestUpdate: 0,
newerUpdates: 0,
moreUpdates: true,
currentTime: 0,
streamInterval: false,
headerSearch: "",
timestamp: Date.now || function(){
	return +new Date;
},
timestamp_sec: parseInt(Date.now / 1000) || function(){
	return parseInt(+new Date / 1000);
},
today: function(datetime){
	var today = new Date(aC.timestamp());
	return (datetime.getDate() == today.getDate() && datetime.getMonth() == today.getMonth() && datetime.getYear() == today.getYear());
},
yesterday: function(datetime){
	var yesterday = new Date(aC.timestamp() - 86400000);
	return (datetime.getDate() == yesterday.getDate() && datetime.getMonth() == yesterday.getMonth() && datetime.getYear() == yesterday.getYear());
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
addSlashes: function(str){
	return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
},
stripSlashes: function(str){
	return (str + '').replace(/\\(.?)/g, function (s, n1) {
		switch (n1) {
			case '\\': return '\\';
			case '0': return '\u0000';
			case '': return '';
			default: return n1;
		}
	});
},
getRandomInt: function(min,max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
},
getDomain: function(url){
	if (url.indexOf('http')) return url.match(/:\/\/(.[^/]+)/)[1];
	else return url.match(/:\/\/(.[^/]+)/)[1];
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
getHash: function(){
	var params = {};
	(decodeURIComponent(window.location.hash)).replace(/[#&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
		params[key] = value;
	});
	aC.urlParams = params;
	return params;
},
setHash: function(type){
	if (type) {
		aC.urlParams = {};
		window.location.replace("#");
	} else window.location.replace("#"+$.param(aC.urlParams));
},
setParams: function(params){
	var oldParams = aC.urlParams;
	aC.urlParams = params;
	return oldParams;
},
doCallback: function(args){
	if (args.length > 1) {
		if ($.isFunction(args[args.length-1])) {
			args[args.length-1]();
		}
	}
},
init: function(){
	aC.loadedContent=aC.loadedContent.concat(aC.preloadedContent);
	$.get('ajax.php', {p:"logged"}, function(response) { aC.getHash(); aC.setHash();
		if (aC.stringToBoolean(response)) aC.logged = true;
		if (!aC.logged) {
			if (aC.urlParams.p == "register") {
				aC.loadModule('register');
				aC.setTitle('Register');
			} else aC.loadModule('login');
			$.post('ajax.php',{offlineUpdate:true,hash:$.param(aC.urlParams)});
		} else aC.loggedIn();
	});
},
loadModule: function(module){
	if (!arguments[1] || $.isFunction(arguments[1])) var target = "content";
	else var target = arguments[1];
	var args = arguments;
	if (module == "login" && aC.logged) {
		$("#left,#right,#header").empty();
		$.each(aC.loadedContent.diff(aC.preloadedContent),function(i,v){$("#"+v).remove()});
		aC.loadedLeft.clear();
		aC.loadedContent.clear();
		aC.loadedRight.clear();
		aC.loadedContent=aC.loadedContent.concat(aC.preloadedContent);
	}
	if ($.inArray(module,aC.profilePages) > -1) {
		var profilepage = true, submodule = module, module = "profile";
		if (submodule == "profile") submodule = "wall";
	}
	switch (target) {
		case "left":
			if ($.inArray(module,aC.loadedLeft) > -1) {
				$("#left").show().children().hide();
				$("#"+module).show();
				aC.doCallback(args);
				return;
			}
		break;
		case "content":
			if ($.inArray(module,aC.loadedContent) > -1) {
				$("#content").children().hide();
				if ($.inArray(module,aC.profilePages) == -1) {
					if ($("#right").is(":hidden")) aC.toggleModule('right');
					$("#"+module).show();
				} else {
					$("#profile").find("#profileContent").children().hide().find("#"+submodule).show().end().end().show();
				}
				aC.doCallback(args);
				return;
			}
		break;
		case "right":
			if ($.inArray(module,aC.loadedRight) > -1) {
				$("#right").show().children().hide();
				$("#"+module).show();
				aC.doCallback(args);
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
		if ($.inArray(submodule,aC.profilePages) > -1) {
			$("#profile").find("#profileContent #"+submodule).show().end().show();
		}
		if (aC.currentPage == "newsfeed") {
			$(".loadingMostRecent,.loadingMore").hide();
			$(".loadMore").css('display','block');
		}
		aC.doCallback(args);
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
loggedIn: function(){
	if (aC.logged) {
		$.getJSON('ajax.php', {p:"userdata"}, function(response) {
			aC.user = response;
			if (aC.user.middlename != "") aC.user.fullname = aC.user.firstname+' '+aC.user.middlename+' '+aC.user.lastname;
			else aC.user.fullname = aC.user.firstname+' '+aC.user.lastname;
		});
		$.each(aC.loadedContent.diff(aC.preloadedContent),function(i,v){$("#"+v).remove()});
		aC.setPage('newsfeed');
		aC.loadModule('home_newsfeed');
		aC.loadModule('home_leftcol','left');
		aC.loadModule('home_rightcol','right');
		aC.loadModule('header','header');
		if (!aC.empty(aC.urlParams)) aC.handleHash();
		$("#left").animate({width:200}, 600);
		$("#right").animate({width:210}, 600);
		$("#body").animate({left:200}, 600, function(){ $("#doc").addClass("in").removeClass("out"); $('.updateNewsFeed').click(); });
		aC.streamInterval = setInterval(function(){ aC.checkStreamUpdates() },30000);
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
			else aC.loggedIn();
		});
	}
},
logout: function(){
	$.post('ajax.php', {logout:true}, function() {
		$("#left,#right").animate({width:0}, 400, function(){ $("#left,#right").empty(); });
		aC.setPage('login'); aC.setTitle(); aC.setHash(true); aC.loadModule('login'); aC.logged = false;
		$("#body").animate({left:0}, 400, function(){ $("#doc").addClass("out").removeClass("in"); });
		aC.profileID = 0;
		aC.user = {};
		aC.userProfiles = {};
		aC.streamUpdates = {};
		aC.newestUpdate = 0;
		aC.oldestUpdate = 0;
		aC.newerUpdates = 0;
		aC.moreUpdates = true;
		aC.handlePreloadedContent();
		clearInterval(aC.streamInterval);
	});
},
regValidate: function(){
	var e = false,
	username = $("#reg_username"),
	password = $("#reg_password"),
	name = $("#reg_name"),
	email = $("#reg_email"),
	city = $("#reg_city"),
	hometown = $("#reg_hometown"),
	bmonth = $("#reg_bmonth"),
	bday = $("#reg_bday"),
	byear = $("#reg_byear"),
	usernameReg = /\W/,
	nameReg = /[A-Za-z'-]/,
	emailReg = /^[^0-9][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[@][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,4}?$/i;

	if ($.trim(username.val()) == "") { username.addClass('error'); e = true; }
	else if (usernameReg.test($.trim(username.val()))) { username.addClass('error'); e = true; }
	else { aC.checkUsername($.trim(username.val())); if (username.hasClass('error')) e = true; }
	if ($.trim(password.val()) == "") { password.addClass('error'); e = true; } else password.removeClass('error');

	if ($.trim(name.val()) == "") { name.addClass('error'); e = true; }
	else if (!nameReg.test($.trim(name.val()))) { name.addClass('error'); e = true; }
	else if ($.trim(name.val()).split(' ').length < 2) { name.addClass('error'); e = true; } else name.removeClass('error');

	if ($.trim(email.val()) == "") { email.addClass('error'); e = true; }
	else if (!emailReg.test($.trim(email.val()))) { email.addClass('error'); e = true; } else email.removeClass('error');

	if ($.trim(city.val()) == "") { city.addClass('error'); e = true; } else city.removeClass('error');
	if (bmonth.val() == 0) { bmonth.addClass('error'); e = true; } else bmonth.removeClass('error');
	if (bday.val() == 0) { bday.addClass('error'); e = true; } else bday.removeClass('error');
	if (byear.val() == 0) { byear.addClass('error'); e = true; } else byear.removeClass('error');
	
	return !e;
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
	if (!aC.logged) {
		if (keyCode == 13) {
			if (aC.loginFocus) $("#b_login_splash").click();
			else if (aC.registerFocus) $("#b_register").click();
		}
	}
},
onWindowScroll: function(){
	if (aC.moreUpdates) {
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
			$(".loadMore").click();
		}
	}
},
handleError: function(error){
	alert(error.text); log(error);
},
handleHash: function(){
	switch (aC.urlParams.p) {
		case "messages":
			$("#messagesLink").click();
		break;
		case "edit":
			$("#editLink").click();
		break;
		case "uploadImages":
			$("#b_uploadImages").click();
		break;
		case "contacts":
			$("#contactsLink").click();
		break;
		case "profile":
			aC.setPage('profile');
			aC.loadModule('profile');
			$("#profileNavWallLink").click();
		break;
		case "about":
			aC.setPage('about');
			aC.loadModule('about');
			$("#profileNavAboutLink").click();
		break;
		case "photos":
			aC.setPage('photos');
			aC.loadModule('photos');
			$("#profileNavPhotosLink").click();
		break;
		case "following":
			aC.setPage('following');
			aC.loadModule('following');
			$("#profileNavFollowingLink").click();
		break;
		case "followers":
			aC.setPage('followers');
			aC.loadModule('followers');
			$("#profileNavFollowersLink").click();
		break;
	}
},
handleSearch: function(results){
	var s = "";
	$.each(results, function(i,v){
		if (v.default_image != "") var image = "/uploads/"+v.username+"/images/thumb/"+v.default_image;
		else var image = "i/mem/default.jpg";
		if (v.middlename != "") var fullname = v.firstname + " " + v.middlename + " " + v.lastname;
		else var fullname = v.firstname + " " + v.lastname;
		if (v.current_city != "") var city = v.current_city;
		else var city = v.hometown;
		s += '<li id="sresult-'+v.user_id+'" class="searchResult">';
		s += '<div class="left"><img class="sresultImage" src="'+image+'"></div>';
		s += '<div class="right">';
		s += '<div class="sresultName">'+fullname+'</div>';
		s += '<div class="sresultCity">'+city+'</div>';
		s += '</div>';
		s += '</li>';
	});
	return s;
},
handlePreloadedContent: function(){
	$("#uploadImages").find("#uploadImageHolder").css('background-image','');
},
addNewStatusUpdate: function(sid,status){
	var datetime = new Date(), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes(), seconds = datetime.getSeconds();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	else if (hours == 0) hours = 12;
	if (minutes < 10) { minutes = '0'+minutes; }
	if (seconds < 10) { seconds = '0'+seconds; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + seconds + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	var s = '<li id="update-'+sid+'" class="streamItem" style="display:none">';
	s += '<div class="updateWrapper"><div class="updateTitle">';
	if (aC.user.default_image != "") var image = "/uploads/"+aC.user.username+"/images/thumb/"+aC.user.default_image;
	else var image = "i/mem/default.jpg";
	s += '<div class="updateImageLink"><img class="updateImg" src="'+image+'"/></div>';
	s += '<div class="updateNameDate"><span class="updateNameLink link">'+aC.user.fullname+'</span>';
	s += '<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<span class="updateDateLink" title="'+title+'">'+time+'</span></span>';
	s += '<span class="updateEdit">&nbsp;&nbsp;<span class="link updateEditLink">Edit</span></span>';
	s += '</div></div>';
	s += '<div class="updateBody">'+aC.stripSlashes(status)+'</div>';
	s += '<div class="editUpdateBody"><div class="buttonTools cf"><ul class="toolList lfloat">';
	s += '<li class="listItem"><label class="saveEditUpdateButton" for="saveEdit"><input value="Save" type="submit" name="saveEdit" class="saveEditUpdate"/></label></li>';
	s += '<li class="listItem"><label class="cancelEditUpdateButton" for="cancelEdit"><input value="Cancel" type="submit" name="cancelEdit" class="cancelEditUpdate"/></label></li>';
	s += '</ul></div></div>';
	s += '<div class="updateAttachments"></div>';
	s += '<div class="updateActions">';
	s += '<ul class="streamActions">';
	s += '<li class="updateLinks"><span class="link updateLikeLink">Like</span>&nbsp;&nbsp;-&nbsp;&nbsp;<span class="link updateCommentLink">Comment</span>&nbsp;&nbsp;-&nbsp;&nbsp;<span class="link updateShareLink">Share</span></li>';
	s += '<li class="updateLikes"></li>';
	s += '<li class="updateShares"></li>';
	s += '<li class="updateOlderComments clickable"></li>';
	s += '<li class="updateComments"></li>';
	s += '<li class="updateNewComments clickable"></li>';
	s += '<li class="updateLikes"><span class="link updateLikesLink"><span class="count"></span> <span class="updateLikesCount>like</span></span> by <span class="list"></span> others</li>';
	s += '<li class="updateShares"><span class="link updateSharesLink"><span class="count"></span> <span class="updateSharesCount">share</span></span> - <span class="list"></span></li>';
	s += '<li class="updateOlderComments clickable"><span class="link updateOlderCommentsLink"><span class="count"></span> older comments</span> from <span class="list"></span></li>';
	s += '<li class="updateComments"><ul class="streamComments"><li></li></ul></li>';
	s += '<li class="updateNewComments clickable"><span class="link updateNewCommentsLink"><span class="count"></span> more comments</span> from <span class="list"></span></li>';
	s += '<li class="updateComment">';
	s += '<div class="updateCommentBox">';
	s += '<form class="f_updateComment" action="#" method="post" onsubmit="return false">';
	s += '<div id="updateComposer"><div class="commentBox"><div class="wrap"><div class="innerWrap">';
	s += '<textarea class="textarea" placeholder="Add a comment..." cols="30" rows="4"></textarea>';
	s += '</div></div></div></div>';
	s += '<div class="buttonTools cf"><ul class="toolList rfloat">';
	s += '<li class="listItem"><label class="commentButton" for="comment"><input value="Add comment" type="submit" name="comment" class="comment"/></label></li>';
	s += '</ul></div></form></div></li></ul></div></div></li>';
	return s;
},
addStatusUpdates: function(data,type){
	var s = ""; aC.currentTime = aC.timestamp_sec();
	$.each(data,function(i,v){
		if (type == "new") {
			if (i == 0) aC.newestUpdate = v.timestamp;
			if (aC.oldestUpdate == 0 && i == data.length-1) aC.oldestUpdate = v.timestamp;
		} else if (type == "old") {
			if (i == data.length-1) aC.oldestUpdate = v.timestamp;
		}
		var datetime = new Date(parseInt(v.timestamp + '000')), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes(), seconds = datetime.getSeconds();
		if (hours > 12) { hours = hours - 12; prefix = "PM"; }
		else if (hours == 0) hours = 12;
		if (minutes < 10) { minutes = '0'+minutes; }
		if (seconds < 10) { seconds = '0'+seconds; }
		var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
		var monthShortArray = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
		var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		var timesecs = hours + ":" + minutes + ":" + seconds + " " + prefix;
		var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear() + " " + timesecs;
		var time = hours + ":" + minutes + " " + prefix;
		if (aC.yesterday(datetime)) var time = "Yesterday " + time;
		else if (!aC.today(datetime)) var time = monthShortArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear();
		if (v.default_image != "") var image = "/uploads/"+v.username+"/images/thumb/"+v.default_image;
		else var image = "i/mem/default.jpg";
		if (v.middlename != "") var fullname = v.firstname + " " + v.middlename + " " + v.lastname;
		else var fullname = v.firstname + " " + v.lastname;
		var likes = "";
		var shares = ""; var vshares = 0;
		var oldComments = ""; var voldComments = 0;
		var comments = "";
		if (!aC.empty(v.comments)) {
			$.each(v.comments, function(a,b){
				if (b.user.default_image != "") var image = "/uploads/"+b.user.username+"/images/thumb/"+b.user.default_image;
				else var image = "i/mem/default.jpg";
				if (b.user.middlename != "") var fullname = b.user.firstname + " " + b.user.middlename + " " + b.user.lastname;
				else var fullname = b.user.firstname + " " + b.user.lastname;
				comments += aC.addComment(a,b.owner,b.timestamp,b.data,image,fullname,b.likes,b.ids);
			});
		}
		var newComments = ""; var vnewComments = 0;
		var likesCount = "likes";
		var sharesCount = "shares";
		var oldCommentsCount = "comments";
		var newCommentsCount = "comments";
		if (v.likes == 1) likesCount = "like";
		if (vshares == 1) sharesCount = "share";
		if (voldComments == 1) oldCommentsCount = "comment";
		if (vnewComments == 1) newCommentsCount = "comment";
		if (v.likes > 0) { // likes
			if ($.inArray(aC.user.user_id,v.ids) > -1) {
				if (v.likes == 1) likes = "You";
				else likes = "You and " + v.likes-1 + " others";
			} else {
				if (v.likes == 1) likes = v.likes + " other";
				else likes = v.likes + " others";
			}
		}

		if (vshares > 0) { // shares
			if ($.inArray(aC.user.user_id,v.ids) > -1) {
				if (v.likes == 1) shares = "You";
				else shares = "You and " + v.likes-1 + " others";
			} else {
				shares = v.likes + " others";
			}
		}

		if (voldComments > 0) { // old comments
			if ($.inArray(aC.user.user_id,v.ids) > -1) {
				if (v.likes == 1) likes = "You";
				else likes = "You and " + v.likes-1 + " others";
			} else {
				likes = v.likes + " others";
			}
		}

		if (vnewComments > 0) { // new comments
			if ($.inArray(aC.user.user_id,v.ids) > -1) {
				if (v.likes == 1) likes = "You";
				else likes = "You and " + v.likes-1 + " others";
			} else {
				likes = v.likes + " others";
			}
		}

		var likesA = ""; if (v.likes > 0) likesA = " active";
		var sharesA = ""; if (vshares > 0) sharesA = " active";
		var oldcA = ""; if (voldComments != "") oldcA = " active";
		var cA = ""; if (v.comments.length > 0) cA = " active";
		var newcA = ""; if (newComments != "") newcA = " active";
		var ucA = ""; if (v.likes > 0 || shares != "" || oldComments != "" || comments != "" || newComments != "") ucA = " active";		
		s += '<li id="update-'+v.sid+'" class="streamItem">';
		s += '<div class="updateWrapper"><div class="updateTitle">';
		s += '<div class="updateImageLink"><img class="updateImg" src="'+image+'"/></div>';
		s += '<div class="updateNameDate"><span class="updateNameLink link">'+fullname+'</span>';
		s += '<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<span class="updateDateLink" title="'+title+'">'+time+'</span></span>';
		if (v.owner == aC.user.user_id) s += '<span class="updateEdit">&nbsp;&nbsp;<span class="link updateEditLink">Edit</span></span>';
		s += '</div></div>';
		s += '<div class="updateBody">'+aC.stripSlashes(v.data)+'</div>';
		s += '<div class="editUpdateBody"><div class="buttonTools cf"><ul class="toolList lfloat">';
		s += '<li class="listItem"><label class="saveEditUpdateButton" for="saveEdit"><input value="Save" type="submit" name="saveEdit" class="saveEditUpdate"/></label></li>';
		s += '<li class="listItem"><label class="cancelEditUpdateButton" for="cancelEdit"><input value="Cancel" type="submit" name="cancelEdit" class="cancelEditUpdate"/></label></li>';
		s += '</ul></div></div>';
		s += '<div class="updateAttachments"></div>';
		s += '<div class="updateActions">';
		s += '<ul class="streamActions">';
		s += '<li class="updateLinks"><span class="link updateLikeLink">Like</span>&nbsp;&nbsp;-&nbsp;&nbsp;<span class="link updateCommentLink">Comment</span>&nbsp;&nbsp;-&nbsp;&nbsp;<span class="link updateShareLink">Share</span></li>';
		s += '<li class="updateLikes'+likesA+'"><span class="link updateLikesLink"><span class="count">'+v.likes+'</span> <span class="updateLikesCount">'+likesCount+'</span></span> by <span class="list">'+likes+'</span></li>';
		s += '<li class="updateShares'+sharesA+'"><span class="link updateSharesLink"><span class="count">'+vshares+'</span> <span class="updateSharesCount">'+sharesCount+'</span></span> - <span class="list">'+shares+'</span></li>';
		s += '<li class="updateOlderComments clickable'+oldcA+'"><span class="link updateOlderCommentsLink"><span class="count">'+voldComments+'</span> older <span class="updateOldCommentsCount">'+oldCommentsCount+'</span></span> from <span class="list">'+oldComments+'</span></li>';
		s += '<li class="updateComments'+cA+'"><ul class="streamComments">'+comments+'</ul></li>';
		s += '<li class="updateNewComments clickable'+newcA+'"><span class="link updateNewCommentsLink"><span class="count">'+vnewComments+'</span> more <span class="updateNewCommentsCount">'+newCommentsCount+'</span></span> from <span class="list">'+newComments+'</span></li>';
		s += '<li class="updateComment'+ucA+'">';
		s += '<div class="updateCommentBox">';
		s += '<form class="f_updateComment" action="#" method="post" onsubmit="return false">';
		s += '<div id="updateComposer"><div class="commentBox"><div class="wrap"><div class="innerWrap">';
		s += '<textarea class="textarea" placeholder="Add a comment..." cols="30" rows="4"></textarea>';
		s += '</div></div></div></div>';
		s += '<div class="buttonTools cf"><ul class="toolList rfloat">';
		s += '<li class="listItem"><label class="commentButton" for="comment"><input value="Add comment" type="submit" name="comment" class="comment"/></label></li>';
		s += '</ul></div></form></div></li></ul></div></div></li>';
	});
	return s;
},
addNewComment: function(cid,comment){
	var datetime = new Date(), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes(), seconds = datetime.getSeconds();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	else if (hours == 0) hours = 12;
	if (minutes < 10) { minutes = '0'+minutes; }
	if (seconds < 10) { seconds = '0'+seconds; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + seconds + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	var c = '<li id="comment-'+cid+'">';
	c += '<div class="commentWrapper">';
	c += '<div class="commentContent">';
	c += '<divclass="commentImageLink"><img class="commentImg" src="/uploads/'+aC.user.username+'/images/thumb/'+aC.user.default_image+'"/></div>';
	c += '<div class="commentNameBody"><div class="link commentNameLink">'+aC.user.fullname+'</div> - <span class="commentBody">'+aC.stripSlashes(comment)+'</span></div>';
	c += '<span class="expandComment"><span class="link expandCommentLink">Expand this comment &#187;</span></span>';
	c += '<span class="collapseComment"><span class="link collapseCommentLink">Collapse this comment</span></span>';
	c += '<div class="commentTimeTools">';
	c += '<span class="commentTime" title="'+title+'">'+time+'</span></span>&nbsp;&nbsp;';
	c += '<span class="link editCommentLink">Edit</span>&nbsp;&nbsp;';
	c += '<span class="link commentLikesLink">+<span class="commentLikesCount">'+likes+'</span></span>&nbsp;&nbsp;';
	c += '<span class="commentTools"><span class="link commentLikeLink">Like</span></span>';
	c += '</div>';
	c += '</div>';
	c += '</div>';
	c += '</li>';
	return c;
},
addComment: function(cid,owner,timestamp,comment,image,name,likes,ids){
	var datetime = new Date(parseInt(timestamp + '000')), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes(), seconds = datetime.getSeconds();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	else if (hours == 0) hours = 12;
	if (minutes < 10) { minutes = '0'+minutes; }
	if (seconds < 10) { seconds = '0'+seconds; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var monthShortArray = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + seconds + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	if (aC.yesterday(datetime)) var time = "Yesterday " + time;
	else if (!aC.today(datetime)) var time = monthShortArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear();
	var likestitle = "";
	if (likes > 0) {
		if ($.inArray(aC.user.user_id,ids) > -1) {
			if (likes == 1) likestitle = "You";
			else likestitle = "You and " + likes-1 + " others";
		} else {
			if (likes == 1) likestitle = likes + " other";
			else likestitle = likes + " others";
		}
	}
	var likesA = ""; if (likes > 0) likesA = " active";
	var c = '<li id="comment-'+cid+'">';
	c += '<div class="commentWrapper">';
	c += '<div class="commentContent">';
	c += '<div class="commentImageLink"><img class="commentImg" src="'+image+'"/></div>';
	c += '<div class="commentNameBody"><div class="link commentNameLink">'+name+'</div> - <span class="commentBody">'+aC.stripSlashes(comment)+'</span></div>';
	c += '<span class="expandComment"><span class="link expandCommentLink">Expand this comment &#187;</span></span>';
	c += '<span class="collapseComment"><span class="link collapseCommentLink">Collapse this comment</span></span>';
	c += '<div class="commentTimeTools">';
	c += '<span class="commentTime" title="'+title+'">'+time+'</span>&nbsp;&nbsp;';
	if (owner == aC.user.user_id) c += '<span class="link editCommentLink">Edit</span>&nbsp;&nbsp;';
	c += '<span class="link commentLikesLink'+likesA+'" title="'+likestitle+' liked this">+<span class="commentLikesCount">'+likes+'</span></span>&nbsp;&nbsp;';
	c += '<span class="commentTools"><span class="link commentLikeLink">Like</span></span>';
	c += '</div>';
	c += '</div>';
	c += '</div>';
	c += '</li>';
	return c;
},
displayProfile: function(uid){
	if (!(uid in aC.userProfiles)) {
		$.getJSON('ajax.php', {p:"userdata",uid:uid}, function(response) {
			if (!aC.empty(response)) {
				var newerUpdates = response["data"].length;
				aC.newerUpdates = newerUpdates;
				$(".mostRecentCount").find(".mostRecentCountValue").html(newerUpdates).end().show();
				$("ul.sideNav #newsfeedLink .sideNavCount").find(".countValue").html(newerUpdates).end().show();
			}
		});
	}
	var userdata = aC.userProfiles[uid];
	// check if profile data has been loaded
	// load profile data (store last updated)
	// if old (update new data)
	
},
bbCode: function(text){
	return true;
},
checkStreamUpdates: function(){
	$.getJSON('ajax.php', {p:"stream",newest:aC.newestUpdate,hash:$.param(aC.urlParams)}, function(response) {
		if (!aC.empty(response)) {
			var newerUpdates = response["data"].length;
			aC.newerUpdates = newerUpdates;
			$(".mostRecentCount").find(".mostRecentCountValue").html(newerUpdates).end().show();
			$("ul.sideNav #newsfeedLink .sideNavCount").find(".countValue").html(newerUpdates).end().show();
		}
	});
},
uploadImageHolder: function(){
	var holder = document.getElementById('uploadImageHolder'), setdefault = false;
	holder.ondragover = function () { this.className = 'hover'; return false; };
	holder.ondragend = function () { this.className = ''; return false; };
	holder.ondrop = function (e) {
		this.className = '';
		e.preventDefault();
		$.each(e.dataTransfer.files,function(i,file){
			var reader = new FileReader();
			reader.onload = function (event) {
				holder.style.background = 'url(' + event.target.result + ') no-repeat center';
				if ($("#uploadImages input#cb_defaultImage").is(':checked')) setdefault = true;
				$.post("ajax.php", {p:"imageupload",setdefault:setdefault,imagedata:event.target.result.split(",")[1]}, function(response){
					if (response.length > 0) {
						aC.user.default_image = response;
						$(".welcome_image img").attr('src','/uploads/'+aC.user.username+'/images/thumb/'+response);
					}
				});
			};
			reader.readAsDataURL(file);
		});
		return false;
	};
}
};

Array.prototype.clear=function(){this.splice(0,this.length)};
Array.prototype.diff=function(a){return this.filter(function(i){return!(a.indexOf(i)>-1)})};
Array.prototype.random=function(){return this[aC.getRandomInt(0,this.length-1)]};

$(window).scroll(aC.onWindowScroll);
$(document.documentElement).keydown(aC.onKeyDown);
$(document).ready(function(){ aC.init();
$(".homeLink").live('click',function(){
	if (aC.logged) {
		if (aC.currentPage != "newsfeed") {
			aC.setPage('newsfeed'); aC.setTitle(); aC.setParams({}); aC.setHash(true);
			aC.loadModule('home_newsfeed');
			aC.loadModule('home_leftcol','left',function(){$("#newsfeedLink").click()});
			aC.loadModule('home_rightcol','right');
		}
	} else {
		aC.setPage('login'); aC.setTitle(); aC.setParams({}); aC.setHash(true);
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
	aC.loadModule('register'); aC.setTitle('Register'); aC.setParams({'p':'register'}); aC.setHash();
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
	$.post("ajax.php", {register:true,username:$.trim($("#reg_username").val()),password:$.trim($("#reg_password").val()),name:$.trim($("#reg_name").val()),email:$.trim($("#reg_email").val()),hometown:$.trim($("#reg_hometown").val()),city:$.trim($("#reg_city").val()),gender:$.trim($("#reg_gender").val()),bmonth:$("#reg_bmonth").val(),bday:$("#reg_bday").val(),byear:$("#reg_byear").val()}, function() {
		aC.logged = true; aC.loggedIn();
	});
});
$("#b_login").live('click',function(){
	aC.setPage('login'); aC.setTitle(); aC.setParams({}); aC.setHash(true);
	aC.loadModule('login');
});
$(".logoutLink").live('click',function(){
	aC.logout();
});
$(".welcome_image, .welcome_name, .profileLink").live('click',function(){
	if (aC.currentPage != "profile") {
		aC.setPage('profile'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'profile'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left',function(){$("#wallLink").click()});
		aC.loadModule('profile',aC.displayProfile(aC.user.user_id));
	}
});
$(".welcome_editlink").live('click',function(){
	if (aC.currentPage != "edit") {
		aC.setPage('edit'); aC.setParams({'p':'edit'}); aC.setHash();
		aC.loadModule('edit');
	}
});
$(".sideNavItem").live('click',function(){
	if (!$(this).hasClass('selectedItem')) {
		$(".sideNav").children().removeClass("selectedItem");
		$(this).addClass("selectedItem");
	}
});
$(".profileNavItem").live('click',function(){
	if (!$(this).hasClass('selectedItem')) {
		$("#profileNavList").children().removeClass("selectedItem");
		$(this).addClass("selectedItem");
	}
});
$("#newsfeedLink").live('click',function(){
	if (aC.currentPage != "newsfeed") {
		aC.setPage('newsfeed'); aC.setParams({}); aC.setHash();
		aC.loadModule('home_newsfeed');
	}
});
$("#messagesLink").live('click',function(){
	if (aC.currentPage != "messages") {
		aC.setPage('messages'); aC.setParams({'p':'messages'}); aC.setHash();
		aC.loadModule('messages');
	}
});
$("#contactsLink").live('click',function(){
	if (aC.currentPage != "contacts") {
		aC.setPage('contacts'); aC.setParams({'p':'contacts'}); aC.setHash();
		aC.loadModule('contacts');
	}
});
$("#followingLinkHome").live('click',function(){
	if (aC.currentPage != "following") {
		aC.setPage('following'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'following'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('following');
	}
});
$("#followersLinkHome").live('click',function(){
	if (aC.currentPage != "followers") {
		aC.setPage('followers'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'followers'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('followers');
	}
});
$("#profileNavWallLink").live('click',function(){
	if (aC.currentPage != "profile") {
		aC.setPage('profile'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'profile'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('profile');
	}
});
$("#profileNavAboutLink").live('click',function(){
	if (aC.currentPage != "about") {
		aC.setPage('about'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'about'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('about');
	}
});
$("#profileNavPhotosLink").live('click',function(){
	if (aC.currentPage != "photos") {
		aC.setPage('photos'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'photos'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('photos');
	}
});
$("#profileNavFollowingLink").live('click',function(){
	if (aC.currentPage != "following") {
		aC.setPage('following'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'following'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('following');
	}
});
$("#profileNavFollowersLink").live('click',function(){
	if (aC.currentPage != "followers") {
		aC.setPage('followers'); aC.setTitle(aC.user.fullname,true); aC.setParams({'p':'followers'}); aC.setHash();
		if ($("#right").is(":visible")) aC.toggleModule('right');
		aC.loadModule('profile_leftcol','left');
		aC.loadModule('followers');
	}
});
$("#header_search").live('keyup',function(){
	var val = $.trim($(this).val()).toLowerCase();
	if (aC.headerSearch != val) aC.headerSearch = val;
	else return;
	if (val.length == 0) {
		$("#search_results").hide().find("ul").empty();
		return;
	}
	if (val == "do a barrel roll" || val == "z or r twice") {
		$("body").addClass("roll");
		setTimeout('$("body").removeClass("roll")',5000);
	} else if (val == "cornify") {
		if (typeof cornify_add === "undefined") {
			$.getScript("http://www.cornify.com/js/cornify.js", function(){
				for (var i=0;i<25;i++) cornify_add();
			});
		}
	}
	$.getJSON("ajax.php", {p:"search",q:val}, function(response) {
		if (!aC.empty(response)) {
			$("#search_results").find("#noresults").hide().end().show();
			var result = aC.handleSearch(response["data"]);
			$("#search_results ul").html(result);
		} else {
			$("#search_results").find("ul").empty().end().find("#noresults").show().end().show();
		}
	});
}).live('focus',function(){
	var val = $.trim($(this).val());
	if (val.length > 0) $("#search_results").show();
}).live('blur',function(){
	setTimeout('$("#search_results").hide()',100);
});
$("#search_results li").live('click',function(){
	$("#header_search").val('');
	var uid = $(this).closest(".searchResult").prop('id').substring(8);
	aC.setParams({'p':'profile','id':uid}); aC.setHash();
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
			if (!aC.empty(response)) {
				response = $.parseJSON(response);
				if (aC.newerUpdates > 0) $(".updatenewsFeed").click();
				else aC.newestUpdate = aC.timestamp_sec;
				var s = aC.addNewStatusUpdate(response["data"].insertid,response["data"].status);
				$(".updateStatus .textarea").val('').blur();
				$("ul#stream").prepend(s).find("li.active").prev().addClass("borderActive").end().end().find("li:first").fadeIn();
			}
		});
	}
});
$("ul#stream > li").live('click',function(){
	$("ul#stream > li").removeClass('active borderActive');
	$(this).addClass('active').prev().addClass('borderActive').end().next().addClass('borderActive');
});
$(".updateEditLink").live('click',function(){
	var streamItem = $(this).closest('.streamItem');
	streamItem.find('.updateBody').attr('contenteditable','true').focus().end().find('.editUpdateBody').addClass("active");
});
$(".saveEditUpdate").live('click',function(){
	var streamItem = $(this).closest('.streamItem');
	var sid = streamItem.attr('id').substring(7);
	var body = streamItem.find('.updateBody').html();
	$.post("ajax.php", {p:"updatestatus",sid:sid,data:body}, function(response) {
		if (!aC.empty(response)) {
			streamItem.find('.updateBody').removeAttr('contenteditable').end().find('.editUpdateBody').removeClass("active");
			$.each(aC.streamUpdates, function(i,v){
				if (v.sid == sid) aC.streamUpdates[i].data = body;
			});
		}
	});
});
$(".cancelEditUpdate").live('click',function(){
	var streamItem = $(this).closest('.streamItem');
	var sid = streamItem.attr('id').substring(7);
	streamItem.find('.updateBody').removeAttr('contenteditable').end().find('.editUpdateBody').removeClass("active");
	$.each(aC.streamUpdates, function(i,v){
		if (v.sid == sid) streamItem.find('.updateBody').html(aC.stripSlashes(v.data));
	});
});
$(".updateLikeLink").live('click',function(){
	var streamItem = $(this).closest('.streamItem');
	var sid = streamItem.attr('id').substring(7);
	$.post("ajax.php", {p:"like",oid:sid}, function(response) {
		if (!aC.empty(response)) {
			var updateLikes = streamItem.find(".updateLikes");
			if (streamItem.hasClass("active")) {
				updateLikes.find(".count").html(parseInt(updateLikes.find(".count").html())+1);
			} else {
				updateLikes.find(".count").html('1').end().addClass("active");
			}
		}
	});
});
$(".updateCommentLink").live('click',function(){
	$(this).parent().parent().find(".updateComment").addClass("active").find('.textarea').focus();
});
$(".updateComment .textarea").live('focus',function(){
	$(this).css('max-height',300).parents().eq(4).find(".buttonTools").show();
}).live('blur',function(){
	if ($(this).val() == "") {
		$(this).css('max-height',16).parents().eq(4).find(".buttonTools").hide();
	}
});
$(".comment").live('click',function(){
	var streamItem = $(this).closest('.streamItem');
	var comment = $.trim(streamItem.find(".updateComment .textarea").val());
	var sid = streamItem.attr('id').substring(7);
	if (comment.length > 0) {
		$.post("ajax.php", {p:"comment",data:comment,oid:sid}, function(response) {
			if (!aC.empty(response)) {
				var c = aC.addNewComment(response["data"],comment);
				streamItem.find(".updateComment .textarea").val('').blur();
				streamItem.find(".streamComments").append(c);
				streamItem.find(".updateComments").addClass("active");
				streamItem.find(".streamComments li:last").fadeIn();
			}
		});
	}
});
$(".updateNewsFeed").live('click',function(){
	$(".mostRecentCount").hide().find(".mostRecentCountValue").empty();
	$("ul.sideNav #newsfeedLink .sideNavCount").hide().find(".countValue").empty();
	aC.newerUpdates = 0;
	$(".loadingMostRecent").css('display','block');
	$.getJSON('ajax.php', {p:"stream",newest:aC.newestUpdate}, function(response) {
		if (!aC.empty(response)) {
			var s = aC.addStatusUpdates(response["data"],"new");
			$("ul#stream").prepend(s).find("li.active").prev().addClass("borderActive");
			aC.streamUpdates = response["data"].concat(aC.streamUpdates);
		}
		$(".loadingMostRecent").hide();
		
	});
});
$(".loadMore").live('click',function(){
	if (aC.newestUpdate == 0) return;
	$(this).hide();
	$(".loadingMore").css('display','block');
	$.getJSON('ajax.php', {p:"stream",oldest:aC.oldestUpdate}, function(response) {
		if (!aC.empty(response)) {
			var s = aC.addStatusUpdates(response["data"],"old");
			$("ul#stream").append(s).find("li.active").next().addClass("borderActive");
			if (response["data"].length < 30) {
				$("ul#stream").append('<div class="moreUpdates">No More Updates Available!</div>');
				aC.moreUpdates = false;
				$(".loadMoreLink").hide();
			}
			aC.streamUpdates.concat(response["data"]);
		} else {
			if (aC.moreUpdates && aC.newestUpdate > 0) {
				$("ul#stream").append('<div class="moreUpdates">No More Updates Available!</div>');
				aC.moreUpdates = false;
				$(".loadMoreLink").hide();
			}
		}
		$(".loadingMore").hide();
		$(".loadMore").show();
	});
});
$("#b_uploadImages").live('click',function(){
	if (aC.currentPage != "uploadImages") {
		aC.setPage('uploadImages'); aC.setParams({'p':'uploadImages'}); aC.setHash();
		aC.loadModule('uploadImages',aC.uploadImageHolder);
	}
});
$(".profile_image").live('click',function(){
	if (aC.currentPage != "photos") {
		aC.setPage('photos'); aC.setParams({'p':'photos'}); aC.setHash();
		aC.loadModule('photos');
	} else {
		aC.setPage('profile'); aC.setParams({'p':'profile'}); aC.setHash();
		aC.loadModule('profile');
	}
});
});

function encode(a){if(a===null||typeof a==="undefined"){return""}var b=(a+'');var c="",start,end,stringl=0;start=end=0;stringl=b.length;for(var n=0;n<stringl;n++){var d=b.charCodeAt(n);var e=null;if(d<128){end++}else if(d>127&&d<2048){e=String.fromCharCode((d>>6)|192)+String.fromCharCode((d&63)|128)}else{e=String.fromCharCode((d>>12)|224)+String.fromCharCode(((d>>6)&63)|128)+String.fromCharCode((d&63)|128)}if(e!==null){if(end>start){c+=b.slice(start,end)}c+=e;start=end=n+1}}if(end>start){c+=b.slice(start,stringl)}return c}
function secure(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var c,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!a){return a}a=encode(a+'');do{c=a.charCodeAt(i++);o2=a.charCodeAt(i++);o3=a.charCodeAt(i++);bits=c<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b.charAt(h1)+b.charAt(h2)+b.charAt(h3)+b.charAt(h4)}while(i<a.length);enc=tmp_arr.join('');switch(a.length%3){case 1:enc=enc.slice(0,-2)+'==';break;case 2:enc=enc.slice(0,-1)+'=';break}return enc}

window.log=function(){
	log.history=log.history||[];
	log.history.push(arguments);
	if(this.console)console.log(Array.prototype.slice.call(arguments));
};

$(document).ajaxError(function(e,xhr,settings,exception){
	aC.handleError({
		"text":"Ajax Error\nin: "+settings.url+" \nerror: "+exception,
		"type":"Ajax Error",
		"in":settings.url,
		"error":exception,
		"arguments":arguments
	});
});

return true;
}

window.$&&main()||(function(){
var jq=document.createElement("script");
jq.setAttribute("type","text/javascript");jq.setAttribute("src","jquery.js");jq.onload=main;
jq.onreadystatechange=function(){if(this.readyState=="complete"||this.readyState=="loaded")main()};
(document.getElementsByTagName("head")[0]||document.documentElement).appendChild(jq);
})();