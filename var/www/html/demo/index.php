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
        
        <canvas id="mainCanvas" width="500" height="500"></canvas>
        <h2 id="boardName">Untitled Nurikabe</h2>
        <div id="sidebar" width="200">
            <div width=100%>
                <button id="saveBtn" onClick="saveBoard();">Save</button>
                <button id="loadBtn" onclick="loadText();">Load</button>
                <button id="editBtn">Edit</button>
                <select id="boardSelect" onclick="loadBoardNames()">
                    <option id="defaultOption" disabled selected>-- select a load file --</option>
                </select>
            </div>
            <br>
            <div width=100%>
                <div width=45%>
                    <label for="drawModeSelect">Draw mode</label>
                    <select name="drawMode" id="drawModeSelect">
                        <option value="normal">normal</option>
                        <option value="walls">walls</option>
                    </select>
                </div>
            </div>
            <div width=100%>
                <div width=45%>
                    <label for="showAllNums">Show all nums</label>
                </div>
                <label class="switch">
                    <input type="checkbox" id="numBtn">
                    <span class="slider round"></span>
                </label>

        
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
                <form method="dialog" id="boardForm" onsubmit="createBoard();">
                    <h3>Edit Board</h3>
                    <p>Board size: <input id="boardSizeInput" label="Board size" type="number" min="1" max="40" step="1" required></p>
                    <p>Board name: <input id="boardNameInput" label="Board name" type="text" required></p>
                    <input type="submit" id="submitBtn" value="Submit"></input>
                    <button type="button" id="closeBtn" class="modal-close">x</button>
                </form>
            </div>
        </dialog>
        <script src="app.js" async defer></script>
        
    </body>
</html>
