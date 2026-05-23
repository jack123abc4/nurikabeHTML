<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Nurikabe</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="./style.css">
    </head>
    <body>
        <h2 id="boardName">Untitled Nurikabe</h2>
        <canvas id="mainCanvas" width="500" height="500"></canvas>
        <div id="sidebar" width="200">
            <div width="100%">
            <button>Save</button>
            <button id="loadButton" onclick="loadText();">Load</button>
            <button id="editButton">Edit</button>
            <select id="boardSelect" onclick="loadBoardNames()">
                <option id="defaultOption" disabled selected>-- select a load file --</option>
            </select>
        </div>
        <select width=100% name="drawMode" id="drawModeSelect">
            <option value="normal">normal</option>
            <option value="walls">walls</option>
          </select>
        
        </div>
        <!-- <div id="modal" class="modal-overlay">
            <div class="modal-box">
                <button id="closeBtn" class="modal-close">×</button>

                <h3>Hello!</h3>
                <p>This is a modal popup.</p>
            </div>
        </div> -->
        <dialog id="modal" class="modal-overlay">
            <div class="modal-box">
                <form method="dialog">
                    <h3>Edit Board</h3>
                    <p>Board size: <input id="boardSizeInput" label="Board size" type="number" min="1" step="1" required></p>
                    <p>Board name: <input id="boardNameInput" label="Board name" type="text" required></p>
                    <button type="submit" onclick="submitNewBoard();">Submit</button>
                    <button type="button" id="closeBtn" class="modal-close">x</button>
                </form>
            </div>
        </dialog>
        <script src="app.js" async defer></script>
        
    </body>
</html>
