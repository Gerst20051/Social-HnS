<?php
session_start();

if (isset($_GET['p']) && $_GET['p'] == 'logged') {
	if (isset($_SESSION['logged'])) die('true'); else die('0');
}

include 'validip.inc.php';
include 'mysql.class.php';

function loggedIn() {
	$args = func_get_args();
	if (count($args) == 1) {
		$row = $args[0];
		$_SESSION['logged'] = true;
		$_SESSION['user_id'] = $row['user_id'];
		$_SESSION['username'] = $row['username'];
		$_SESSION['access_level'] = $row['access_level'];
		$_SESSION['last_login'] = $row['last_login'];
		$_SESSION['last_login_ip'] = $row['last_login_ip'];
		if (isset($row['middlename']) && !empty($row['middlename'])) $_SESSION['fullname'] = $row['firstname'] . ' ' . $row['middlename'] . ' ' . $row['lastname'];
		else $_SESSION['fullname'] = $row['firstname'] . ' ' . $row['lastname'];
		$_SESSION['firstname'] = $row['firstname'];
		if (isset($row['middlename']) && !empty($row['middlename'])) $_SESSION['middlename'] = $row['middlename'];
		$_SESSION['lastname'] = $row['lastname'];
		if (isset($row['default_image']) && !empty($row['default_image'])) $_SESSION['default_image'] = $row['default_image'];
		die('true');
	} else {
	
	}
}

function logOut() {
	session_unset();
	session_destroy();
}

