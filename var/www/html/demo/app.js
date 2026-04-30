

const NUM_ROWS = 9; // num tiles
const NUM_COLS = 9;

const CANVAS_WIDTH_VAL = 50;
const CANVAS_HEIGHT_VAL = 50;

const CANVAS_WIDTH = NUM_COLS*CANVAS_WIDTH_VAL; // size in pixels
const CANVAS_HEIGHT = NUM_ROWS*CANVAS_HEIGHT_VAL;



const HOVER_COLOR = "rgb(169,169,169)"; // light gray
const WALL_TILE_COLOR = "#016A70";
const EMPTY_TILE_COLOR = "#FFFFDD";
const FILLED_TILE_COLOR = "gray";

class Puzzle {
    constructor() {
        this.board = new Board("mainCanvas", CANVAS_WIDTH, CANVAS_HEIGHT, NUM_ROWS, NUM_COLS);
        this.drawModeSelect = document.querySelector("#drawModeSelect");
        this.addListeners.call(this);

    }

    addListeners() {
        console.log("adding listeners...");
        addEventListener("mousemove", (event) => {
            // console.log(event.clientX, ",", event.clientY);
            
            let flags = event.buttons !== undefined ? event.buttons : event.which;
            let primaryMouseButtonDown = (flags & 1) === 1;
            if (primaryMouseButtonDown) {
                this.board.dragTile(event.clientX, event.clientY);
            }
            else {
                this.board.checkFocus(event.clientX, event.clientY);
            }
            // console.log(primaryMouseButtonDown);


        });

        addEventListener("mousedown", (event) => {
            // console.log("Click event listener triggered");
            if (event.button == 0) {
                this.board.clickTile(event.clientX, event.clientY);
            }
        })

        addEventListener("mouseup", (event) => {
            this.board.releaseMouse();
        })

        this.drawModeSelect.onchange = function() {
            this.board.setDrawMode(drawModeSelect.value);
        };
    }

    resetBoard() {
        this.board.ctx = this.board.canvas.getContext("2d");
        this.board.ctx.clearRect(0, 0, this.board.canvas.width, this.board.canvas.height);

    }


    addTile() {
        this.board.addTile();
    }

    loadBoard(boardId) {

        if (boardId == null) return;
        
        let thisPuzzle = this;
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            // In local files, status is 0 upon success in Mozilla Firefox
            // if (this.readyState === XMLHttpRequest.DONE) {
            if (this.readyState == 4 && this.status == 200) {
                const status = this.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    let res = JSON.parse(this.responseText);
                    console.log(res);
                    let boardResponse = this.responseText;
                    thisPuzzle.resetBoard();
                    thisPuzzle.board = new Board("mainCanvas", 250, 250, 5, 5);
                    thisPuzzle.addListeners(this);
                    
                } 
                else {
                    // console.log(`Error!`);
                    // console.log(this.responseText);
                // Oh no! There has been an error with the request!
                }
            }
            else {
                // console.log("uwu fucky wucky");
            }
        };
          
        xmlhttp.open("GET", `load.php?action=loadBoard&id=${boardId}`, true);
        xmlhttp.send();
    }


}

// https://www.puzzle-nurikabe.com/?pl=a6c1ccb99f8a602b501e90608ea527e4651d81d5c1962
class Board {
    constructor(canvasId, width, height, numRows, numCols) {
        this.drawBoard.call(this, canvasId, width, height, numRows, numCols);
    }

    drawBoard(canvasId, width, height, numRows, numCols) {
        this.canvas = document.getElementById(canvasId);
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;
        this.numRows = numRows;
        this.numCols = numCols;
        this.tileWidth = this.width / this.numCols;
        this.tileHeight = this.height / this.numRows;
        this.ctx = this.canvas.getContext("2d");
        this.drawMode = "normal";

        this.canvas.setAttribute("width", width);
        this.canvas.setAttribute("height", height);
        
        if (this.grid) this.grid.length = 0;
        this.grid = new Array(this.numRows);
        this.focusedTile = null;
        this.lastAction = null;

        for (let row = 0; row < numRows; row++) {
            // console.log(`row: ${row}`);
            this.grid[row] = new Array(this.numCols);
            for (let col = 0; col < this.numCols; col++) {
                // console.log(`col: ${col}`);
                // this.grid[row][col] = null;
                this.grid[row][col] = (row == 0 || col == 0 || row == this.numRows-1 || col == this.numCols-1) ? new Wall(this.tileWidth, this.tileHeight, col*this.tileWidth, row*this.tileHeight, row, col, this.ctx) : new Tile(this.tileWidth, this.tileHeight, col*this.tileWidth, row*this.tileHeight, row, col, this.ctx);
            }
        }
    }
    checkFocus(mouseX, mouseY) {
        const mouseRow = Math.floor(mouseY / this.tileHeight);
        const mouseCol = Math.floor(mouseX / this.tileWidth);
        //console.log(mouseX, ", ", mouseY);
        //console.log(mouseRow, ", ", mouseCol);
        if (mouseRow < this.numRows && mouseCol < this.numCols && this.focusedTile != this.grid[mouseRow][mouseCol]) {
            this.focusedTile = this.grid[mouseRow][mouseCol];
            for (let row = 0; row < this.numRows; row++) {
                for (let col = 0; col < this.numCols; col++) {
                    this.grid[row][col].draw();
                }
            }
            this.focusedTile.hover();
        }

        
    }

