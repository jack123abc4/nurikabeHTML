
  
<?php
$action = $_REQUEST['action'];
$boardFile = fopen("grids.txt", "r") or die("Unable to open file");
$boardText = fread($boardFile, filesize("grids.txt"));
$boardLines = explode(";", $boardText);
$result = [
    "status" => "error"
];

switch ($action) {
    case 'loadBoard':
        $boardId = $_REQUEST['id'];
        
        

        foreach ($boardLines as $line) {
            $lineVals = explode(",", $line);
            if ($lineVals[0] == $boardId) {
                $result->status="success";
                $result->name=$lineVals[1];
                $result->coords=implode(array_slice($lineVals,2));
            }
        }

        
        break;
    case 'loadBoardNames':
        for ($i = 0; $i < count($boardLines); $i++) {
            if ($i == 0) continue;
            $lineVals = explode(",", $boardLines[$i]);
            echo $lineVals[1];
        }
        break;
    default:
        echo $boardText;
        
}

echo json_encode($result);
// echo $boardText;






?>
