//Jordan Maisonneuve 10153260 - B05

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var userArray = new Array();
var gameCodesArray = new Array();
var randomGameQueue = new Array();

//to store where the games are and which players are in which game with which code.
var activeGamesList = new Array();

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  //TODO determine if user has been here before... cookie?

  console.log('a user connected socket: ' + socket.id);

  let newUser = {
    socketId: socket.id,
    username: getNickName(),
    isInGame: false, //tbd
    gameCode: generateGameCode()
  }

  //assign new unique username.
  for (var i = 0; i < userArray.length; i++){
    if (userArray[i].username === newUser.username){
      newUser.username = getNickName();
    }
  }

  //emit the game code to the client
  var gameCodeText = newUser.gameCode;
  socket.emit('update game code', 'Your gamecode is ' + gameCodeText);
  socket.emit('update username display', 'Your username is ' + newUser.username);
  userArray.push(newUser); //add user to the connected users array.
  console.table(userArray);


  socket.on('update username', function(uname){
    if (uname === ""){
      socket.emit('update username display', 'Invalid username entered');
      return;
    }
    var oldName = "";
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        oldName = userArray[i].username;
        if (oldName === uname){
          return;
        }
        userArray[i].username = uname; //update users username
        socket.emit('update username display', 'Your username is ' + userArray[i].username); //update the client
      }
    }
    console.log('username for socket ' + socket.id + ' updated from ' + oldName + ' to ' + uname);
    console.table(userArray);
  });

  socket.on('user move', function (cellSelected){
    console.log('user move detected from: ' + getUsername(socket) + '\ncell selected was ' + cellSelected);
    //going to need to send information to update the display for the connected users
    var game = getGame(socket.id);
    //update the game board with their move, send parameter....
    //game.grid[cellSelected[0]][cellSelected[1]] = game.player1Turn;
    game.player1Turn = !game.player1Turn;

    //update the moves for the users.

  });

  socket.on('create with code', function(gameCode){
    console.log('create with code received from ' + getUsername(socket) + ' game code received: ' + gameCode);
    
    for (var i = 0; i < userArray.length; i++){
      console.log('game code at index ' + i + ': ' + userArray[i].gameCode);
      if (userArray[i].gameCode == gameCode){

        console.log('game code match found!');
        newGame(socket.id, userArray[i].socketId);
        var game = getGame(socket.id);
        var gameboard = game.grid;
  
        if (game.player1Turn){
          io.to(socket.id).emit('start game your turn', gameboard);
          io.to(userArray[i].socketId).emit('start game', gameboard);
        }
        else{
          io.to(socket.id).emit('start game', gameboard);
          io.to(userArray[i].socketId).emit('start game your turn', gameboard);
        }

        //todo add isingame true!
        userArray[i].isInGame = true;
        var usr = getUser(socket);
        console.log('user found ' + usr);
        usr.isInGame = true;
        console.table(userArray);
        return;
      }
    }
    //else game code was not found.
    console.log('loop done...');
    socket.emit('update game code', "Game code was not found. Try Again.");

  });


  socket.on('join random game', function (){
    console.log('join random game received...\nchecking queue for players');
    for (var i = 0; i < randomGameQueue.length; i++){
      if (randomGameQueue[i] === socket.id){
        console.log('You are already in the queue, please wait.');
        return;
      }
    }
   
    randomGameQueue.push(socket.id);
    console.table(randomGameQueue);
    if (randomGameQueue.length > 1){
      for (var i = 0; i < userArray.length; i++){
          if( randomGameQueue[0] === userArray[i].socketId || randomGameQueue[1] === userArray[i].socketId ){
              userArray[i].isInGame = true;
          }
      }

      newGame(randomGameQueue[0], randomGameQueue[1]);
      var game = getGame(randomGameQueue[0]);
      var gameboard = game.grid;

      if (game.player1Turn){
        io.to(randomGameQueue[0]).emit('start game your turn', gameboard);
        io.to(randomGameQueue[1]).emit('start game', gameboard);
      }
      else{
        io.to(randomGameQueue[0]).emit('start game', gameboard);
        io.to(randomGameQueue[1]).emit('start game your turn', gameboard);
      }

      randomGameQueue = [];

    }
  });


  //remove a user when they disconnect
  socket.on('disconnect', function() {
    console.log(getUsername(socket) + ' has disconnected.');
    //find out which user disconnected to remove them from the usr array list.
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        var codeIndex = gameCodesArray.indexOf(userArray[i].gameCode);
        if (codeIndex !== -1) gameCodesArray.splice(codeIndex, 1);
        userArray.splice(i, 1);
      }
    }
  });

});


