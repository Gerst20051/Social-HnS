<?php
class MySQL {
private $result;
public function __construct($host = 'localhost', $user = '', $password = '', $database = '') {
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

public function fetchAssocRow() {
	if ($row = mysql_fetch_assoc($this->result)) return $row;
	else return false;
}

public function fetchAll($table='info') {
	$this->query('SELECT * FROM '.$table);
	$rows = array();
	while ($row = $this->fetchRow()) {
		$rows[] = $row;
	}
	return $rows;
}

public function insert($params=array(),$table='info') {
	foreach ($params as $key=>$value) {
		if ($key != "password") $params[$key] = "mysql_real_escape_string($value)";
		else $params[$key] = "PASSWORD(\"mysql_real_escape_string($value)\")";
	}
	$sql = 'INSERT INTO '.$table.' ('.implode(',',array_keys($params)).') VALUES ('.implode(',',array_values($params)).')';
	$this->query($sql);
}

public function insertID() {
	return mysql_insert_id($this->result);
}
}
?>