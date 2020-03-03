var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let userArray = new Array();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

  console.log('a user connected');

  var usrName;
  userArray.forEach((item, i) => {
    console.log(item);
    if (usrName === item) {
      usrName = 'user' + i;
      var usrNameMsg = 'Your username is: ' + usrName;
      console.log(usrNameMsg);
      io.emit('chat message', usrNameMsg);
    }
  });

  userArray.push(usrName)

  socket.on('chat message', function(msg) {

    console.log('message: ' + msg);
    io.emit('chat message', msg);

    const nickName = "/nick";

    if (msg === 'printUsrArray') {
      userArray.forEach(element => console.log(element));
    } else if (msg.includes("/nick")) {

    }



  });

  //display which user disconnected?>
  socket.on('disconnect', function() {
    console.log('a user disconnected');
  });
});

io.emit('some event', {
  someProperty: 'some value',
  otherProperty: 'other value'
}); // This will emit the event to all connected sockets

//to be replaced with var port # which is website url??
http.listen(3000, function() {
  console.log('listening on *:3000');
});
