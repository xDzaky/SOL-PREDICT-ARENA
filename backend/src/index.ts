import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  socket.on('join_matchmaking', (data) => {
    console.log('join_matchmaking', data);
    socket.emit('match_found', { gameId: 'game_' + Date.now() });
  });

  socket.on('make_prediction', (data) => {
    console.log('make_prediction', data);
  });

  socket.on('disconnect', () => console.log('disconnect', socket.id));
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
