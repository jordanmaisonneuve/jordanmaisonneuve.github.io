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
  //restore chat log when user connects/reconnects
  chatLog.forEach((item, i) => {
    io.emit('chat message', item);
  });

  //dealing with username stuff
  var usrName = 'user0'; //initial user name
  if (firstConnection){
    var usrNameMsg = 'Your username is: ' + usrName;
    io.emit('update top display', usrName);
    console.log(usrNameMsg);
    io.emit('chat message', usrNameMsg);
    userArray.push(usrName);
    io.emit('user list update', userArray);
    firstConnection = false;

  } else {
    userArray.forEach((item, i) => {

      if (usrName === item) { //condition to determine if username is unique.
        var randNames = ['anon', 'bigdaddy', 'soup', 'killerwhale', 'zack', '42069'];

        usrName = randNames[i];
        var usrNameMsg = 'Your username is: ' + usrName;
        io.emit('update top display', usrName);
        console.log(usrNameMsg);
        userArray.push(usrName);

        io.emit('chat message', usrNameMsg);
        io.emit('user list update', usrName);
      }
    });
  }

  //end username stuff

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
      username: 'aaa',
      message: msg
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
      userArray.push(newNickName);
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
    io.emit('chat message', 'A user disconnected.')
    //find out which user disconnected to remove them from the usr array list.
    //userArray.pop(userName);

  });
});

io.emit('some event', {
  someProperty: 'some value',
  otherProperty: 'other value'
}); // This will emit the event to all connected sockets

http.listen(3000, function() {
  console.log('listening on *:3000');
});
