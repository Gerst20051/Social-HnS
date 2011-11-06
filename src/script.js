function main() {

Array.prototype.clear=function(){this.splice(0,this.length)};

window.log = function() {
	log.history = log.history || [];
	log.history.push(arguments);
	if (this.console) console.log(Array.prototype.slice.call(arguments));
};

var aC = {
title: "Social HnS",
logged: false,
loginFocus: false,
registerFocus: false,
currentPage: "",
profileID: 0,
loadedLeft: [],
loadedContent: [],
loadedProfile: [],
loadedRight: [],
user: {},
profileUser: {},
streamUpdates: {},
newestUpdate: 0,
oldestUpdate: 0,
newerUpdates: 0,
moreUpdates: true,
currentTime: 0,
streamInterval: false,
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
		if (!aC.logged) {
			aC.loadModule('login');
			$.post('ajax.php',{offlineUpdate:true,hash:aC.getHash()});
		} else aC.loggedIn();
	});
},
loadModule: function(module){
	if (!arguments[1] || $.isFunction(arguments[1])) var target = "content";
	else var target = arguments[1];
	if (module == "login" && aC.logged) {
		aC.loadedLeft.clear();
		aC.loadedContent.clear();
		aC.loadedProfile.clear();
		aC.loadedRight.clear();
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
loggedIn: function(){
	if (aC.logged) {
		$.getJSON('ajax.php', {p:"userdata"}, function(response) {
			aC.user = response;
			if (aC.user.middlename != "") aC.user.fullname = aC.user.firstname+' '+aC.user.middlename+' '+aC.user.lastname;
			else aC.user.fullname = aC.user.firstname+' '+aC.user.lastname;
		});
		if (aC.empty(aC.getHash())) {
			$("#content").empty();
			aC.setPage('newsfeed');
			aC.loadModule('home_newsfeed');
			aC.loadModule('home_leftcol','left');
			aC.loadModule('home_rightcol','right');
			aC.loadModule('header','header');
			$("#left").animate({width:200}, 600);
			$("#right").animate({width:210}, 600);
			$("#body").animate({left:200}, 600, function(){ $("#doc").addClass("in").removeClass("out"); $('.updateNewsFeed').click(); });
		} else {
			// handle module loading
			$("#content").empty();
			aC.setPage('newsfeed');
			aC.loadModule('home_newsfeed');
			aC.loadModule('home_leftcol','left');
			aC.loadModule('home_rightcol','right');
			aC.loadModule('header','header');
			$("#left").animate({width:200}, 600);
			$("#right").animate({width:210}, 600);
			$("#body").animate({left:200}, 600, function(){ $("#doc").addClass("in").removeClass("out"); $('.updateNewsFeed').click(); });
		}
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
		aC.setPage('login'); aC.setTitle(); aC.setHash(); aC.loadModule('login'); aC.logged = false;
		$("#body").animate({left:0}, 400, function(){ $("#doc").addClass("out").removeClass("in"); });
		aC.profileID = 0;
		aC.loadedLeft.clear();
		aC.loadedContent.clear();
		aC.loadedProfile.clear();
		aC.loadedRight.clear();
		aC.user = {};
		aC.profileUser = {};
		aC.streamUpdates = {};
		aC.newestUpdate = 0;
		aC.oldestUpdate = 0;
		aC.newerUpdates = 0;
		aC.moreUpdates = true;
		clearInterval(aC.streamInterval);
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
	else { aC.checkUsername($.trim(username.val())); if (username.hasClass('error')) e = true; }
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
	s += '<a href="#" class="updateImageLink"><img class="updateImg" src="/uploads/'+aC.user.username+'/images/thumb/'+aC.user.default_image+'"/></a>';
	s += '<div class="updateNameDate"><a href="#" class="updateNameLink">'+aC.user.fullname+'</a>';
	s += '<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateDateLink" target="_blank" title="'+title+'">'+time+'</a></span>';
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
	var s = ""; aC.streamUpdates = data; aC.currentTime = aC.timestamp_sec();
	$.each(data,function(i,v){
		if (type == "new") {
			if (i == 0) aC.newestUpdate = v.timestamp;
			if (aC.oldestUpdate == 0 && i == data.length-1) aC.oldestUpdate = v.timestamp;
		} else if (type == "old") {
			if (i == data.length-1) aC.oldestUpdate = v.timestamp;
		}
		var currentDatetime = new Date(), currentDate = currentDatetime.getDate();
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
		var comments = ""; var vcomments = 0;
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
				likes = v.likes + " others";
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
		var cA = ""; if (vcomments != "") cA = " active";
		var newcA = ""; if (newComments != "") newcA = " active";
		var ucA = ""; if (v.likes > 0 || shares != "" || oldComments != "" || comments != "" || newComments != "") ucA = " active";		
		s += '<li id="update-'+v.sid+'" class="streamItem">';
		s += '<div class="updateWrapper"><div class="updateTitle">';
		s += '<a href="#" class="updateImageLink"><img class="updateImg" src="'+image+'"/></a>';
		s += '<div class="updateNameDate"><a href="#" class="updateNameLink">'+fullname+'</a>';
		s += '<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateDateLink" target="_blank" title="'+title+'">'+time+'</a></span>';
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
		s += '<li class="updateShares'+sharesA+'"><span class="link updateSharesLink"><span class="count">'+vshares+'</span> <span class="updateSharesCount">'+sharesCount+'</span></a> - <span class="list">'+shares+'</span></li>';
		s += '<li class="updateOlderComments clickable'+oldcA+'"><span class="link updateOlderCommentsLink"><span class="count">'+voldComments+'</span> older <span class="updateOldCommentsCount">'+oldCommentsCount+'</span></span> from <span class="list">'+oldComments+'</span></li>';
		s += '<li class="updateComments'+cA+'"><ul class="streamComments"><li>'+comments+'</li></ul></li>';
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
	c += '<a href="#" class="commentImageLink"><img class="commentImg" src="/uploads/'+aC.user.username+'/images/thumb/'+aC.user.default_image+'"/></a>';
	c += '<div class="commentNameBody">';
	c += '<a href="#" class="commentNameLink">'+aC.user.fullname+'</a> - <span class="commentBody">'+comment+'</span>';
	c += '</div>';
	c += '<span class="expandComment"><span class="link expandCommentLink">Expand this comment &#187;</span></span>';
	c += '<span class="collapseComment"><span class="link collapseCommentLink">Collapse this comment</span></span>';
	c += '<div class="commentTimeTools">';
	c += '<span class="commentTime" title="'+title+'">'+time+'</span></span>&nbsp;&nbsp;';
	c += '<span class="commentTools"><span class="link commentLikeLink">Like</span></span>';
	c += '</div>';
	c += '</div>';
	c += '</div>';
	c += '</li>';
	return c;
},
addComments: function(cid,timestamp,comment,image,name){
	var datetime = new Date(timestamp), hours = datetime.getHours(), prefix = "AM", minutes = datetime.getMinutes(), seconds = datetime.getSeconds();
	if (hours > 12) { hours = hours - 12; prefix = "PM"; }
	else if (hours == 0) hours = 12;
	if (minutes < 10) { minutes = '0'+minutes; }
	if (seconds < 10) { seconds = '0'+seconds; }
	var monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dayArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var timesecs = hours + ":" + minutes + ":" + seconds + " " + prefix;
	var title = dayArray[datetime.getDay()] + ", " + monthArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear() + " " + timesecs;
	var time = hours + ":" + minutes + " " + prefix;
	if (aC.yesterday(datetime)) var time = "Yesterday " + time;
	else if (!aC.today(datetime)) var time = monthShortArray[datetime.getMonth()] + " " + datetime.getDate() + ", " + datetime.getFullYear();
	var c = '<li id="comment-'+cid+'">';
	c += '<div class="commentWrapper">';
	c += '<div class="commentContent">';
	c += '<a href="#" class="commentImageLink"><img class="commentImg" src="'+image+'"/></a>';
	c += '<div class="commentNameBody">';
	c += '<a href="#" class="commentNameLink">'+name+'</a> - <span class="commentBody">'+comment+'</span>';
	c += '</div>';
	c += '<span class="expandComment"><span class="link expandCommentLink">Expand this comment &#187;</span></span>';
	c += '<span class="collapseComment"><span class="link collapseCommentLink">Collapse this comment</span></span>';
	c += '<div class="commentTimeTools">';
	c += '<span class="commentTime" title="'+title+'">'+time+'</span></span>&nbsp;&nbsp;';
	c += '<span class="commentTools"><span class="link commentLikeLink">Like</span></span>';
	c += '</div>';
	c += '</div>';
	c += '</div>';
	c += '</li>';
	return c;
},
bbCode: function(text){
	return true;
},
checkStreamUpdates: function(){
	$.getJSON('ajax.php', {p:"stream",newest:aC.newestUpdate,hash:aC.getHash()}, function(response) {
		if (response != "0") {
			var newerUpdates = response["data"].length;
			aC.newerUpdates = newerUpdates;
			$(".mostRecentCount").find(".mostRecentCountValue").html(newerUpdates).end().show();
			$("ul.sideNav #newsFeedLink .sideNavCount").find(".countValue").html(newerUpdates).end().show();
		}
	});
}
};

$(document.documentElement).keydown(aC.onKeyDown);
$(document).ready(function(){ aC.init();
$(".homeLink").live('click',function(){
	if (aC.logged) {
		if (aC.currentPage != "newsfeed") {
			aC.setPage('newsfeed'); aC.setTitle(); aC.setHash();
			aC.loadModule('home_newsfeed');
			aC.loadModule('home_leftcol','left');
			aC.loadModule('home_rightcol','right');
			$("#newsFeedLink").click();
		}
	} else {
		aC.setPage('login'); aC.setTitle(); aC.setHash();
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
	aC.loadModule('register'); aC.setTitle('Register'); aC.setHash('register');
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
	aC.setPage('login'); aC.setTitle(); aC.setHash();
	aC.loadModule('login');
});
$("#headerLogoutLink").live('click',function(){
	aC.logout();
});
$(".welcome_image, .welcome_name, .profileLink").live('click',function(){
	if (aC.currentPage != "profile") {
		aC.setPage('profile'); aC.setTitle(aC.user.fullname,true); aC.setHash('profile');
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
		aC.setPage('profile'); aC.setTitle(aC.user.fullname,true); aC.setHash('profile');
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
				response = $.parseJSON(response);
				if (aC.newerUpdates > 0) $(".updateNewsFeed").click();
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
	streamItem.find('.updateBody').removeAttr('contenteditable').end().find('.editUpdateBody').removeClass("active");
	var body = streamItem.find('.updateBody').html();
	$.each(aC.streamUpdates, function(i,v){
		if (v.sid == sid) aC.streamUpdates[i].data = body;
	});
	// update post in database
});
$(".cancelEditUpdate").live('click',function(){
	var streamItem = $(this).closest('.streamItem');
	var sid = streamItem.attr('id').substring(7);
	streamItem.find('.updateBody').removeAttr('contenteditable').end().find('.editUpdateBody').removeClass("active");
	$.each(aC.streamUpdates, function(i,v){
		if (v.sid == sid) streamItem.find('.updateBody').html(v.data);
	});
});
$(".updateLikeLink").live('click',function(){
	var streamItem = $(this).closest('.streamItem');
	var sid = streamItem.attr('id').substring(7);
	$.post("ajax.php", {p:"like",oid:sid}, function(response) {
		if (response != "0") {
			var updateLikes = streamItem.find(".updateLikes"); alert(updateLikes.html());
			if (streamItem.hasClass("active")) {
				updateLikes.find(".count").html(parseInt(updateLikes.find(".count").html())+1);
			} else {
				updateLikes.find(".count").html('1');
				updateLikes.addClass("active");
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
			if (response != "0") {
				var c = aC.addNewComment(response,comment);
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
	$("ul.sideNav #newsFeedLink .sideNavCount").hide().find(".countValue").empty();
	aC.newerUpdates = 0;
	$(".loadingMostRecent").css('display','block');
	$.getJSON('ajax.php', {p:"stream",newest:aC.newestUpdate}, function(response) {
		if (response != "0") {
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
		if (response != "0") {
			var s = aC.addStatusUpdates(response["data"],"old");
			$("ul#stream").append(s).find("li.active").next().addClass("borderActive");
			if (response["data"].length < 30) {
				$("ul#stream").append('<div class="moreUpdates">No More Updates Available!</div>');
				aC.moreUpdates = false;
				$(".loadMoreLink").hide();
			}
			aC.streamUpdates.concat(response["data"]);
			alert(aC.streamUpdates.length);
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
});

function encode(a){if(a===null||typeof a==="undefined"){return""}var b=(a+'');var c="",start,end,stringl=0;start=end=0;stringl=b.length;for(var n=0;n<stringl;n++){var d=b.charCodeAt(n);var e=null;if(d<128){end++}else if(d>127&&d<2048){e=String.fromCharCode((d>>6)|192)+String.fromCharCode((d&63)|128)}else{e=String.fromCharCode((d>>12)|224)+String.fromCharCode(((d>>6)&63)|128)+String.fromCharCode((d&63)|128)}if(e!==null){if(end>start){c+=b.slice(start,end)}c+=e;start=end=n+1}}if(end>start){c+=b.slice(start,stringl)}return c}
function secure(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var c,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!a){return a}a=encode(a+'');do{c=a.charCodeAt(i++);o2=a.charCodeAt(i++);o3=a.charCodeAt(i++);bits=c<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b.charAt(h1)+b.charAt(h2)+b.charAt(h3)+b.charAt(h4)}while(i<a.length);enc=tmp_arr.join('');switch(a.length%3){case 1:enc=enc.slice(0,-2)+'==';break;case 2:enc=enc.slice(0,-1)+'=';break}return enc}

return true;
}

window.$ && main() || (function() {
	var jquery = document.createElement("script");
	jquery.setAttribute("type","text/javascript");
	jquery.setAttribute("src","jquery.js");
	jquery.onload = main;
	jquery.onreadystatechange = function() {
		if (this.readyState == "complete" || this.readyState == "loaded") main();
	};
	(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(jquery);
})();