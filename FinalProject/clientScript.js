"use strict";
//TODO move this to server code.
    // game parameters

    const GRID_CIRCLE = 0.7; // circle size as a fraction of cell size
    const GRID_COLS = 7; // number of game columns
    const GRID_ROWS = 6; // number of game rows
    const MARGIN = 0.02; // margin as a fraction of the shortest screen dimension

    // colours
    const COLOR_BACKGROUND = "lightyellow";
    const COLOR_FRAME = "#2641c9";
    const COLOR_FRAME_BUTT = "royalblue";

    const COLOR_PLAY1 = "yellow";
    const COLOR_PLAY1_DRK = "olive";
    const COLOR_PLAY2 = "red";
    const COLOR_PLAY2_DRK = "darkred";

    const COLOR_TIE = "darkgrey";
    const COLOR_TIE_DRK = "black";
    const COLOR_WIN = "black";

    // text
    const TEXT_PLAY1 = "Player 1";
    const TEXT_PLAY2 = "Player 2";
    const TEXT_TIE = "DRAW";
    const TEXT_WIN = "WINS!";

    // classes
    class Cell {
        constructor(left, top, w, h, row, col) {
            this.bot = top + h;
            this.left = left;
            this.right = left + w;
            this.top = top;
            this.w = w;
            this.h = h;
            this.row = row;
            this.col = col;
            this.cx = left + w / 2;
            this.cy = top + h / 2;
            this.r = w * GRID_CIRCLE / 2;
            this.highlight = null;
            this.owner = null;
            this.winner = false;
        }

        contains(x, y) {
            return x > this.left && x < this.right && y > this.top && y < this.bot;
        }

        // draw the circle or hole
        draw(/** @type {CanvasRenderingContext2D} */ ctx) {

            // owner colour
            let color = this.owner == null ? COLOR_BACKGROUND : this.owner ? COLOR_PLAY1 : COLOR_PLAY2;

            // draw the circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2);
            ctx.fill();

            // draw highlighting
            if (this.winner || this.highlight != null) {

                // colour
                color = this.winner ? COLOR_WIN : this.highlight ? COLOR_PLAY1 : COLOR_PLAY2;

                // draw a circle around the perimeter
                ctx.lineWidth = this.r / 4;
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    // set up the canvas and context
    var canv = document.createElement("canvas");
    document.body.appendChild(canv);
    var ctx = canv.getContext("2d");

    // game variables
    var gameOver, gameTied, grid = [], player1Turn;

    // dimensions
    var height, width, margin;
    setDimensions();

    // event listeners
    canv.addEventListener("click", click);
    canv.addEventListener("mousemove", highlightGrid);
    window.addEventListener("resize", setDimensions);

    // game loop
    var timeDelta, timeLast;
    requestAnimationFrame(loop);

    function loop() {
        // draw
        drawBackground();
        drawGrid();
        drawText();
        // call the next frame
        requestAnimationFrame(loop);
    }

    function checkWin(row, col) {
        // get all the cells from each direction
        let diagL = [], diagR = [], horiz = [], vert = [];
        for (let i = 0; i < GRID_ROWS; i++) {
            for (let j = 0; j < GRID_COLS; j++) {

                // horizontal cells
                if (i == row) {
                    horiz.push(grid[i][j]);
                }

                // vertical cells
                if (j == col) {
                    vert.push(grid[i][j]);
                }

                // top left to bottom right
                if (i - j == row - col) {
                    diagL.push(grid[i][j]);
                }

                // top right to bottom left
                if (i + j == row + col) {
                    diagR.push(grid[i][j]);
                }
            }
        }

        // if any have four in a row, return a win!
        return connect4(diagL) || connect4(diagR) || connect4(horiz) || connect4(vert);
    }

    //sub function to check the winner of each state for connect 4
    function connect4(cells = []) {
        let count = 0, lastOwner = null;
        let winningCells = [];
        //for all of the cells in the array.
        for (let i = 0; i < cells.length; i++) {

            // initialization w/ no owner reset count
            if (cells[i].owner == null) {
                count = 0;
                winningCells = [];
            }
            // same owner, add to the count
            else if (cells[i].owner == lastOwner) {
                count++;
                winningCells.push(cells[i]);
            }
            // new owner, new count
            else {
                count = 1;
                winningCells = [];
                winningCells.push(cells[i]);
            }

            lastOwner = cells[i].owner;

            // four wins
            if (count == 4) {
                for (let cell of winningCells) {
                    cell.winner = true;
                }
                return true;
            }
        }
        return false;
    }


    function click(ev) {

        if (gameOver) {
            newGame();
            return;
        }

        //select the cell based on what was clicked.
        selectCell();
    }

    function createGrid() {
        grid = [];

        // set up cell size and margins
        let cell, marginX, marginY;

        // portrait
        if ((width - margin * 2) * GRID_ROWS / GRID_COLS < height - margin * 2) {
            cell = (width - margin * 2) / GRID_COLS;
            marginX = margin;
            marginY = (height - cell * GRID_ROWS) / 2;
        }

        // landscape
        else {
            cell = (height - margin * 2) / GRID_ROWS;
            marginX = (width - cell * GRID_COLS) / 2;
            marginY = margin;
        }

        // populate the grid
        for (let i = 0; i < GRID_ROWS; i++) {
            grid[i] = [];
            for (let j = 0; j < GRID_COLS; j++) {
                let left = marginX + j * cell;
                let top = marginY + i * cell;
                grid[i][j] = new Cell(left, top, cell, cell, i, j);
            }
        }
    }

    function drawBackground() {
        ctx.fillStyle = COLOR_BACKGROUND;
        ctx.fillRect(0, 0, width, height);
    }

    function drawGrid() {

        // frame and butt
        let cell = grid[0][0];
        let fh = cell.h * GRID_ROWS;
        let fw = cell.w * GRID_COLS;
        ctx.fillStyle = COLOR_FRAME;
        ctx.fillRect(cell.left, cell.top, fw, fh);
        ctx.fillStyle = COLOR_FRAME_BUTT;
        ctx.fillRect(cell.left - margin / 2, cell.top + fh - margin / 2, fw + margin, margin);

        // cells
        for (let row of grid) {
            for (let cell of row) {
                cell.draw(ctx);
            }
        }
    }

    //for drawing the result text at the end of the game for displaying winner and loser
    function drawText() {
        if (!gameOver) {
            return;
        }

        // set up text parameters
        let size = grid[0][0].h;
        ctx.fillStyle = gameTied ? COLOR_TIE : player1Turn ? COLOR_PLAY1 : COLOR_PLAY2;
        ctx.font = size + "px dejavu sans mono";
        ctx.lineJoin = "round";
        ctx.lineWidth = size / 10;
        ctx.strokeStyle = gameTied ? COLOR_TIE_DRK : player1Turn ? COLOR_PLAY1_DRK : COLOR_PLAY2_DRK;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // draw the text
        let offset = size * 0.55;
        let text = gameTied ? TEXT_TIE : player1Turn ? TEXT_PLAY1 : TEXT_PLAY2;
        if (gameTied) {
            ctx.strokeText(text, width / 2, height / 2);
            ctx.fillText(text, width / 2, height / 2);
        } else {
            ctx.strokeText(text, width / 2, height / 2 - offset);
            ctx.fillText(text, width / 2, height / 2 - offset);
            ctx.strokeText(TEXT_WIN, width / 2, height / 2 + offset);
            ctx.fillText(TEXT_WIN, width / 2, height / 2 + offset);
        }
    }

    function highlightCell(x, y) {
        let col = null;
        for (let row of grid) {
            for (let cell of row) {

                // clear existing highlighting
                cell.highlight = null;

                // get the column
                if (cell.contains(x, y)) {
                    col = cell.col;
                }
            }
        }

        if (col == null) {
            return;
        }

        // highlight the first unoccupied cell
        for (let i = GRID_ROWS - 1; i >= 0; i--) {
            if (grid[i][col].owner == null) {
                grid[i][col].highlight = player1Turn;
                return grid[i][col];
            }
        }
        return null;
    }

    function highlightGrid(/** @type {MouseEvent} */ ev) {
        if (gameOver) {
            return;
        }
        highlightCell(ev.clientX, ev.clientY);
    }

    function newGame() {
        player1Turn = Math.random() < 0.5;
        gameOver = false;
        gameTied = false;
        createGrid();
    }

    //used to update when the cell is clicked.
    function selectCell() {
        let highlighting = false;
        OUTER: for (let row of grid) {
            for (let cell of row) {
                if (cell.highlight != null) {
                    highlighting = true;
                    cell.highlight = null;
                    cell.owner = player1Turn;
                    if (checkWin(cell.row, cell.col)) {
                        gameOver = true;
                    }
                    break OUTER;
                }
            }
        }

        // don't allow selection if no highlighting
        if (!highlighting) {
            return;
        }

        // check for a tied game
        if (!gameOver) {
            gameTied = true;
            OUTER: for (let row of grid) {
                for (let cell of row) {
                    if (cell.owner == null) {
                        gameTied = false;
                        break OUTER;
                    }
                }
            }

            // set game over
            if (gameTied) {
                gameOver = true;
            }
        }

        // switch the player if no game over
        if (!gameOver) {
            player1Turn = !player1Turn;
        }
    }

    function setDimensions() {
        height = window.innerHeight;
        width = window.innerWidth;
        canv.height = height;
        canv.width = width;
        margin = MARGIN * Math.min(height, width);
        newGame();

  }