    clickTile(mouseX, mouseY) {
        // console.log("Click tile func || this.lastAction = ", this.lastAction);

        const mouseRow = Math.floor(mouseY / this.tileHeight);
        const mouseCol = Math.floor(mouseX / this.tileWidth);
        //console.log(mouseX, ", ", mouseY);
        //console.log(mouseRow, ", ", mouseCol);
        if (mouseRow < this.numRows && mouseCol < this.numCols) {
            if (this.drawMode == "normal") {
                this.lastAction = this.grid[mouseRow][mouseCol].click();
            }
            else {
                this.grid[mouseRow][mouseCol] = this.grid[mouseRow][mouseCol] instanceof Wall ? new Tile(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, mouseRow, mouseCol, this.ctx) : new Wall(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, mouseRow, mouseCol, this.ctx);
                this.lastAction =  this.grid[mouseRow][mouseCol] instanceof Wall ? "walls" : "tiles";
            }
            
        } 
        
          
    }

    dragTile(mouseX, mouseY) {
        // console.log("Drag tile func || this.lastAction = ", this.lastAction);
        const mouseRow = Math.floor(mouseY / this.tileHeight);
        const mouseCol = Math.floor(mouseX / this.tileWidth);
        // console.log("not tile: ", ! (this.grid[mouseRow][mouseCol] instanceof Tile));
        // console.log("not wall: ", ! (this.grid[mouseRow][mouseCol] instanceof Wall));
        if (mouseRow < this.numRows && mouseCol < this.numCols && !(this.grid[mouseRow][mouseCol] instanceof Wall)) {
            if (this.lastAction != null && this.drawMode == "normal") {
                this.grid[mouseRow][mouseCol].setColor(this.lastAction);
            }
            else if (this.drawMode == "walls") {
                

                // this.grid[mouseRow][mouseCol] = this.lastAction == "tiles" ? new Tile(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, this.ctx) : new Wall(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, this.ctx);
                // this.grid[mouseRow][mouseCol] = this.lastAction == "tiles" ? new Wall(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, this.ctx) : new Wall(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, this.ctx);
            }
            
        }
        if (this.drawMode == "walls") {
            //m console.log("this.lastAction == tiles ? : ", this.lastAction == "tiles");
                
            if (this.lastAction == "tiles" && this.grid[mouseRow][mouseCol] instanceof Wall) {
                // console.log("is wall before: ", this.grid[mouseRow][mouseCol] instanceof Wall);
                this.grid[mouseRow][mouseCol] = new Tile(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, mouseRow, mouseCol, this.ctx);
                // console.log("is wall after: ", this.grid[mouseRow][mouseCol] instanceof Wall);
            }
            else if (this.lastAction == "walls" && !(this.grid[mouseRow][mouseCol] instanceof Wall)) {
                // console.log("this.lastAction == walls");
                this.grid[mouseRow][mouseCol] = new Wall(this.tileWidth, this.tileHeight, mouseCol*this.tileWidth, mouseRow*this.tileHeight, mouseRow, mouseCol, this.ctx);
            }
        }
    }

    releaseMouse() {
        // console.log("Release mouse func|| this.lastAction = ", this.lastAction);
        this.lastAction = null;   
        this.resetPools();
    }

