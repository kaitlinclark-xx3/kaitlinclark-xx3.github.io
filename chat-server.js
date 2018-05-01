// Require the packages we will use:
var http = require('http'),
	socketio = require("socket.io"),
	fs = require('fs'),
	users = require('./modules/users.js'),
	rooms = require('./modules/rooms.js');

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){

	// This callback runs when a new connection is made to our HTTP server.
	fs.readFile("client/client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.
		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);



//make a message to send		 
var make_new_message = function(from, text){
    return{
        from,
        text,
        createdAt: new Date().getTime()
    };
};

//custom namespace
var chat = io
		 .of('/chat');
		 chat.on('connection', function(sock){
			/*storing users
				*use sock.id =>unique for every user
				*	attach username
				*	attach roomname*/
			console.log('user connected to chat');
			//user has joined server => save it for users
			sock.on('user_joined', function(user){
				users.setUser(user.username, sock.id);
				console.log('username set to: '+user.username);
			});
			//message sent from client displayed on console
			sock.on('create_new_message', function(message){
                console.log('new message created ', message);
				//emit to EVERYONE in chat ROOM
				var user = users.getUser(sock.id);
				if(user){
					chat.to(user.room).emit('added_new_message', make_new_message(user.username, message.text));
				}
				
			});
			///////////////////////////////
			///////////USER LEAVES/////////
			//////////////////////////////
			sock.on('disconnect', function(){
				console.log('user disconnected from chat');
				var user = users.remove_user(sock.id);
				if(user){
					
					
					//update usernames displayed in chat
					chat.to(user.room).emit('update_users', users.getUsers(user.room));
					
					//tell everyone in chat that user has left
					chat.to(user.room).emit('added_new_message', make_new_message('Chat_Bot', user.username+' has left chat room'));
				}
			});
			//////////////////////////////
			/////USER JOINS CHAT ROOM/////
			/////////////////////////////
			sock.on('join_room', function(room_info){
				var roomname = room_info.roomname;
				var public_stat = room_info.public_stat;
				var username = users.getUser(sock.id).username;
				console.log('here is the room name  on server '+roomname);
				//validate data (make sure they are nor empty or number)
			if(rooms.isUniqueName(roomname)){
				//if client asked for private chat => proceed as usual
				if(!public_stat){
					if(users.getUsers(roomname).length >2){//if someone already made the chat
						sock.emit('getPass');//have client input password
					}
				}
					sock.join(roomname);//how to join a room
				
				//add room to list of chats
				rooms.add_room(sock.id, roomname, username, public_stat);
				chat.to(roomname).emit('update_rooms', rooms.getRooms(username));
				console.log('room added to list of all ');

				//make sure there is not already same user in another room
				users.remove_user(sock.id);
				
				//add user to list of users once user joins
				users.add_user(sock.id, username, roomname);
				chat.to(roomname).emit('update_users', users.getUsers(roomname));
					
					//socket.broadcast.emit -> sock.broadcast.to(room).emit
						//from: 'Chat_Bot'
						//text: 'new user added'
						console.log('roomname is: '+roomname);
					sock.broadcast.to(roomname).emit('added_new_message', make_new_message('Chat_Bot', username+' added to chat room'));
					//emit to user once user connects
						//from: 'Chat_Bot'
						//text: 'Hey {username}! Welcome to Chat App'
					sock.emit('added_new_message', make_new_message('Chat_Bot', 'Hey '+username+'! Welcome to this chat room'));
				
			}
			else{
				console.log('roomname is not unique');
			}
				
			});
			sock.on('get_chats', function(user){
				var r = rooms.getRooms(user.username);
				sock.emit('display_chats', r);
			});
		});