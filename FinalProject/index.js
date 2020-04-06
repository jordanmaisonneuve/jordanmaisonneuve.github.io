//Jordan Maisonneuve 10153260 - B05

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//this will be the main game logic
io.on('user move', function (){

});

io.on('create with code', function(){


});