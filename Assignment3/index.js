var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


let firstConnection = true; //for username array.. tbd
let userArray = new Array();
let chatLog = new Array(); //todo: put chat log on scrn when user reconnects.

//TODO get user info when a message is sent!!!!!

//gets the html file
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket) {
  console.log('a user connected');

  //restore chat log when user connects/reconnects
  chatLog.forEach((item, i) => {
    io.emit('chat message', item);
  });

  //dealing with username stuff -- put in its own function?
  var usrName = 'user0'; //initial user name
  io.emit('chat message', 'A user connected');


  userArray.forEach((item, i) => {
    console.log('in for loop item: ' + item);

    if (firstConnection){
        userArray.push(usrName);
        //console.log('sending user list update.');
        //io.emit('chat message', 'sending user list update.');
        //io.emit('user list update', userArray);
        firstConnection = false;
        return;
    }
    if (usrName === item) {
      usrName = 'user' + i;
      var usrNameMsg = 'Your username is: ' + usrName;
      console.log(usrNameMsg);
      userArray.push(usrName);
      //io.emit('user list update', usrName);
    }
  });
  io.emit('chat message', 'Your username is: ' + usrName);
  //end username stuff

  socket.on('chat message', function(from, msg) {

    //display/print the message. -- possibly put in a function.
    console.log('message: ' + Date.now() + ' ' + from + ': ' + msg); //TODO get username into msg
    io.emit('chat message', Date.now() + ' ' + from + ': ' + msg);
    chatLog.push(Date.now() + ' ' + from + ' ' + msg); //tbd format date?

    //chat functions
    if (msg === 'printUsrArray') {

      console.log(userArray.toString());
      io.emit('chat message', userArray.toString());

    } else if (msg.includes("/nick")) {
      console.log('nickname change command:' + msg);
      io.emit('chat message', 'nickname change command');
      //todo: ensure nickname is not blank & is not already taken
      var newNickName = msg.slice(6);
      console.log('new nickname is:' + newNickName);

    } else if (msg.includes("/nickcolor ")) {

      console.log('nickname color change command');
      io.emit('chat message', 'nickname color change command');
      var nickColorRRGGBB = msg.slice(11);
      //todo: ensure nickColorRRGGBB is valid
      console.log('nickname color RRGGBB is:' + nickColorRRGGBB);
    }
  });


  //todo?: display which user disconnected?
  socket.on('disconnect', function() {
    console.log('a user disconnected');
    io.emit('chat message', 'A user disconnected.')
    //find out which user disconnected to remove them from the usr array list.

  });
});

io.emit('some event', {
  someProperty: 'some value',
  otherProperty: 'other value'
}); // This will emit the event to all connected sockets

http.listen(3000, function() {
  console.log('listening on *:3000');
});
