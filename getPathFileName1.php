
<?php
$files = array();
$dir = getcwd();
$dir .= "/pathFiles/*.path";

$files = glob($dir);
usort($files, function($a, $b) {
    return filemtime($b) < filemtime($a);
});
foreach($files as &$value)
{
     $value = substr($value,strrpos($value,'/')+1);
}
    Header('Content-Type: application/json; charset=UTF8');
    echo json_encode($files);
?>