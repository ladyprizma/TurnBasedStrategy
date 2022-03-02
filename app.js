const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var yukseklik = 15;
var genislik = 30;
var dogumNoktasi = 0;
var oyuncular = [];
var turnNumber = 0;
app.use('/static', express.static(__dirname + '/static'));
app.get("/", (req,res)=>{
	res.sendFile("index.html" , { root : __dirname});
});

io.on('connection', (socket) => {
	dogumNoktasi = getRndInteger(0,yukseklik*genislik);
	oyuncular.push({'dogumNoktasi': dogumNoktasi, 'socket': socket.id});
  socket.emit('playerInit',{'dogumNoktasi':dogumNoktasi,'turnName': oyuncular[turnNumber].socket});
  socket.broadcast.emit('otherPlayerInit',{'dogumNoktasi':dogumNoktasi, 'socket': socket.id});
  socket.emit('otherPlayerInitonEnter',{'oyuncular':oyuncular});
  //oyuncu bağlantı koptu
	socket.on('disconnect', function() {
		for(var i=0;i<oyuncular.length;i++){
			if(oyuncular[i].socket == socket.id){
				oyuncular.splice(i,1);
				break;
			}
		}
		io.emit('playerdisconnect',{'socket':socket.id});
	});
	socket.on('chatMsg', (msg) => {
		io.emit('chatMsgR', {'msg':msg.msg,'playerid':socket.id});
	});
	socket.on('endTurn', (msg) => {
		if(oyuncular[turnNumber].socket == socket.id){
			if(turnNumber < oyuncular.length-1){
			turnNumber += 1;
			}else{
				turnNumber = 0;
			}
			io.emit('endTurnR', {'playerid':oyuncular[turnNumber].socket});
		}
	});
	socket.on('unitMove', (msg) => {
		socket.broadcast.emit('unitMoveR', {'unit':msg.unit,'tile':msg.tile});
	});
});

server.listen(process.env.PORT,()=>{
	console.log("basladi");
});
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
//ss