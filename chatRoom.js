//import necessary modules
//var mysql = require('mysql');
var express = require('express');
var app = express();
var url = require('url');
var fs = require('fs');
var http = require('http');
var io = require('socket.io')(http);

//display (send) HTML file 
app.get('/', function(request, response){
    response.sendFile(__dirname+'/startingChat.html');
});
//diplaying one chat
io.on('connection', function(event){
    event.on('message', function(msg){
        //display message
       io.emit('message', msg);
    });
});
http.Server(app).listen(3456);


//connect to databases
/*var con = mysql.createConnection({
    host: "localhost",
    user: "chatterbox",
    password: "chatterBox123",
    database: "chats"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});*/
//create HTTP server on port 3456
/*http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var q = url.parse(req.url, true).query;
  var txt = q.year + " " + q.month;
  res.end(txt);
  //Open a file on the server and return it's content:
  fs.readFile('startingChat.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
    });
}).listen(3456);*/