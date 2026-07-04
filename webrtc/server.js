const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.get('/', (req, res) => res.send('WebRTC signaling server'));

io.on('connection', socket => {
  console.log('🔹 Peer connected', socket.id);
  socket.on('call:join', data => socket.join(data.appointmentId));
  socket.on('call:offer', data => socket.to(data.appointmentId).emit('call:offer', data));
  socket.on('call:answer', data => socket.to(data.appointmentId).emit('call:answer', data));
  socket.on('call:ice-candidate', data => socket.to(data.appointmentId).emit('call:ice-candidate', data));
  socket.on('call:leave', data => socket.leave(data.appointmentId));
  socket.on('disconnect', () => console.log('🔻 Peer disconnected'));
});

const PORT = process.env.WEBRTC_PORT || 5002;
server.listen(PORT, () => console.log(`🚀 Signaling server listening on ${PORT}`));
