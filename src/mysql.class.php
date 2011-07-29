<?php
require 'mysql.config.php';
class MySQL {
private $result;
public function __construct($host = MYSQL_HOST, $user = MYSQL_USER, $password = MYSQL_PASSWORD, $database = MYSQL_DATABASE) {
	if (!$con = mysql_connect($host,$user,$password)) {
		throw new Exception('Error connecting to the server');
	}
	if (!mysql_select_db($database,$con)) {
		throw new Exception('Error selecting database');
	}
}

public function query($query) {
	if (!$this->result = mysql_query($query)) {
		throw new Exception('Error performing query '.$query);
	}
}

public function sfquery($args) {
	if (count($args) < 2) return false;
	$query = array_shift($args);
	$args = array_map('mysql_real_escape_string',$args);
	array_unshift($args,$query);
	$query = call_user_func_array('sprintf',$args);
	if (!$this->result = mysql_query($query)) {
		throw new Exception('Error performing query '.$query);
	}
}

public function numRows() {
	if ($this->result) return mysql_num_rows($this->result);
	return false;
}

public function fetchRow() {
	while ($row = mysql_fetch_array($this->result)) {
		return $row;
	}
	return false;
}

public function fetchAll($table='info') {
	$this->query('SELECT * FROM '.$table);
	$rows = array();
	while ($row = $this->fetchRow()) {
		$rows[] = $row;
	}
	return $rows;
}

public function fetchRows() {
	$rows = array();
	while ($row = $this->fetchRow()) {
		$rows[] = $row;
	}
	return $rows;
}

public function fetchAssocRow() {
	if ($row = mysql_fetch_assoc($this->result)) return $row;
	else return false;
}

public function insert($table, $params) {
	$values = array_map('mysql_real_escape_string',array_values($params));
	$keys = array_keys($params);
	$this->query('INSERT INTO `'.$table.'` (`'.implode('`,`', $keys).'`) VALUES (\''.implode('\',\'', $values).'\')');
}

public function insertID() {
	return mysql_insert_id($this->result);
}

public function affectedRows() {
	return mysql_affected_rows();
}
}
?>