server.listen(3000, function(){
  console.log('listening on *:3000');
});

//conect 4 game functions
// game parameters

const PLAYER_CELL_EMPTY = null;
const PLAYER1_CELL = true;
const PLAYER2_CELL = false;

const GRID_CIRCLE = 0.7; // circle size as a fraction of cell size
const GRID_COLS = 7; // number of game columns
const GRID_ROWS = 6; // number of game rows
const MARGIN = 0.02; // margin as a fraction of the shortest screen dimension

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
  draw( /** @type {CanvasRenderingContext2D} */ ctx) {

    // owner colour - - going to need to change this?
    let color = this.owner == null ? bgcolor : this.owner ? COLOR_PLAY1 : COLOR_PLAY2;

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

//... i dont have these here nor do i care about them here .....
var height, width, margin;

function createGrid() {
  grid = [];

  // populate the grid
  for (let i = 0; i < GRID_ROWS; i++) {
    grid[i] = [];
    for (let j = 0; j < GRID_COLS; j++) {
      grid[i][j] = PLAYER_CELL_EMPTY;
    }
  }
  return grid;
}


//move to server.
function checkWin(row, col) {
  // get all the cells from each direction
  let diagL = [],
    diagR = [],
    horiz = [],
    vert = [];
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
  let count = 0,
    lastOwner = null;
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

 

//creates a new game with two player socket ids.
function newGame(p1, p2) {
  let nGame = {
    player1: p1,
    player2: p2,
    grid: createGrid(),
    gameOver: false,
    player1Turn: Math.random() < 0.5
  };

  activeGamesList.push(nGame);
  console.table(activeGamesList);

  
}



//helper functions

//creates a random unique 6 digit code for a game to be joined
function generateGameCode(){
  var code = Math.floor(100000 + Math.random() * 900000);
  for (var i = 0; i < gameCodesArray.length; i++){
    if (gameCodesArray[i] === code){
      //if code already exists, create a new one
      code = Math.floor(100000 + Math.random() * 900000);
    }
  }
  gameCodesArray.push(code); //mgoing to need to pop off when game is made.
  return code;
}

//gets username from socket id
function getUsername(socket){
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        return userArray[i].username;
      }
    }
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function getNickName(){
  var nickNames = [
    "Boo",
    "Fox",
    "Tyke",
    "Twix",
    "Donut",
    "Biffle",
    "Giggles",
    "Righty",
    "Fly",
    "Bacon",
    "Lil Girl",
    "Goblin",
    "Duckling",
    "Lulu",
    "Frodo",
    "Flyby",
    "Sweet Tea",
    "Beauty",
    "Chip",
    "Shuttershy",
    "Rosebud",
    "Sunny",
    "Colonel",
    "Snake",
    "Monkey",
    "Tarzan",
    "Pyscho",
    "Snickerdoodle",
    "Doc",
    "C-Dawg",
    "Freckles",
    "Joker",
    "Dork",
    "Grumpy",
    "Sweety",
    "T-Dawg",
    "Baldie",
    "Guapo",
    "Baby Bird",
    "Moose",
    "Chiquita",
    "Terminator",
    "Baby Cakes",
    "Peppermint",
    "Double Bubble",
    "Bud",
    "Beef",
    "French Fry",
    "Janitor",
    "Piglet",
    "Boomhauer",
    "Jet",
    "Gizmo",
    "Nerd",
    "Gummi Bear",
    "Bridge",
    "Lovely"
 ];

 return nickNames[Math.floor(Math.random() * nickNames.length )];

}

//gets a game from either of the socket ids
function getGame(socketId){
  for (var i = 0; i < userArray.length; i++){
    for (var j = 0; j < activeGamesList.length; j++){
      if (userArray[i].socketId === socketId){
        return activeGamesList[j];
      }
    }
  }
}

function getUser(socket){
  for (var i = 0; i < userArray.length; i++){
    if (userArray[i].socketId === socket.id){
      return userArray[i];
    }
  }
  return null;
}