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

  socket.on('user move', function (){
    console.log('user move detected from: ' + getUsername(socket));
    //going to need to send information to update the display for the connected users
  });

  socket.on('new game', function () {
    //should require two users, server should validate
    console.log('a new game has begun');
  });

  socket.on('create with code', function(gameCode){
    console.log('create with code received from ' + getUsername(socket));
    console.log('game code received: ' + gameCode);

    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].gameCode === gameCode){
        //todo: start a new game with these two users...

      }
    }

  });

  socket.on('join random game', function (){
    console.log('join random game received...\nchecking queue for players');
    for (var i = 0; i < randomGameQueue.length; i++){
      if (randomGameQueue[i] === socket.id){
        console.log('You are already in the queue, please wait.');
        //todo tell the client too.
        return;
      }
    }
    randomGameQueue.push(socket.id);
    console.table(randomGameQueue);
    if (randomGameQueue.length > 1){
      //todo, need to give this to the two socket ids that are in the queue.
      socket.emit('start random game');
      randomGameQueue = []; //only the server needs to know who the opponent is, the rest can be forwarded,
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
