<?php
require_once 'config.inc.php';

if (LOCAL) {
	define('MYSQL_HOST','');
	define('MYSQL_USER','');
	define('MYSQL_PASSWORD','');
	define('MYSQL_DATABASE','');
} else {
	define('MYSQL_HOST','');
	define('MYSQL_USER','');
	define('MYSQL_PASSWORD','');
	define('MYSQL_DATABASE','');
}
?>