    resetPools() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.grid[row][col].poolId = null;
            }
        }
        let poolId = 0;
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                let currentTile = this.grid[row][col];
                if (!(currentTile instanceof Wall) && currentTile.poolId == null && currentTile.color == EMPTY_TILE_COLOR) {
                    this.exploreTile(currentTile, poolId);
                    poolId++;
                }
            }
        }

        for (let poolCount = 0; poolCount < poolId+1; poolCount++) {
            let poolSum = 0;
            for (let row = 0; row < this.numRows; row++) {
                for (let col = 0; col < this.numCols; col++) {
                    if (this.grid[row][col].poolId != null && this.grid[row][col].poolId == poolCount) poolSum++;
                }
            }
            for (let row = 0; row < this.numRows; row++) {
                for (let col = 0; col < this.numCols; col++) {
                    if (this.grid[row][col].poolId != null && this.grid[row][col].poolId == poolCount) this.grid[row][col].char = poolSum;
                }
            }
            // console.log(`poolcount: ${poolCount}  poolsum: ${poolSum}`);
        }
      for (let row = 0; row < this.numRows; row++) {
                for (let col = 0; col < this.numCols; col++) {
                    this.grid[row][col].draw();
                }
            }

    }

    exploreTile(t, poolId) {
        t.poolId = poolId;
        // (0, -1), (-1, 0), (1, 0), (0, 1)
        if (t.col - 1 >= 0 && !(this.grid[t.row][t.col-1] instanceof Wall) && this.grid[t.row][t.col-1].color == EMPTY_TILE_COLOR && this.grid[t.row][t.col-1].poolId == null) {
            this.grid[t.row][t.col-1].poolId = poolId;
            this.exploreTile(this.grid[t.row][t.col-1], poolId);
        }
        if (t.row - 1 >= 0 && !(this.grid[t.row-1][t.col] instanceof Wall) && this.grid[t.row-1][t.col].color == EMPTY_TILE_COLOR && this.grid[t.row-1][t.col].poolId == null) {
            this.grid[t.row-1][t.col].poolId = poolId;
            this.exploreTile(this.grid[t.row-1][t.col], poolId);
        }
        if (t.col + 1 < this.numRows && !(this.grid[t.row][t.col+1] instanceof Wall) && this.grid[t.row][t.col+1].color == EMPTY_TILE_COLOR && this.grid[t.row][t.col+1].poolId == null) {
            this.grid[t.row][t.col+1].poolId = poolId;
            this.exploreTile(this.grid[t.row][t.col+1], poolId);
        }
        if (t.row + 1 < this.numCols && !(this.grid[t.row+1][t.col] instanceof Wall) && this.grid[t.row+1][t.col].color == EMPTY_TILE_COLOR && this.grid[t.row+1][t.col].poolId == null) {
            this.grid[t.row+1][t.col].poolId = poolId;
            this.exploreTile(this.grid[t.row+1][t.col], poolId);
        }
    }

    setDrawMode(drawMode) {
        this.drawMode = drawMode;
        console.log(this.drawMode);
    }
    /*
    loadBoard(boardId) {
        if (boardId == null) return;
        let oldBoard = this;
        var xmlhttp = new XMLHttpRequest();
        // console.log(`xmlhttp: ${xmlhttp}`);

        xmlhttp.onreadystatechange = function () {
            // In local files, status is 0 upon success in Mozilla Firefox
            // if (this.readyState === XMLHttpRequest.DONE) {
            if (this.readyState == 4 && this.status == 200) {
                const status = this.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    console.log(this.responseText);
                    this.canvas = document.getElementById("mainCanvas");

                    

                    
                    this.canvasId = "mainCanvas";
                    this.width = 5;
                    this.height = 5;
                    this.numRows = 5;
                    this.numCols = 5;
                    this.tileWidth = this.width / this.numCols;
                    this.tileHeight = this.height / this.numRows;
                    this.ctx = this.canvas.getContext("2d");
                    this.drawMode = "normal";

                    this.canvas.setAttribute("width", this.width);
                    this.canvas.setAttribute("height", this.height);
                    
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                    if (this.grid) this.grid.length = 0;
                    this.grid = new Array(this.numRows);
                    this.focusedTile = null;
                    this.lastAction = null;

                    for (let row = 0; row < this.numRows; row++) {
                        console.log(`row: ${row}`);
                        this.grid[row] = new Array(this.numCols);
                        for (let col = 0; col < this.numCols; col++) {
                            console.log(`col: ${col}`);
                            // this.grid[row][col] = null;
                            this.grid[row][col] = (row == 0 || col == 0 || row == this.numRows-1 || col == this.numCols-1) ? new Wall(this.tileWidth, this.tileHeight, col*this.tileWidth, row*this.tileHeight, row, col, this.ctx) : new Tile(this.tileWidth, this.tileHeight, col*this.tileWidth, row*this.tileHeight, row, col, this.ctx);
                        }
                    }
                    drawModeSelect = document.querySelector("#drawModeSelect");
                } 
                else {
                    // console.log(`Error!`);
                    // console.log(this.responseText);
                // Oh no! There has been an error with the request!
                }
            }
            else {
                // console.log("uwu fucky wucky");
            }
        };
        xmlhttp.open("GET", `load.php?action=loadBoard&id=${boardId}`, true);
        xmlhttp.send();
    }
    */

    
  
  addTile() {
    let numFilledTiles = 0;
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        if (!(this.grid[row][col] instanceof Wall) && this.grid[row][col].color == FILLED_TILE_COLOR) numFilledTiles++;
      }
    }
    if (numFilledTiles == 0) {
        let addedTile = null;
      do {
        addedTile = this.grid[Math.floor(Math.random() * this.numRows)][Math.floor(Math.random() * this.numCols)];
      } while ((addedTile instanceof Wall) || addedTile.color == FILLED_TILE_COLOR)
      addedTile.setColor(FILLED_TILE_COLOR);
    }
    else {
      let filledTileRoot = null;
      do {
        let filledTileRootIndex = Math.floor(Math.random() * numFilledTiles);
        for (let row = 0; row < this.numRows; row++) {
          for (let col = 0; col < this.numCols; col++) {
            if (!(this.grid[row][col] instanceof Wall) && this.grid[row][col].color == FILLED_TILE_COLOR) {
            
            if (filledTileRootIndex == 0) filledTileRoot = this.grid[row][col];
            filledTileRootIndex--;
            }
          }
        }

        console.log(filledTileRootIndex);
        console.log(filledTileRoot);
        let validTiles = [];
        // if (filledTileRoot.row > 0 && !(this.grid[filledTileRoot.row-1][filledTileRoot.col] instanceof Wall) && this.grid[filledTileRoot.row-1][filledTileRoot.col].color == EMPTY_TILE_COLOR)

        if (this.checkTile(filledTileRoot.row-1, filledTileRoot.col,false,true,true,true)) validTiles.push(this.grid[filledTileRoot.row-1][filledTileRoot.col]);

        
        // if (filledTileRoot.col > 0 && !(this.grid[filledTileRoot.row][filledTileRoot.col-1] instanceof Wall) && this.grid[filledTileRoot.row][filledTileRoot.col-1].color == EMPTY_TILE_COLOR) validTiles.push(this.grid[filledTileRoot.row][filledTileRoot.col-1]);
        if (this.checkTile(filledTileRoot.row, filledTileRoot.col-1,false,true,true,true)) validTiles.push(this.grid[filledTileRoot.row][filledTileRoot.col-1]);
        // if (filledTileRoot.row < this.numRows - 1 && !(this.grid[filledTileRoot.row+1][filledTileRoot.col] instanceof Wall) && this.grid[filledTileRoot.row+1][filledTileRoot.col].color == EMPTY_TILE_COLOR) validTiles.push(this.grid[filledTileRoot.row+1][filledTileRoot.col]);
        if (this.checkTile(filledTileRoot.row+1, filledTileRoot.col,false,true,true,true)) validTiles.push(this.grid[filledTileRoot.row+1][filledTileRoot.col]);
        // if (filledTileRoot.col < this.numCols - 1 && !(this.grid[filledTileRoot.row][filledTileRoot.col+1] instanceof Wall) && this.grid[filledTileRoot.row][filledTileRoot.col+1].color == EMPTY_TILE_COLOR) validTiles.push(this.grid[filledTileRoot.row][filledTileRoot.col+1]);
        if (this.checkTile(filledTileRoot.row, filledTileRoot.col+1,false,true,true,true)) validTiles.push(this.grid[filledTileRoot.row][filledTileRoot.col+1]);
        if (validTiles.length > 0) {
          filledTileRoot = validTiles[Math.floor(Math.random(validTiles.length) * 10)];
        } 
        else {
          filledTileRoot = null;
        }
          
      } while (filledTileRoot == null);
    filledTileRoot.setColor(FILLED_TILE_COLOR);
    }
    
    this.resetPools();
    
    
    
  
  }

  checkTile(row, col, checkNotEmpty=false, checkNotFilled=false, checkNotWall=false, checkNotTwoByTwos=false) {
    console.log(`function called! row: ${row} col: ${col} checkNotEmpty: ${checkNotEmpty} checkNotFiled: ${checkNotFilled} checkNotWall: ${checkNotWall} checkNotTwoByTwos: ${checkNotTwoByTwos}`);
    if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) return false;
    let tileToCheck = this.grid[row][col];
    if (checkNotEmpty && tileToCheck.color==EMPTY_TILE_COLOR) return false;
    if (checkNotFilled && tileToCheck.color==FILLED_TILE_COLOR) return false;
    if (checkNotWall && tileToCheck instanceof Wall) return false;
    if (checkNotTwoByTwos) {
      // upper left
      let quad1 = this.checkTile(row-1, col-1, true, false, false, false) && this.checkTile(row-1, col, true, false, false, false) && this.checkTile(row, col-1, true, false, false, false);
      let quad2 = this.checkTile(row-1, col, true, false, false, false) && this.checkTile(row-1, col+1, true, false, false, false) && this.checkTile(row, col+1, true, false, false, false);
      let quad3 = this.checkTile(row, col+1, true, false, false, false) && this.checkTile(row+1, col+1, true, false, false, false) && this.checkTile(row+1, col, true, false, false, false);
      let quad4 = this.checkTile(row+1, col, true, false, false, false) && this.checkTile(row+1, col-1, true, false, false, false) && this.checkTile(row, col-1, true, false, false, false);
      console.log(`quad1: ${quad1} quad2: ${quad2} quad3: ${quad3} quad4: ${quad4}`);
      if (quad1 || quad2 || quad3 || quad4) return false;
      
    }
    
    return true;
  }



}


