<?php
   header("Content-type: application/xml");
   $xml = $_POST['xml'];
   $name = $_POST['name'];
   $file = fopen($name,'w+');
   fwrite($file, $xml);
   fclose($file);
?>