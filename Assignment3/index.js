//Jordan Maisonneuve 10153260 - B05

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let firstConnection = true;
let userArray = new Array();
let chatLog = new Array();

//gets the html file
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  io.emit('chat message', 'A user connected');
  console.log('A user connected, Socket ' + socket.id);
  //restore chat log when user connects/reconnects
  chatLog.forEach((item, i) => {
    io.emit('chat message', item);
  });

  //Create user object with socket id, name, and color
  let newUser = {
    socketId: socket.id,
    username: 'anon',
    nickcolor: Math.floor(100000 + Math.random() * 900000)
  };

  //ensure unique username before pushing to usrArr
  for (var i = 0; i < userArray.length; i++){
    if (userArray[i].username === newUser.username){
      newUser.username = 'anon' + i;
    }
  }
  userArray.push(newUser);
  console.table(userArray);


  socket.on('chat message', function(msg) { //function that is run when chat form is submitted.

    //display/print the message. -- possibly put in a function.
    var timestamp = Date.now();
    date = new Date(timestamp * 1000),
      datevalues = [date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      ];

    var chatMsg = {
      timestamp: datevalues[3] + ':' + datevalues[4] + ':' + datevalues[5],
      username: getUsername(socket), //TODO: get username from socketid  -- getUsername(socket);
      message: msg,
      sender: socket.id
    };

    //put the chat message in the console, screen, and memory backup.
    console.log('message: ' + chatMsg.timestamp + ' ' + chatMsg.username + ": " + chatMsg.message); //TODO get username into msg
    io.emit('chat message', chatMsg.timestamp + ' ' + chatMsg.username + ": " + chatMsg.message);
    chatLog.push(chatMsg.timestamp + ' ' + chatMsg.username + ": " + chatMsg.message);

    //chat functions
    if (msg === 'printUsrArray') {
      console.log(userArray.toString());
      io.emit('chat message', userArray.toString());

    } else if (msg.includes("/nick ")) {
      var newNickName = msg.slice(6);
      console.log('new nickname is:' + newNickName);
      io.emit('chat message', 'Your new nickname is: ' + newNickName);
      //userArray.push(newNickName);
      io.emit('user list update', newNickName);

      io.emit('update top display', newNickName);
    } else if (msg.includes("/nickcolor ")) {

      var nickColorRRGGBB = msg.slice(11);

      io.emit('nickname color change', nickColorRRGGBB.toString());
      //emit another event to change the color of the html text!

      io.emit('chat message', 'You new nickname color is: ' + nickColorRRGGBB);
      console.log('nickname color RRGGBB is:' + nickColorRRGGBB);
    }
  });

  socket.on('disconnect', function() {
    console.log('a user disconnected');
    io.emit('chat message', 'A user disconnected. Socket ' + socket.id);
    //find out which user disconnected to remove them from the usr array list.
    for (var i = 0; i < userArray.length; i++){
      if (userArray[i].socketId === socket.id){
        userArray.splice(i, 1);
      }
    }
    console.table(userArray);


  });
});

io.emit('some event', {
  someProperty: 'some value',
  otherProperty: 'other value'
}); // This will emit the event to all connected sockets

http.listen(3000, function() {
  console.log('listening on *:3000');
});

function getUsername(Socket socket){ //tbd not sure how to use that as parameter
  var userName = "";
  for (var i = 0; i < userArray.length; i++){
    if (userArray[i].socketId === socket.Id){
        return userName;
    }
  }
}