if (isset($_SESSION['logged'])) {
loggedIn();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
if (isset($_POST['logout'])) {
logOut();
} elseif (isset($_POST['p'])) {
if ($_POST['p'] == 'status') {
try {
	$db = new MySQL();
	$db->insert('stream', array(
		'owner'=>$_SESSION['user_id'],
		'timestamp'=>time(),
		'type'=>1,
		'data'=>strip_tags($_POST['data'])
	));
	if ($db->affectedRows() == 1) {
		die($db->insertID());
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_POST['p'] == 'comment') {
die('1');
/*
try {
	$db = new MySQL();
	$db->insert('stream', array(
		'owner'=>$_SESSION['user_id'],
		'timestamp'=>time(),
		'data'=>strip_tags($_POST['data'])
	));
	if ($db->affectedRows() == 1) {
		die($db->insertID());
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
*/
} elseif ($_POST['p'] == 'like') {

}
}
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET') {
if (isset($_GET['p'])) {
if ($_GET['p'] == 'userdata') {
try {
	$db = new MySQL();
	if (!isset($_GET['uid'])) $uid = $_SESSION['user_id'];
	else $uid = $_GET['uid'];
	$db->query('SELECT u.user_id,u.username,i.firstname,i.middlename,i.lastname,i.followers,i.default_image FROM login u JOIN info i ON u.user_id = i.user_id WHERE u.user_id = '.$uid);
	if ($db->numRows() == 1) {
		header('Content-Type: text/javascript; charset=utf8');
		$rows = $db->fetchRow();
		print_r(json_encode($rows));
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_GET['p'] == 'header') {
?>
<div id="search" class="lfloat">
<form class="f_search" action="#" method="post" onsubmit="return false">
<input id="header_search" type="text" autocomplete="off" name="header_search" placeholder="Find people"/>
</form>
</div>
<div id="nav" class="rfloat">
<ul id="pageNav">
<li id="navHome"><a href="#" id="headerHomeLink" class="topNavLink homeLink">Home</a></li>
<li id="navProfile"><a href="#" id="headerProfileLink" class="topNavLink profileLink">Profile</a></li>
<li id="navLogout"><a href="#" id="headerLogoutLink" class="topNavLink logoutLink">Logout</a></li>
</ul>
</div>
<?php
} elseif ($_GET['p'] == 'home_newsfeed') {
?>
<div id="home_newsfeed">
<header class="streamHeader">
<div id="newsfeed_header">
<div class="streamHeading">
<div class="headerTop cf">
<div class="headerActions"><a class="updateNewsFeed" href="#"><span class="loadingMostRecent"></span><span id="mostRecent" class="buttonText">Most Recent</span></a></div>
<div><div class="headerTitle"><i class="img"></i>News Feed</div></div>
</div>
</div>
</div>
<div class="updateStatus cf">
<form class="f_updateStatus" action="#" method="post" onsubmit="return false">
<div id="composer">
<div class="messageBox">
<div class="wrap">
<div class="innerWrap">
<textarea class="textarea" placeholder="Share what's new..." cols="30" rows="5"></textarea>
</div>
</div>
</div>
</div>
<div class="buttonTools cf">
<ul class="toolList rfloat">
<li class="listItem"><label class="shareButton" for="share"><input value="Share" type="submit" id="share"/></label></li>
</ul>
</div>
</form>
</div>
</header>
<div id="home_stream">
<div id="uiStream">
<ul id="stream">
<li id="update-3">
<div class="updateWrapper">
<div class="updateTitle">
<a href="#" class="updateImageLink"><img class="updateImg" src="/uploads/Andrew/images/thumb/IMG_1271.JPG"/></a>
<div class="updateNameDate">
<a href="#" class="updateNameLink">Andrew Gerst</a>
<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateDateLink" target="_blank" title="July 27, 2011 11:11:10 PM">Yesterday 11:11 PM</a></span>
</div>
</div>
<div class="updateBody">
Here's my recommendation if you're looking to do something besides G+ tonight. Go watch this Kurzweil / Singularity documentary. Technology will accelerate exponentially. Within 25 years, computers will have consciousness. Humans will soon be bionic.
</div>
<div class="updateAttachments">
</div>
<div class="updateActions">
<ul class="streamActions">
<li class="updateLinks"><a href="#" class="updateLikeLink">Like</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateCommentLink">Comment</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateShareLink">Share</a></li>
<li class="updateLikes active"><a href="#" class="updateLikesLink">421 likes</a> by You and 420 others</li>
<li class="updateShares active"><a href="#" class="updateSharesLink">205 shares</a> - Abe Buhlmann, Abhinav Choudhury, Adam McLaughlin, Aid, and Andrew Gerst</li>
<li class="updateOlderComments clickable active"><a href="#" class="updateOlderCommentsLink">161 older comments</a> from Victor Espinoza, Amal Babu, Bud Hoffman, and Andrew Gerst</li>
<li class="updateComments active">
<ul class="streamComments">
<li id="comment-2">
<div class="commentWrapper">
<div class="commentContent">
<a href="#" class="commentImageLink"><img class="commentImg" src="/uploads/Andrew/images/thumb/IMG_1271.JPG"/></a>
<div class="commentNameBody">
<a href="#" class="commentNameLink">Phillip Tunstall</a> - <span class="commentBody">Watch "Ghost in the Shell" to be better prepared...</span>
</div>
<span class="expandComment"><a href="#" class="expandCommentLink">Expand this comment &#187;</a></span>
<span class="collapseComment"><a href="#" class="collapseCommentLink">Collapse this comment</a></span>
<div class="commentTimeTools">
<span class="commentTime" title="Jul 28, 2011 9:13:25 AM">9:13 AM</span></span>&nbsp;&nbsp;
<span class="commentTools"><a href="#" class="commentLikeLink">Like</a></span>
</div>
</div>
</div>
</li>
<li id="comment-3">
<div class="commentWrapper">
<div class="commentContent">
<a href="#" class="commentImageLink"><img class="commentImg" src="/uploads/Andrew/images/thumb/IMG_1271.JPG"/></a>
<div class="commentNameBody">
<a href="#" class="commentNameLink">Kai Xu</a> - <span class="commentBody">Never was a fan of the Top News feed on Facebook. Seeing that start to happen here is.. disappointing. If g+ would like to differentiate itself from Facebook, I would set that as an option, and default to sorting by post date. Being able to set a circle as the default view for the Stream would be an awesome addition.

If I really wanted an inflexible, non-user friendly Top News feed.. I'd go elsewhere.</span>
</div>
<span class="expandComment"><a href="#" class="expandCommentLink">Expand this comment &#187;</a></span>
<span class="collapseComment"><a href="#" class="collapseCommentLink">Collapse this comment</a></span>
<div class="commentTimeTools">
<span class="commentTime" title="Jul 28, 2011 9:13:25 AM">9:13 AM</span></span>&nbsp;&nbsp;
<span class="commentTools"><a href="#" class="commentLikeLink">Like</a></span>
</div>
</div>
</div>
</li>
<li id="comment-4">
<div class="commentWrapper">
<div class="commentContent">
<a href="#" class="commentImageLink"><img class="commentImg" src="/uploads/Andrew/images/thumb/IMG_1271.JPG"/></a>
<div class="commentNameBody">
<a href="#" class="commentNameLink">Kai Xu</a> - <span class="commentBody">Why would a women with big breast be automatically assumed to be not intelligent.

I am not sure how the word sexist come into the comments. But If you type the word "sexy" in Google, you will find mostly women. In many studies/experiments it was found that "female with male" and "female only" erotic images excited both men and women, while "men only" erotic images only excited a minor portion of females. So at the end of the day the term "sexy" can be assumed to apply mostly on females. Women aren't as excited by the visual sense as men are. Thus why men and women are different! because their brains work different.

I believe some tech people on Google+ are way too analytical. Yes, every person is different, and some have been desensitized to "sexy stuff". But at the end of the day I believe Tom was just trying to get a point across that Google is "sexy". The simplest, commercial, and catchy method of making it understandable that Google is SEXY was a photo of the sort Tom posted.</span>
</div>
<span class="expandComment"><a href="#" class="expandCommentLink">Expand this comment &#187;</a></span>
<span class="collapseComment"><a href="#" class="collapseCommentLink">Collapse this comment</a></span>
<div class="commentTimeTools">
<span class="commentTime" title="Jul 28, 2011 9:13:25 AM">9:13 AM</span></span>&nbsp;&nbsp;
<span class="commentTools"><a href="#" class="commentLikeLink">Like</a></span>
</div>
</div>
</div>
</li>
</ul>
</li>
<li class="updateNewComments clickable active"><a href="#" class="updateNewCommentsLink">3 more comments</a> from Adam Philpott, Ross Sheingold and Brian Braucasfdsafsdfsfd</li>
<li class="updateComment active">
<div class="updateCommentBox">
<form class="f_updateComment" action="#" method="post" onsubmit="return false">
<div id="updateComposer">
<div class="commentBox">
<div class="wrap">
<div class="innerWrap">
<textarea class="textarea" placeholder="Add a comment..." cols="30" rows="4"></textarea>
</div>
</div>
</div>
</div>
<div class="buttonTools cf">
<ul class="toolList rfloat">
<li class="listItem"><label class="commentButton" for="comment"><input value="Add comment" type="submit" id="comment"/></label></li>
</ul>
</div>
</form>
</div>
</li>
</ul>
</div>
</div>
</li>
<li id="update-2">
<div class="updateWrapper">
<div class="updateTitle">
<a href="#" class="updateImageLink"><img class="updateImg" src="/uploads/Andrew/images/thumb/IMG_1271.JPG"/></a>
<div class="updateNameDate">
<a href="#" class="updateNameLink">Andrew Gerst</a>
<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateDateLink" target="_blank" title="July 27, 2011 11:11:10 PM">Yesterday 11:11 PM</a></span>
</div>
</div>
<div class="updateBody">
Here's my recommendation if you're looking to do something besides G+ tonight. Go watch this Kurzweil / Singularity documentary. Technology will accelerate exponentially. Within 25 years, computers will have consciousness. Humans will soon be bionic.
</div>
<div class="updateAttachments">
</div>
<div class="updateActions">
<ul class="streamActions">
<li class="updateLinks"><a href="#" class="updateLikeLink">Like</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateCommentLink">Comment</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateShareLink">Share</a></li>
<li class="updateLikes"></li>
<li class="updateShares"></li>
<li class="updateOlderComments clickable"></li>
<li class="updateComments">
<ul class="streamComments">
<li></li>
</ul>
</li>
<li class="updateNewComments clickable"></li>
<li class="updateComment">
<div class="updateCommentBox">
<form class="f_updateComment" action="#" method="post" onsubmit="return false">
<div id="updateComposer">
<div class="commentBox">
<div class="wrap">
<div class="innerWrap">
<textarea class="textarea" placeholder="Add a comment..." cols="30" rows="4"></textarea>
</div>
</div>
</div>
</div>
<div class="buttonTools cf">
<ul class="toolList rfloat">
<li class="listItem"><label class="commentButton" for="comment"><input value="Add comment" type="submit" id="comment"/></label></li>
</ul>
</div>
</form>
</div>
</li>
</ul>
</div>
</div>
</li>
<li id="update-1">
<div class="updateWrapper">
<div class="updateTitle">
<a href="#" class="updateImageLink"><img class="updateImg" src="/uploads/Andrew/images/thumb/IMG_1271.JPG"/></a>
<div class="updateNameDate">
<a href="#" class="updateNameLink">Andrew Gerst</a>
<span class="updateDate">&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateDateLink" target="_blank" title="July 27, 2011 11:11:10 PM">Yesterday 11:11 PM</a></span>
</div>
</div>
<div class="updateBody">
Here's my recommendation if you're looking to do something besides G+ tonight. Go watch this Kurzweil / Singularity documentary. Technology will accelerate exponentially. Within 25 years, computers will have consciousness. Humans will soon be bionic.
</div>
<div class="updateAttachments">
</div>
<div class="updateActions">
<ul class="streamActions">
<li class="updateLinks"><a href="#" class="updateLikeLink">Like</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateCommentLink">Comment</a>&nbsp;&nbsp;-&nbsp;&nbsp;<a href="#" class="updateShareLink">Share</a></li>
<li class="updateLikes"></li>
<li class="updateShares"></li>
<li class="updateOlderComments clickable"></li>
<li class="updateComments">
<ul class="streamComments">
<li></li>
</ul>
</li>
<li class="updateNewComments clickable"></li>
<li class="updateComment"></li>
</ul>
</div>
</div>
</li>
</ul>
<div class="loadMoreLink">
<span class="loadMore">More</span>
<span class="loadingMore"><span class="loadingMoreText">Loading...</span></span>
</div>
</div>
</div>
</div>
<?php
} elseif ($_GET['p'] == 'home_leftcol') {
	if (isset($_SESSION['default_image'])) $image = '/uploads/' . $_SESSION['username'] . '/images/thumb/' . $_SESSION['default_image'];
	else $image = 'i/mem/default.jpg';
?>
<div id="home_leftcol">
<div id="welcome_box" class="cf">
<a class="welcome_image" href="#profile"><img class="img" src="<?php echo $image; ?>"/></a>
<div id="welcome_content">
<a class="welcome_name" href="#profile"><?php echo $_SESSION['fullname']; ?></a>
<a class="welcome_editlink" href="#editprofile">Edit My Profile</a>
</div>
</div>
<div id="left_navigation">
<div id="leftNav">
<div id="coreAppsNav">
<ul class="sideNav">
<li class="sideNavItem selectedItem">
<a id="newsFeedLink" class="item" href="#">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">News Feed</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</a>
<span class="loadingIndicator"></span>
</li>
<li class="sideNavItem">
<a id="messagesLink" class="item" href="#messages">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Messages</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</a>
<span class="loadingIndicator"></span>
</li>
<li class="sideNavItem">
<a id="friendsLink" class="item" href="#friends">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Friends</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</a>
<span class="loadingIndicator"></span>
</li>
</ul>
</div>
</div>
</div>
</div>
<?php
} elseif ($_GET['p'] == 'home_rightcol') {
?>
<div id="home_rightcol">
Main Right Column!
</div>
<?php
} elseif ($_GET['p'] == 'messages') {
?>
<div id="messages">
Messages
</div>
<?php
} elseif ($_GET['p'] == 'friends') {
?>
<div id="friends">
Friends
</div>
<?php
} elseif ($_GET['p'] == 'edit') {
?>
<div id="edit">
Edit Profile
</div>
<?php
} elseif ($_GET['p'] == 'profile') {
	echo '<div id="profile">';
	echo '<h1>'.$_SESSION['fullname'].'</h1>';
	echo '</div>';
} elseif ($_GET['p'] == 'profile_leftcol') {
	if (isset($_SESSION['default_image'])) $image = '/uploads/' . $_SESSION['username'] . '/images/thumb/' . $_SESSION['default_image'];
	else $image = 'i/mem/default.jpg';
?>
<div id="profile_leftcol">
<div id="profile_box" class="cf">
<a class="profile_image" href="#photos"><img class="img" src="<?php echo $image; ?>"/></a>
</div>
<div id="left_navigation">
<div id="leftNav">
<div id="profileNav">
<ul class="sideNav">
<li class="sideNavItem selectedItem">
<a id="wallLink" class="item" href="#">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Wall</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</a>
<span class="loadingIndicator"></span>
</li>
<li class="sideNavItem">
<a id="infoLink" class="item" href="#messages">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Info</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</a>
<span class="loadingIndicator"></span>
</li>
<li class="sideNavItem">
<a id="photosLink" class="item" href="#friends">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Photos</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</a>
<span class="loadingIndicator"></span>
</li>
<li class="sideNavItem">
<a id="friendsLink" class="item" href="#friends">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Friends</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</a>
<span class="loadingIndicator"></span>
</li>
</ul>
</div>
</div>
</div>
</div>
<?php
} elseif ($_GET['p'] == 'wall') {
?>
<div id="wall">
Wall
</div>
<?php
} elseif ($_GET['p'] == 'about') {
?>
<div id="about">
About
</div>
<?php
} elseif ($_GET['p'] == 'photos') {
?>
<div id="photos">
Photos
</div>
<?php
} elseif ($_GET['p'] == 'stream') {
try {
	$db = new MySQL();
	$db->query('SELECT * FROM stream WHERE owner IN ('.$_SESSION['user_id'].')');
	// $query = 'SELECT * FROM stream WHERE owner IN ('.$_SESSION['user_id'].',`'.implode('`,`', $followers).'`)';
	if ($db->numRows() > 0) {
		header('Content-Type: text/javascript; charset=utf8');
		$rows = $db->fetchRows();
		print_r('('.json_encode($rows).');');
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_GET['p'] == 'followers') {
try {
	$db = new MySQL();
	$db->query();
	if ($db->numRows() > 0) {
		$row = $db->fetchRows();
		
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
}
}
}
} else {
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
if (isset($_POST['login'])) {
try {
	$db = new MySQL();
	$db->sfquery(array('SELECT * FROM login u JOIN info i ON u.user_id = i.user_id WHERE username = "%s" AND password = PASSWORD("%s")',$_POST['username'],substr(base64_decode($_POST['password']),3)));
	if ($db->numRows() > 0) {
		$row = $db->fetchAssocRow();
		loggedIn($row);
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
}
if (isset($_POST['register'])) {
function ucname($string) {
	$string = ucwords(strtolower($string));
	foreach (array('-', '\'', 'Mc') as $delimiter) {
		if (strpos($string, $delimiter) !== false) {
			$string = implode($delimiter, array_map('ucfirst', explode($delimiter, $string)));
		}
	}
	return $string;
}
$username = (isset($_POST['username'])) ? $_POST['username'] : '';
$password = (isset($_POST['password'])) ? $_POST['password'] : '';
$name = (isset($_POST['name'])) ? ucname($_POST['name']) : '';
$email = (isset($_POST['email'])) ? $_POST['email'] : '';
$hometown = (isset($_POST['hometown'])) ? $_POST['hometown'] : '';
$community = (isset($_POST['city'])) ? $_POST['city'] : '';
$gender = (isset($_POST['gender'])) ? $_POST['gender'] : '';
$bmonth = (isset($_POST['bmonth'])) ? $_POST['bmonth'] : '';
$bday = (isset($_POST['bday'])) ? $_POST['bday'] : '';
$byear = (isset($_POST['byear'])) ? $_POST['byear'] : '';
if (empty($community)) $community = $hometown;
list($firstname, $middlename, $lastname) = split(' ',$name);
if (!isset($lastname)) { $lastname = $middlename; unset($middlename); }
try {
	$db = new MySQL();
	$db->insert('login', array(
		'username'=>$username,
		'access_level'=>1,
		'last_login'=>date('Y-m-d'),
		'date_joined'=>date('Y-m-d'),
		'last_login_ip'=>$ip
	));
	$user_id = $db->insertID();
	$db->query('UPDATE login SET password = PASSWORD("'.mysql_real_escape_string($password).'") WHERE user_id = '.$user_id);
	$db->insert('info', array(
		'user_id'=>$user_id,
		'firstname'=>$firstname,
		'middlename'=>$middlename,
		'lastname'=>$lastname,
		'email'=>$email,
		'gender'=>$gender,
		'hometown'=>$hometown,
		'community'=>$community,
		'birth_month'=>$bmonth,
		'birth_day'=>$bday,
		'birth_year'=>$byear,
		'logins'=>1
	));
	if ($db->affectedRows() == 1) {
		$_SESSION['logged'] = true;
		$_SESSION['user_id'] = $user_id;
		$_SESSION['username'] = $username;
		$_SESSION['access_level'] = 1;
		$_SESSION['last_login'] = date('Y-m-d');
		$_SESSION['last_login_ip'] = $ip;
		if (isset($middlename) && !empty($middlename)) $_SESSION['fullname'] = $firstname . ' ' . $middlename . ' ' . $lastname;
		else $_SESSION['fullname'] = $firstname . ' ' . $lastname;
		$_SESSION['firstname'] = $row['firstname'];
		if (isset($row['middlename']) && !empty($row['middlename'])) $_SESSION['middlename'] = $middlename;
		$_SESSION['lastname'] = $lastname;
		die('true');
	} else die('false');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
loggedIn();
}
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET') {
if (isset($_GET['p'])) {
if ($_GET['p'] == 'username') {
try {
	$db = new MySQL();
	$db->query('SELECT username FROM login WHERE username = "'.$_GET['username'].'"');
	echo $db->numRows();
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_GET['p'] == 'login') {
?>
<div id="login">
<form id="f_login" action="#" method="post" onsubmit="return false">
<input type="hidden" name="login"/>
<div><label for="lusername">Username:</label><input type="text" name="lusername" id="lusername" value=""/></div>
<div><label for="lpassword">Password:</label><input type="password" name="lpassword" id="lpassword" value=""/></div>
<div class="buttonTools">
<ul class="toolList lfloat">
<li class="listItem"><label class="loginButton" for="b_login_splash"><input value="Login" type="submit" id="b_login_splash"/></label></li>
<li class="listItem"><label class="registerButton" for="b_register_splash"><input value="Register" type="button" id="b_register_splash"/></label></li>
</ul>
</div>
</form>
</div>
<?php
} elseif ($_GET['p'] == 'register') {
?>
<div id="register">
<header>Register</header>
<form id="f_register" action="#" method="post" onsubmit="return false">
<input type="hidden" name="register"/>
<div><label for="reg_username">Username:</label><input type="text" name="reg_username" id="reg_username" value=""/></div>
<div><label for="reg_password">Password:</label><input type="password" name="reg_password" id="reg_password" value=""/></div>
<div><label for="reg_name">Full Name:</label><input type="text" name="reg_name" id="reg_name" value=""/></div>
<div><label for="reg_email">Email:</label><input type="email" name="reg_email" id="reg_email" value=""/></div>
<div><label for="reg_hometown">Hometown:</label><input type="text" name="reg_hometown" id="reg_hometown" value=""/></div>
<div><label for="reg_city">Community:</label><input type="text" name="reg_city" id="reg_city" value="" placeholder="Current Location, School, Business, or Group"/></div>
<div>
<label for="reg_gender">Gender:</label>
<select name="reg_gender" id="reg_gender">
<option value="0"></option>
<option value="male">Male</option>
<option value="female">Female</option>
</select> 
</div>
<div>
<label for="reg_bmonth">Birth Date:</label>
<select name="reg_bmonth" id="reg_bmonth">
<option value="0"></option>
<option value="1">January</option>
<option value="2">February</option>
<option value="3">March</option>
<option value="4">April</option>
<option value="5">May</option>
<option value="6">June</option>
<option value="7">July</option>
<option value="8">August</option>
<option value="9">September</option>
<option value="10">October</option>
<option value="11">November</option>
<option value="12">December</option>
</select>
<select name="reg_bday" id="reg_bday"><option value="0"></option></select>
<select name="reg_byear" id="reg_byear"><option value="0"></option></select>
</div>
<div class="buttonTools">
<ul class="toolList lfloat">
<li class="listItem"><label class="loginButton" for="b_login"><input value="Login" type="submit" id="b_login"/></label></li>
<li class="listItem"><label class="registerButton" for="b_register"><input value="Register" type="submit" id="b_register"/></label></li>
</ul>
</div>
</form>
</div>
<script>
(function(){
var bday = "", byear = "";
for (i = 1; i <= 31; i++) { bday += "<option value=\""+i+"\">"+i+"</option>"; }
for (i = 2011; i >= 1902; i--) { byear += "<option value=\""+i+"\">"+i+"</option>"; }
$("#reg_bday").append(bday);
$("#reg_byear").append(byear);
})();
</script>
<?php
}
}
}
}
?>