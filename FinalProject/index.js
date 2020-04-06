//Jordan Maisonneuve 10153260 - B05

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var userArray = new Array();

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected socket: ' + socket.id);

  let newUser = {
    socketId: socket.id,
    username: 'anon123',
    nickcolor: 'FFFFFF',
    isInGame: false //tbd
  }

  for (var i = 0; i < userArray.length; i++){
    if (userArray[i].username === newUser.username){
      newUser.username = 'anon123-' + i;
    }
  }

  userArray.push(newUser);
  console.table(userArray);

  //this will be the main game logic
  socket.on('user move', function (){
    console.log('user move detected from socket: ' + socket.id);
    //going to need to send information to update the display for the connected users
  });

  socket.on('new game', function () {
    //should require two users, server should validate
    console.log('a new game has begun');
  });

  //remove a user when they disconnect
  socket.on('disconnect', function() {
    console.log('A user disconnected. Socket ' + socket.id);
    //find out which user disconnected to remove them from the usr array list.
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        userArray.splice(i, 1);
      }
    }
    console.table(userArray);
  });
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});



io.on('create with code', function(){


});
