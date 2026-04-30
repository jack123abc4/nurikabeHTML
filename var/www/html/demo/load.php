<?php
// var_dump($argc);
// var_dump($argv);
header('Content-type: application/json');
$action = $_REQUEST['action'];
// $action = "loadBoard";
$boardFile = fopen("grids.txt", "r") or die("Unable to open file");
$boardText = fread($boardFile, filesize("grids.txt"));
$boardLines = explode(";", $boardText);
// echo json_encode($boardLines);
$result = [
    "status" => "error"
];



switch ($action) {
    case 'loadBoard':
        //echo "board lines: ";
        // echo json_encode($boardLines);
        $boardId = $_REQUEST['id'];
        // echo ("boardId: ");
        // echo ($boardId);
        /// $boardId = 0;
        foreach ($boardLines as $line) {
            // echo "line: ";
            // echo $line;
            $lineVals = explode(",", $line);
            if ($lineVals[0] == "id" || $lineVals[0] == "") { continue; }
            $lineVals[0] = trim(preg_replace('/\s+/', ' ', $lineVals[0]));
            /* echo "lineVals: ";
            echo json_encode($lineVals);
            echo ("(int)lineVals[0]: " . (int)$lineVals[0] . "\n");
            echo ("boardId: " . $boardId . "\n");
            echo ("(int)lineVals[0] == boardId: " . ((int)$lineVals[0] == $boardId) . "\n");
            */

            if ((int)$lineVals[0] == $boardId) {
                $result["status"] = "success";
                $result["id"] = $lineVals[0];
                $result["name"] = $lineVals[1];
                $result["width"] = $lineVals[2];
                $result["height"] = $lineVals[3];
                $result["cellSize"] = $lineVals[4];
                $result["coords"] = array_slice($lineVals,5);
                
            }
            
        }
        // echo json_encode($result);
        echo json_encode($result);
        exit();
       

    case 'loadBoardNames':
        
        $boardNames = [];
        foreach ($boardLines as $line) {
            $lineVals = explode(",", $line);
            if ($lineVals[0] == "id" || $lineVals[0] == "") { continue; }
            $lineVals[0] = trim(preg_replace('/\s+/', ' ', $lineVals[0]));
            // $lineVals = implode(",", $line);
            /*
            if ($line[0] == "id") {
                continue;
            }
            */
            array_push($boardNames, $lineVals[1]);
            
        }

        /*
        for ($i = 1; $i < count($boardLines); $i++) {
            $boardName = $boardLines[$i][1];
            $boardNames[$i-1] = $boardName;
            //echo json_encode($lineVals);
            
        }
        */
        // echo json_encode($lineVals);
        echo json_encode($boardNames);
        exit();
    default:
        
}



?>

