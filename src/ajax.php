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
if (isset($_POST['logout'])) {
logOut();
}
if (isset($_GET['p'])) {
if ($_GET['p'] == 'header') {
?>
<div id="search" class="lfloat">
<form class="f_search" action="#" method="post" onsubmit="return false">
<input id="header_search" type="text" autocomplete="off" name="header_search" placeholder="Find people"/>
</form>
</div>
<div id="nav" class="rfloat">
<ul id="pageNav">
<li id="navHome"><a href="#" id="home" class="topNavLink">Home</a></li>
<li id="navProfile"><a href="#" id="profile" class="topNavLink">Profile</a></li>
<li id="navLogout"><a href="#" id="logout" class="topNavLink">Logout</a></li>
</ul>
</div>
<?php
} elseif ($_GET['p'] == 'home_newsfeed') {
?>
<div id="home_newsfeed">
<div id="newsfeed_header">
<div class="streamHeader">
<div class="headerTop cf">
<div class="headerActions"><a class="updateNewsFeed" href="#"><span id="mostRecent" class="buttonText">Most Recent</span></a></div>
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
<div class="buttonTools">
<ul class="toolList rfloat">
<li class="listItem"><label class="shareButton" for="share"><input value="Share" type="submit" id="share"/></label></li>
</ul>
</div>
</form>
</div>
<div id="home_stream">

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
} elseif ($_GET['p'] == 'profile_rightcol') {
?>
<div id="profile_rightcol">
Profile Right Column
</div>
<?php
} elseif ($_GET['p'] == 'wall') {
?>
<div id="wall">
Wall
</div>
<?php
} elseif ($_GET['p'] == 'info') {
?>
<div id="info">
Info
</div>
<?php
} elseif ($_GET['p'] == 'photos') {
?>
<div id="photos">
Photos
</div>
<?php
}
}
} else {
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
	$db->insert(array('username'=>$username,'password'=>$password,'access_level'=>1,'last_login'=>date('Y-m-d'),'date_joined'=>date('Y-m-d'),'last_login_ip'=>$ip),'login');
	$db->insert(array('user_id'=>$db->insertID(),'firstname'=>$firstname,'middlename'=>$middlename,'lastname'=>$lastname,'email'=>$email,'gender'=>$gender,'hometown'=>$hometown,'community'=>$community,'birth_month'=>$bmonth,'birth_day'=>$bday,'birth_year'=>$byear,'logins'=>1));
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
loggedIn();
}
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
?>