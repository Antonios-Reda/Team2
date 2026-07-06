const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/', (req, res) => res.send('WebRTC signaling server ✅'));

io.on('connection', (socket) => {
  console.log('🔹 Peer connected', socket.id);

  // ── Health-check ping/pong ──────────────────────────────────────────────────
  socket.on('call:ping', () => socket.emit('call:pong'));

  // ── Room management ──────────────────────────────────────────────────────────
  socket.on('call:join', (data) => {
    socket.join(data.appointmentId);
    console.log(`📞 ${socket.id} joined room ${data.appointmentId}`);
    // Notify others in the room that someone joined
    socket.to(data.appointmentId).emit('call:peer-joined', { socketId: socket.id });
  });

  // ── Signaling events — forwarded to the other peer(s) in the room ──────────
  socket.on('call:offer', (data) => {
    console.log(`📤 Offer from ${socket.id} → room ${data.appointmentId}`);
    socket.to(data.appointmentId).emit('call:offer', data);
  });

  socket.on('call:answer', (data) => {
    console.log(`📥 Answer from ${socket.id} → room ${data.appointmentId}`);
    socket.to(data.appointmentId).emit('call:answer', data);
  });

  socket.on('call:ice-candidate', (data) => {
    socket.to(data.appointmentId).emit('call:ice-candidate', data);
  });

  socket.on('call:leave', (data) => {
    socket.leave(data.appointmentId);
    socket.to(data.appointmentId).emit('call:peer-left', { socketId: socket.id });
    console.log(`👋 ${socket.id} left room ${data.appointmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔻 Peer disconnected', socket.id);
  });
});

const PORT = process.env.WEBRTC_PORT || 5002;
server.listen(PORT, () => console.log(`🚀 Signaling server listening on port ${PORT}`));
