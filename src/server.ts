import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store chat history
const chatHistory: string[] = [];
const HISTORY_LIMIT = 100; // Keep last 100 messages

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('User connected');
  
  // Send chat history to newly connected users
  socket.emit('chat history', chatHistory);

  socket.on('stream', (data) => {
    // Broadcast the stream data to all other connected clients
    socket.broadcast.emit('stream', data);
  });

  socket.on('chat message', (msg: string) => {
    // Store message in history
    chatHistory.push(msg);
    if (chatHistory.length > HISTORY_LIMIT) {
      chatHistory.shift(); // Remove oldest message if limit reached
    }
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Clear the chat history array
chatHistory.length = 0;

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
