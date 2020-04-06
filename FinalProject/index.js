//Jordan Maisonneuve 10153260 - B05

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});

//this will be the main game logic
io.on('user move', function (){
  console.log('user move detected from');
});

io.on('create with code', function(){


});

io.on('new game', function(){
  console.log('a new game has begun!');

});
