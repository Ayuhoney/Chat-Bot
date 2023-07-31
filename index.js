"use strict";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

app.use('/public', express.static('public'))

app.get('/', (req, res) =>  {
  res.sendFile(__dirname + '/'); 
});


let usernames = {};

const check_key = v =>{
	let val = '';	
	for(let key in usernames){
		if(usernames[key] == v)	val = key;
	}
	return val;
}

io.on('connection',  socket => {
	
	socket.on('sendchat', data => io.emit('updatechat', socket.username, data));

	
	socket.on('adduser', username => {
	
		socket.username = username;
		
		usernames[username] = socket.id;
	
		socket.emit('updatechat', 'Chat Bot', `${socket.username} you have joined the chat`);
	
		socket.emit('store_username', username);
	
	});


	socket.on('disconnect', () => {
		
		delete usernames[socket.username];
	
	});
	

	socket.on('check_user', (asker, id) => io.to(usernames[asker]).emit('msg_user_found', check_key(id)));
	
	
	socket.on('msg_user', (to_user, from_user, msg) => {
		
		io.to(usernames[to_user]).emit('msg_user_handle', from_user, msg);
				
		const wstream = fs.createWriteStream('chat_data.txt');		
		wstream.write(msg);
		wstream.write('\r\n');
		wstream.end();
		
	});


});

http.listen(3000, () => console.log('listening on *:3000'));
    