class Tile {
    constructor(width, height, x, y, row, col, ctx) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;
        this.borderSize = 2;
        this.ctx = ctx;
        this.color = EMPTY_TILE_COLOR;
        this.poolId = null;
        this.char = null;

        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + this.borderSize, this.y + this.borderSize, this.width - this.borderSize, this.height - this.borderSize);
    }

    hover() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.ctx.fillStyle = HOVER_COLOR;
        this.ctx.fillRect(this.x + this.borderSize, this.y + this.borderSize, this.width - this.borderSize, this.height - this.borderSize);
    }

    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x + this.borderSize, this.y + this.borderSize, this.width - this.borderSize, this.height - this.borderSize);

        if (this.poolId != null) {
            this.ctx.font = "35px Arial";
            this.ctx.fillStyle = "black";
            //this.ctx.textAlign="center";
            this.ctx.fillText(this.char, this.x+10, this.y-5+this.height);
        }
        
        
    }

    click() {
        // console.log("Click!");
        this.color = this.color == EMPTY_TILE_COLOR ? FILLED_TILE_COLOR : EMPTY_TILE_COLOR;
        this.draw();
        return this.color;
    }

    setColor(color) {
        this.color = color;
        this.draw();
    }
}

class Wall extends Tile {
    constructor(width, height, x, y, row, col, ctx) {
        super(width, height, x, y, row, col, ctx);
        this.color = WALL_TILE_COLOR;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + this.borderSize, this.y + this.borderSize, this.width - this.borderSize, this.height - this.borderSize);
    }

    click() {
        return null;
    }
}



