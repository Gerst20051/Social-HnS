<?php
$sql = array();

array_push($sql,'CREATE TABLE IF NOT EXISTS `login` (
`user_id` INT( 10 ) NOT NULL AUTO_INCREMENT ,
`username` VARCHAR( 20 ) NOT NULL ,
`pass` VARBINARY( 41 ) NOT NULL ,
`access_level` TINYINT( 1 ) NOT NULL ,
`last_login` DATE NOT NULL ,
`date_joined` DATE NOT NULL ,
`logins` INT( 11 ) NOT NULL ,
PRIMARY KEY (`user_id` )
) ENGINE = MYISAM');

array_push($sql,'CREATE TABLE IF NOT EXISTS `info` (
`user_id` INT( 10 ) NOT NULL ,
`firstname` VARCHAR( 20 ) NOT NULL ,
`middlename` VARCHAR( 20 ) NOT NULL ,
`lastname` VARCHAR( 20 ) NOT NULL ,
`email` VARCHAR( 50 ) NOT NULL ,
`gender` ENUM(  \'Male\',  \'Female\' ) NOT NULL ,
`birth_month` INT( 2 ) NOT NULL ,
`birth_day` INT( 2 ) NOT NULL ,
`birth_year` INT( 4 ) NOT NULL ,
`current_city` VARCHAR( 50 ) NOT NULL ,
`hometown` VARCHAR( 50 ) NOT NULL ,
`default_image` VARCHAR( 255 ) NOT NULL ,
PRIMARY KEY (`user_id` )
) ENGINE = MYISAM');

array_push($sql,'CREATE TABLE IF NOT EXISTS `socialhns` (
`user_id` INT( 10 ) NOT NULL ,
`following` TEXT NOT NULL ,
`followers` TEXT NOT NULL ,
`contacts` TEXT NOT NULL ,
PRIMARY KEY (`user_id` )
) ENGINE = MYISAM');

array_push($sql,'CREATE TABLE IF NOT EXISTS `stream` (
`sid` INT( 10 ) NOT NULL ,
`owner` INT( 10 ) NOT NULL ,
`timestamp` INT( 10 ) NOT NULL ,
`type` INT( 1 ) NOT NULL ,
`data` TEXT NOT NULL ,
`likes` INT( 11 ) NOT NULL ,
`comments` MEDIUMTEXT NOT NULL ,
`shares` MEDIUMTEXT NOT NULL ,
`block` TEXT NOT NULL ,
`ids` TEXT NOT NULL ,
PRIMARY KEY (`sid` )
) ENGINE = MYISAM');

array_push($sql,'CREATE TABLE IF NOT EXISTS `users_online` (
`timestamp` INT( 10 ) NOT NULL ,
`user_id` INT( 10 ) NOT NULL ,
`username` VARCHAR( 20 ) NOT NULL ,
`file` VARCHAR( 100 ) NOT NULL
) ENGINE = MYISAM');

mysql_create_db('hns') or die('Cannot create database');
mysql_select_db('hns') or die('Cannot select database');

foreach ($sql as $query) {
	//mysql_query($query) or die(mysql_error());
}