<?php
// var_dump($argc);
// var_dump($argv);
header('Content-type: application/json');

$action = $_REQUEST['action'];
$boardFile = file_get_contents('grids.json');
$boardFileJSON = json_decode($boardFile, true);
// $boardText = fread($boardFile, filesize("grids.txt"));
// $boardLines = explode(";", $boardText);
// echo json_encode($boardLines);
$result = [
    "status" => "error"
];



switch ($action) {
    case 'loadBoard':
        // var_dump($boardFileJSON);
        // $obj2['streets'] as $coords => $street
        foreach ($boardFileJSON['boards'] as $board) {
            // var_dump($board['id']);
            // var_dump($_REQUEST['id']);
            // var_dump($board['id'] == $_REQUEST['id']);
            // var_dump($board);
            // var_dump($_REQUEST);
            // var_dump($result);
            // echo "\n\n\n";          
            if ($board['id'] == $_REQUEST['id']) {
                $result = [
                    "status" => "success",
                    "boardData" => $board
                ];
                break;
            }
        }
        // echo json_encode($result);
        echo json_encode($result);
        exit();
       

    case 'loadAllBoardsData':
        
        $result = [
            "status" => "success",
            "boardFile" => $boardFileJSON
        ];

        echo json_encode($result);
        exit();
    default:
        
}





?>

