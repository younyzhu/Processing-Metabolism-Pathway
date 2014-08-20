<?php

$files = array();
$dir = getcwd();
$dir .= "/pathFiles";

// Open a directory, and read its contents
if (is_dir($dir)){
  if ($dh = opendir($dir)){
    while (($file = readdir($dh)) !== false){
      if ($file == '.' || $file == '..' || substr($file , strrpos($file, '.') + 1) == 'txt') {
        continue;
    }
    $files[] = $file;

    }
    closedir($dh);
  }
}/*
foreach($files as &$value)
{
      $value= substr($value, 0, (strlen ($filename)) - (strlen (strrchr($value,'.'))));
}*/
    header('Content-type: application/json');
    echo json_encode($files);
?>