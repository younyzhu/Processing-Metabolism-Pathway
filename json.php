<?php
   header("Content-type: application/json");
   $json = $_POST['json'];
   $name = $_POST['name'];
   $file = fopen($name,'w+');
   fwrite($file, $json);
   fclose($file);
?>