let puzzle = new Puzzle();

let loadText = function() {
    const selectElement = document.getElementById("boardSelect");
    const optionElement = selectElement.options[selectElement.selectedIndex];
    if (optionElement.id == "defaultOption") return;
    const selectedBoardId = optionElement.getAttribute("boardId");
    // console.log(selectedBoardId);
    puzzle.loadBoard(selectedBoardId);
}

function loadBoardNames() {
    let boardSelectEl = document.querySelector("#boardSelect");
    let boardList = "";
    
    var xmlhttp = new XMLHttpRequest();
    console.log(`xmlhttp: ${xmlhttp}`);
    
    
    xmlhttp.onreadystatechange = function () {
    // In local files, status is 0 upon success in Mozilla Firefox
        // if (this.readyState === XMLHttpRequest.DONE) {
        if (this.readyState == 4 && this.status == 200) {
            const status = this.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                // console.log("response text: ", this.responseText);
                const boardSelectEl = document.querySelector("#boardSelect");
                const boardSelectOptionEls = boardSelectEl.querySelectorAll("option");
                // console.log(boardSelectOptionEls);
                let boardNames = JSON.parse(this.responseText);
                console.log(`boardNames: ${boardNames}`);
                if (boardSelectOptionEls.length == 1) {
                    for (let i = 0; i < boardNames.length; i++) {
                        // console.log(`i: ${i}`);
                        var opt = document.createElement('option');
                        opt.value = boardNames[i];
                        opt.innerHTML = boardNames[i];
                        opt.setAttribute("boardId", i);
                        boardSelectEl.appendChild(opt);
                    }
                }  
            } 
            else {
                // console.log(`Error!`);
                // console.log(this.responseText);
            // Oh no! There has been an error with the request!
            }
        }
        else {
            // console.log("uwu fucky wucky");
        }
    };
    xmlhttp.open("GET", `load.php?action=loadBoardNames`, true);
    xmlhttp.send();
    
    

}