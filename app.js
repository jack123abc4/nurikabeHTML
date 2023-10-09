

const NUM_ROWS = 9; // num tiles
const NUM_COLS = 9;

const CANVAS_WIDTH = NUM_COLS*50; // size in pixels
const CANVAS_HEIGHT = NUM_ROWS*50;

const HOVER_COLOR = "rgb(169,169,169)"; // light gray
const WALL_TILE_COLOR = "#016A70";
const EMPTY_TILE_COLOR = "#FFFFDD";
const FILLED_TILE_COLOR = "gray";

// https://www.puzzle-nurikabe.com/?pl=a6c1ccb99f8a602b501e90608ea527e4651d81d5c1962
class Board {
    constructor(canvasId, width, height, numRows, numCols) {
        this.canvas = document.getElementById(canvasId);
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
        
        this.grid = new Array(this.numRows);
        this.focusedTile = null;
        this.lastAction = null;

        for (let row = 0; row < numRows; row++) {
            this.grid[row] = new Array(this.numCols);
            for (let col = 0; col < this.numCols; col++) {

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
            console.log(`poolcount: ${poolCount}  poolsum: ${poolSum}`);
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

    loadBoard(boardId) {
        if (boardId == null) return;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert(`Success! text:${JSON.parse(this.responseText)}`);
            }
        }

        xmlhttp.open("GET", `load.php?action=loadBoard&id=${boardId}`, true);
        xmlhttp.send();
    }
    // saveBoard() {
    //     $.ajax({
    //         type : "POST",
    //         url : "load.php"
    //     });
    // }
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



let board = new Board("mainCanvas", CANVAS_WIDTH, CANVAS_HEIGHT, NUM_ROWS, NUM_COLS);
let drawModeSelect = document.querySelector("#drawModeSelect");

addEventListener("mousemove", (event) => {
    // console.log(event.clientX, ",", event.clientY);
    
    var flags = event.buttons !== undefined ? event.buttons : event.which;
    primaryMouseButtonDown = (flags & 1) === 1;
    if (primaryMouseButtonDown) {
        board.dragTile(event.clientX, event.clientY);
    }
    else {
        board.checkFocus(event.clientX, event.clientY);
    }
    // console.log(primaryMouseButtonDown);


});

addEventListener("mousedown", (event) => {
    // console.log("Click event listener triggered");
    if (event.button == 0) {
        board.clickTile(event.clientX, event.clientY);
    }
})

addEventListener("mouseup", (event) => {
    board.releaseMouse();
})

drawModeSelect.onchange = function() {
    board.setDrawMode(drawModeSelect.value);
};

function loadText() {
    board.loadBoard(0);
}
function addTile() {
  board.addTile();
}