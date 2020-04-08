//Jordan Maisonneuve 10153260 - B05

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var userArray = new Array();
var gameCodesArray = new Array();
var randomGameQueue = new Array();


app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  //TODO determine if user has been here before... cookie?

  console.log('a user connected socket: ' + socket.id);

  let newUser = {
    socketId: socket.id,
    username: 'anon123',
    nickcolor: 'FFFFFF',
    isInGame: false, //tbd
    gameCode: generateGameCode()
  }

  for (var i = 0; i < userArray.length; i++){
    if (userArray[i].username === newUser.username){
      newUser.username = 'anon123-' + i;
    }
  }

  //emit the game code to the client
  socket.emit('update game code', newUser.gameCode);
  socket.emit('update username', newUser.username);
  userArray.push(newUser); //add user to the connected users array.
  console.table(userArray);


  socket.on('update username', function(uname){
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        userArray[i].username = uname; //update users username
        socket.emit('update username', userArray[i].username); //update the client
      }
    }
    console.log('username for socket ' + socket.id + ' updated to ' + uname);
    console.table(userArray);
  });

  socket.on('user move', function (){
    console.log('user move detected from socket: ' + socket.id);
    //going to need to send information to update the display for the connected users
  });

  socket.on('new game', function () {
    //should require two users, server should validate
    console.log('a new game has begun');
  });

  socket.on('create with code', function(){
    console.log('create with code received');

  });

  socket.on('join random game', function (socket){
    randomGameQueue.push(socket);
    console.log('join random game received');
    while(true){
      if (randomGameQueue.length > 1){
        io.emit('start random game', randomGameQueue[0], randomGameQueue[1]);
        randomGameQueue = [];
      }
      sleep(5000); //sleep 5 seconds before checking again.
    }
  });

  //remove a user when they disconnect
  socket.on('disconnect', function() {
    console.log('A user disconnected. Socket ' + socket.id);
    //find out which user disconnected to remove them from the usr array list.
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        var codeIndex = gameCodesArray.indexOf(userArray[i].gameCode);
        if (codeIndex !== -1) gameCodesArray.splice(codeIndex, 1);

        userArray.splice(i, 1);

      }
    }
    console.table(userArray); //print the user array after the disconnect
  });
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});

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
  console.table(gameCodesArray);
  return code;
}

//gets username from socket id
function getUsername(socket){
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        return userArray[i].userName;
      }
    }
}
