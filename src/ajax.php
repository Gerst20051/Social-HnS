<?php
session_start();

if (isset($_GET['p']) && $_GET['p'] == 'logged') {
	if (isset($_SESSION['logged'])) die('true'); else die('0');
}

require_once 'config.inc.php';
require_once 'mysql.class.php';

function isint($mixed) {
	return (preg_match('/^\d*$/', $mixed) == 1);
}

function loggedIn() {
	$args = func_get_args();
	if (count($args) == 1) {
		$row = $args[0];
		$_SESSION['logged'] = true;
		$_SESSION['user_id'] = $row['user_id'];
		$_SESSION['username'] = $row['username'];
		$_SESSION['access_level'] = $row['access_level'];
		$_SESSION['last_login'] = $row['last_login'];
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

function usersOnline() {

}

if (isset($_SESSION['logged'])) {
loggedIn();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
if (isset($_POST['logout'])) {
logOut();
} elseif (isset($_POST['p'])) {
if ($_POST['p'] == 'status') {
try {
	$status = strip_tags($_POST['data']);
	$db = new MySQL();
	$db->insert('stream', array(
		'owner'=>$_SESSION['user_id'],
		'timestamp'=>time(),
		'type'=>1,
		'data'=>addslashes($status),
		'likes'=>0
	));
	if ($db->affectedRows() == 1) {
		$db_insertid = $db->insertID();
		$urlex = '/\b(([^:\/?#]+):)(\/\/([^\/?#]*))([^?#]*)(\?([^#]*))?(#(.*))?/i';
		$contentArray = explode(" ",$status);
		$linkArray = array();
		foreach ($contentArray as $content) {
			if (preg_match($urlex,$content,$matches)) array_push($linkArray,$matches);
		}
		foreach ($linkArray as $link) {
			if ($link[4] != "" && strlen($link[4]) > 3) {
				$db->query('SELECT * FROM stream WHERE type = 4 AND data = "'.mysql_real_escape_string($link[0]).'"');
				if ($db->numRows() == 0) {
					$db->insert('stream', array(
						'timestamp'=>time(),
						'type'=>4,
						'data'=>$link[0],
						'likes'=>1
					));
				} else {
					$oid = $db->fetchRow();
					$db->query('UPDATE stream SET likes = likes+1 WHERE sid = '.$oid);
				}
			}
		}
		$final = array(
			"data"=>array(
				"insertid"=>$db_insertid,
				"status"=>addslashes($status)
			),
			"error"=>false
		);
		print_r(json_encode($final));
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_POST['p'] == 'updatestatus') {
try {
	$status = strip_tags($_POST['data']);
	$db = new MySQL();
	$db->query('UPDATE stream SET data = \''.mysql_real_escape_string(addslashes($status)).'\' WHERE sid = '.$_POST['sid']);
	if ($db->affectedRows() == 1) {
		$final = array(
			"error"=>false
		);
		print_r(json_encode($final));
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_POST['p'] == 'like') {
try {
	$db = new MySQL();
	$db->query('SELECT likes,ids FROM stream WHERE sid = '.$_POST['oid']);
	if ($db->numRows() == 1) {
		$result = $db->fetchAssocRow();
		$result["ids"] = json_decode($result["ids"]);
		if (is_array($result["ids"])) {
			if (!in_array($_SESSION['user_id'],$result["ids"])) {
				$ids = $result["ids"];
				array_push($ids,$_SESSION['user_id']);
				$likes = $result["likes"]+1;
			} else die('0');
		} else {
			$ids = array($_SESSION['user_id']);
			$likes = 1;
		}
		$db->query('UPDATE stream SET likes = likes+1, ids = \''.json_encode($ids).'\' WHERE sid = '.$_POST['oid']);
		if ($db->affectedRows() == 1) {
			header('Content-Type: application/json; charset=utf8');
			$final = array(
				"sid"=>$_POST['oid'],
				"likes"=>$likes,
				"ids"=>$ids,
				"error"=>false
			);
			print_r(json_encode($final));
		} else die('0');
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_POST['p'] == 'comment') {
try {
	$comment = strip_tags($_POST['data']);
	$db = new MySQL();
	$db->query('SELECT comments FROM stream WHERE sid = '.$_POST['oid']);
	if ($db->numRows() == 1) {
		$comments = $db->fetchAssocRow();
		$comments = json_decode($comments["comments"]);
		$data = array(
			'sid'=>$_POST['oid'],
			'owner'=>$_SESSION['user_id'],
			'timestamp'=>time(),
			'data'=>addslashes($comment),
			'likes'=>0,
			'ids'=>array()
		);
		if (!is_array($comments)) $comments = array();
		array_push($comments,$data);
		$db->query('UPDATE stream SET comments = \''.mysql_real_escape_string(json_encode($comments)).'\' WHERE sid = '.$_POST['oid']);
		if ($db->affectedRows() == 1) {
			header('Content-Type: application/json; charset=utf8');
			$final = array(
				"data"=>count($comments),
				"error"=>false
			);
			print_r(json_encode($final));
		} else die('0');
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_POST['p'] == 'share') {

} elseif ($_POST['p'] == 'imageupload') {
$img = imagecreatefromstring(base64_decode($_POST['imagedata']));
if ($img) {
	$uploaddir = DIR."/uploads/".$_SESSION['username']."/images/";
	$thumbuploaddir = $uploaddir."thumb/";
	if (!is_dir($uploaddir)) mkdir($uploaddir,0777,true) or die("Upload directory could not be created.");
	if (!is_dir($thumbuploaddir)) mkdir($thumbuploaddir,0777,true) or die("Thumb directory could not be created.");
	$random = time().mt_rand().".jpg";
	$name = $uploaddir.$random;
	imagejpeg($img,$name);
	list($width,$height) = getimagesize($name);
	$thumb_width = 200;
	$ratio = $width / $thumb_width;
	$thumb_height = round($height / $ratio);
	$thumb = imagecreatetruecolor($thumb_width,$thumb_height);
	imagecopyresampled($thumb,$img,0,0,0,0,$thumb_width,$thumb_height,$width,$height);
	$name = $thumbuploaddir.$random;
	imagejpeg($thumb,$name);
	imagedestroy($thumb);
	imagedestroy($img);
	if (!isset($_SESSION['default_image']) || $_POST['setdefault'] == "true") {
		$_SESSION['default_image'] = $random;
		try {
			$db = new MySQL();
			$db->query('UPDATE info SET default_image = "' . mysql_real_escape_string($random) . '" WHERE user_id = ' . $_SESSION['user_id'] . ' LIMIT 1');
		} catch(Exception $e) {
			echo $e->getMessage();
			exit();
		}
		echo $random;
	}
}
} elseif ($_POST['p'] == 'follow') {
try {
	$status = $_POST['uid'];
	$db = new MySQL();
	$db->query('SELECT following FROM socialhns WHERE user_id = '.$_SESSION['user_id'].' LIMIT 1');
	if ($db->numRows() == 1) {
		$row = $db->fetchAssocRow();
		$following = json_decode($row["following"]);
		if (is_array($following)) {
			if (!in_array($_POST['uid'],$following)) {
				array_push($following,$_POST['uid']);
			} else die('0');
		} else $following = array($_POST['uid']);
		$db->query('UPDATE socialhns SET following = \''.mysql_real_escape_string(json_encode($following)).'\' WHERE user_id = '.$_SESSION['user_id']);
		if ($db->affectedRows() == 1) {
			$row = $db->fetchAssocRow();
			$following = json_decode($row["following"]);
			if (is_array($following)) {
				if (!in_array($_POST['uid'],$following)) {
					array_push($following,$_POST['uid']);
				} else die('0');
			} else $following = array($_POST['uid']);
			$db->query('UPDATE socialhns SET following = \''.mysql_real_escape_string(json_encode($following)).'\' WHERE user_id = '.$_SESSION['user_id']);
			if ($db->affectedRows() == 1) {
				header('Content-Type: application/json; charset=utf8');
				$final = array(
					"error"=>false
				);
				print_r(json_encode($final));
			} else die('0');
		} else die('0');
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_POST['p'] == 'unfollow') {

}
}
} elseif ($_SERVER['REQUEST_METHOD'] == 'GET') {
if (isset($_GET['p'])) {
if ($_GET['p'] == 'userdata') {
try {
	$db = new MySQL();
	if (!isset($_GET['uid'])) $uid = $_SESSION['user_id'];
	else $uid = $_GET['uid'];
	$db->query('SELECT u.user_id,u.username,i.firstname,i.middlename,i.lastname,i.default_image,h.following,h.followers FROM (login u JOIN info i ON u.user_id = i.user_id) JOIN socialhns h ON u.user_id = h.user_id WHERE u.user_id = '.$uid.' LIMIT 1');
	if ($db->numRows() == 1) {
		if (!isset($_GET['uid'])) {
			header('Content-Type: application/json; charset=utf8');
			print_r(json_encode($db->fetchAssocRow()));
		} else {
		
		}
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} if ($_GET['p'] == 'search') {
try {
	if (!isset($_GET['q']) || empty($_GET['q'])) die('0');
	$db = new MySQL();
	$q = trim($_GET['q']);
	list($firstname, $middlename, $lastname) = split(' ',$q);
	if (!isset($lastname) && !isset($middlename)) {
		unset($middlename); unset($lastname);
		$query = 'i.firstname LIKE "'.$firstname.'%" OR i.middlename LIKE "'.$firstname.'%" OR i.lastname LIKE "'.$firstname.'%" OR u.username LIKE "'.$firstname.'%"';
	} elseif (!isset($lastname)) {
		$lastname = $middlename; unset($middlename);
		$query = 'i.firstname LIKE "'.$firstname.'%" AND i.lastname LIKE "'.$lastname.'%" OR i.firstname LIKE "'.$firstname.'%" AND i.middlename LIKE "'.$lastname.'%"';
	} else {
		$query = 'i.firstname LIKE "'.$firstname.'%" AND i.middlename LIKE "'.$middlename.'%" AND i.lastname LIKE "'.$lastname.'%"';
	}
	$db->query('SELECT u.user_id,u.username,i.firstname,i.middlename,i.lastname,i.default_image,i.hometown,i.current_city,h.followers FROM (login u JOIN info i ON u.user_id = i.user_id) JOIN socialhns h ON u.user_id = h.user_id WHERE '.$query.' ORDER BY i.firstname LIMIT 8');
	if ($db->numRows() > 0) {
		header('Content-Type: application/json; charset=utf8');
		$rows = $db->fetchAssocRows();
		$final = array(
			"data"=>$rows,
			"error"=>false
		);
		print_r(json_encode($final));
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif ($_GET['p'] == 'stream') {
$timestamp = time();
$timeout = $timestamp-600;
try {
	$db = new MySQL();
	$db->sfquery(array('INSERT INTO users_online VALUES ("%s","%s","%s","%s")',$timestamp,$_SESSION['user_id'],$_SESSION['username'],'/socialhns/#'.$_GET['hash']));
	$db->query("DELETE FROM users_online WHERE timestamp < $timeout");
	$db->query('SELECT following FROM socialhns WHERE user_id = '.$_SESSION['user_id']);
	$following = array();
	for ($i=1;$i<201;$i++) array_push($following,$i);
	if (!empty($following)) $ownerlist = $_SESSION['user_id'].','.implode(',', $following);
	else $ownerlist = $_SESSION['user_id'];
	if (!isset($_GET['sid'])) {
		$limit = ' LIMIT 20';
		if (isset($_GET['newest']) && isint($_GET['newest'])) {
			$newest = $_GET['newest'];
			$timestamp = 'AND s.timestamp > '.$newest.' ';
		} elseif (isset($_GET['oldest']) && isint($_GET['oldest'])) {
			$oldest = $_GET['oldest'];
			$timestamp = 'AND s.timestamp < '.$oldest.' ';
			$limit = ' LIMIT 30';
		}
		$db->query('SELECT s.sid,s.owner,s.timestamp,s.type,s.data,s.likes,s.comments,s.shares,s.block,s.ids,u.username,i.firstname,i.middlename,i.lastname,i.default_image FROM (stream s JOIN login u ON s.owner = u.user_id) JOIN info i ON s.owner = i.user_id WHERE s.owner IN ('.$ownerlist.') '.$timestamp.'AND s.type = 1 AND s.block NOT LIKE "%,'.$_SESSION['user_id'].',%" ORDER BY s.sid DESC'.$limit);
	} else {
		$db->query('SELECT s.sid,s.owner,s.timestamp,s.type,s.data,s.likes,s.comments,s.shares,s.block,s.ids,u.username,i.firstname,i.middlename,i.lastname,i.default_image FROM (stream s JOIN login u ON s.owner = u.user_id) JOIN info i ON s.owner = i.user_id WHERE s.owner IN ('.$ownerlist.') AND s.type = 1 AND s.block NOT LIKE "%,'.$_SESSION['user_id'].',%" AND s.sid = '.$_GET['sid'].' LIMIT 1');
	}
	if ($db->numRows() > 0) {
		header('Content-Type: application/json; charset=utf8');
		$rows = $db->fetchAssocRows();
		for ($i=0;$i<count($rows);$i++) {
			unset($rows[$i]["block"]);
			$comments = json_decode($rows[$i]["comments"]);
			if (is_array($comments)) {
				foreach($comments as $key=>$comment) {
					$db->query('SELECT u.username,i.firstname,i.middlename,i.lastname,i.default_image FROM login u JOIN info i ON u.user_id = i.user_id WHERE u.user_id = '.$comment->owner);
					$comments[$key]->user = $db->fetchAssocRow();
				}
				if (!empty($comments)) $rows[$i]["comments"] = $comments;
			}
		}
		$final = array(
			"data"=>$rows,
			"error"=>false
		);
		print_r(json_encode($final));
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
<div id="search_results">
<ul id="search_results_list"></ul>
<div id="noresults">No Results</div>
</div>
</div>
<div id="nav" class="rfloat">
<ul id="pageNav">
<li id="navHome" class="topNavLink homeLink">Home</li>
<li id="navProfile" class="topNavLink profileLink">Profile</li>
<li id="navLogout" class="topNavLink logoutLink">Logout</li>
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
<div class="headerActions"><div class="link updateNewsFeed"><span class="loadingMostRecent"></span><span id="mostRecent" class="buttonText">Most Recent</span><span class="mostRecentCount"><span class="mostRecentCountValue">0</span></span></div></div>
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
<ul id="stream"></ul>
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
<div class="welcome_image"><img class="img" src="<?php echo $image; ?>"/></div>
<div id="welcome_content">
<div class="welcome_name link"><?php echo $_SESSION['fullname']; ?></div>
<div class="welcome_editlink link">Edit My Profile</div>
</div>
</div>
<div id="left_navigation">
<div id="leftNav">
<div id="coreAppsNav">
<ul class="sideNav">
<li id="sideNavNewsfeedLink" class="sideNavItem selectedItem">
<div id="newsfeedLink" class="item">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">News Feed</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</div>
<span class="loadingIndicator"></span>
</li>
<li id="sideNavMessagesLink" class="sideNavItem">
<div id="messagesLink" class="item">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Messages</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</div>
<span class="loadingIndicator"></span>
</li>
<li id="sideNavContactsLink" class="sideNavItem">
<div id="contactsLink" class="item">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Contacts</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</div>
<span class="loadingIndicator"></span>
</li>
<li id="sideNavFollowingLinkHome" class="sideNavItem">
<div id="followingLinkHome" class="item">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Following</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</div>
<span class="loadingIndicator"></span>
</li>
<li id="sideNavFollowersLinkHome" class="sideNavItem">
<div id="followersLinkHome" class="item">
<span class="sideNavImg"><i class="img"></i></span>
<span class="sideNavLink">Followers</span>
<span class="sideNavCount"><span class="countValue">0</span></span>
</div>
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
} elseif ($_GET['p'] == 'contacts') {
?>
<div id="contacts">
Contacts
</div>
<?php
} elseif ($_GET['p'] == 'edit') {
?>
<div id="edit">
Edit Profile
<div class="buttonTools">
<ul class="toolList lfloat">
<li class="listItem"><label class="uploadImageButton" for="b_uploadImages"><input value="Upload Images" type="submit" id="b_uploadImages"/></label></li>
</ul>
</div>
</div>
<?php
} elseif ($_GET['p'] == 'profile') {
?>
<div id="profile">
<div id="profileHeader">
<div id="profileFollowButton" class="buttonTools rfloat"><ul class="toolList lfloat"><li class="listItem"><label class="followButton" for="b_follow"><input value="Follow" type="submit" id="b_follow"/></label></li></ul></div>
<span id="profileName">Andrew Gerst</span>
</div>
<div id="profileNav">
<ul id="profileNavList">
<li id="profileNavWallLink" class="profileNavItem selectedItem"><div>Wall</div><div class="invisible bold duplicate">Wall</div></li>
<li id="profileNavAboutLink" class="profileNavItem"><div>About</div><div class="invisible bold duplicate">About</div></li>
<li id="profileNavPhotosLink" class="profileNavItem"><div>Photos</div><div class="invisible bold duplicate">Photos</div></li>
<li id="profileNavFollowingLink" class="profileNavItem"><div>Following</div><div class="invisible bold duplicate">Following</div></li>
<li id="profileNavFollowersLink" class="profileNavItem"><div>Followers</div><div class="invisible bold duplicate">Followers</div></li>
</ul>
</div>
<div id="profileContent">
<div id="wall">
Wall
</div>
<div id="about">
<ul id="aboutList">
<li id="occupation" class="aboutListItem">
<div class="heading">Occupation</div>
<div class="content">Computer Programmer</div>
</li>
<li id="current_city" class="aboutListItem">
<div class="heading">Current City</div>
<div class="content">Chapel Hill, NC</div>
</li>
<li id="hometown" class="aboutListItem">
<div class="heading">Hometown</div>
<div class="content">Baltimore, MD</div>
</li>
<li id="email" class="aboutListItem">
<div class="heading">Email</div>
<div class="content">gerst20051@aol.com</div>
</li>
<li id="birthday" class="aboutListItem">
<div class="heading">Birthdate</div>
<div class="content">August 12, 1993</div>
</li>
<li id="gender" class="aboutListItem">
<div class="heading">Gender</div>
<div class="content">Male</div>
</li>
</ul>
<div id="websiteLinks">
</div>
</div>
<div id="photos">
Photos
</div>
<div id="following">
Following
</div>
<div id="followers">
Followers
</div>
</div>
</div>
<?php
} elseif ($_GET['p'] == 'profile_leftcol') {
?>
<div id="profile_leftcol">
<div id="profile_box" class="cf">
<div class="profile_image"><img class="img" src=""/></div>
</div>
<div id="left_navigation">
<div id="leftNav">
<div id="leftNavBothFollow"><div class="leftNavHeader">Both Following</div><div class="leftNavContent"></div></div>
<div id="leftNavFollowing"><div class="leftNavHeader">Following</div><div class="leftNavContent"></div></div>
<div id="leftNavBothFollowers"><div class="leftNavHeader">Followers</div><div class="leftNavContent"></div></div>
</div>
</div>
</div>
<?php
}
}
}
} else {
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
if (isset($_POST['login'])) {
try {
	$db = new MySQL();
	$db->sfquery(array('SELECT * FROM login u JOIN info i ON u.user_id = i.user_id WHERE username = "%s" AND pass = PASSWORD("%s") LIMIT 1',$_POST['username'],substr(base64_decode($_POST['password']),3)));
	if ($db->numRows() == 1) {
		$row = $db->fetchAssocRow();
		loggedIn($row);
	} else die('0');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
} elseif (isset($_POST['register'])) {
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
$current_city = (isset($_POST['city'])) ? $_POST['city'] : '';
$gender = (isset($_POST['gender'])) ? $_POST['gender'] : '';
$bmonth = (isset($_POST['bmonth'])) ? $_POST['bmonth'] : '';
$bday = (isset($_POST['bday'])) ? $_POST['bday'] : '';
$byear = (isset($_POST['byear'])) ? $_POST['byear'] : '';
if (empty($hometown)) $hometown = $current_city;
list($firstname, $middlename, $lastname) = split(' ',$name);
if (!isset($lastname)) { $lastname = $middlename; $middlename = ''; }
try {
	$db = new MySQL();
	$db->insert('login', array(
		'username'=>$username,
		'access_level'=>1,
		'last_login'=>date('Y-m-d'),
		'date_joined'=>date('Y-m-d'),
		'logins'=>1
	));
	$user_id = $db->insertID();
	$db->query('UPDATE login SET pass = PASSWORD("'.mysql_real_escape_string($password).'") WHERE user_id = '.$user_id);
	$db->insert('info', array(
		'user_id'=>$user_id,
		'firstname'=>$firstname,
		'middlename'=>$middlename,
		'lastname'=>$lastname,
		'email'=>$email,
		'gender'=>$gender,
		'hometown'=>$hometown,
		'current_city'=>$current_city,
		'birth_month'=>$bmonth,
		'birth_day'=>$bday,
		'birth_year'=>$byear
	));
	$db->insert('socialhns', array('user_id'=>$user_id));
	if (LOCAL) {
		$db->insert('hns_desktop', array('user_id'=>$user_id));
		$db->insert('homenetspaces', array('user_id'=>$user_id));
	}
	if ($db->affectedRows() == 1) {
		$_SESSION['logged'] = true;
		$_SESSION['user_id'] = $user_id;
		$_SESSION['username'] = $username;
		$_SESSION['access_level'] = 1;
		$_SESSION['last_login'] = date('Y-m-d');
		if (isset($middlename) && !empty($middlename)) {
			$_SESSION['fullname'] = $firstname . ' ' . $middlename . ' ' . $lastname;
			$_SESSION['middlename'] = $middlename;
		} else $_SESSION['fullname'] = $firstname . ' ' . $lastname;
		$_SESSION['firstname'] = $firstname;
		$_SESSION['lastname'] = $lastname;
		die('true');
	} else die('false');
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
loggedIn();
} elseif (isset($_POST['offlineUpdate'])) {
$timestamp = time();
$timeout = $timestamp-600;
try {
	$db = new MySQL();
	$db->sfquery(array('INSERT INTO users_online VALUES ("%s","%s","%s","%s")',$timestamp,0,'guest','/socialhns/#'.$_POST['hash']));
	$db->query("DELETE FROM users_online WHERE timestamp < $timeout");
} catch(Exception $e) {
	echo $e->getMessage();
	exit();
}
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
<div><label for="reg_city">Current City:</label><input type="text" name="reg_city" id="reg_city" value=""/></div>
<div><label for="reg_hometown">Hometown:</label><input type="text" name="reg_hometown" id="reg_hometown" value=""/></div>
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
var bday="",byear="";
for (i=1;i<=31;i++){bday+="<option value=\""+i+"\">"+i+"</option>";}
for (i=2011;i>=1902;i--){byear+="<option value=\""+i+"\">"+i+"</option>";}
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