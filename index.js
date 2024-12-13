const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname + "/"));

const MAX_ROOMS = 100;
const games = Array.from({ length: MAX_ROOMS }, () => ({ players: 0, playerIds: [0, 0] }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    let playerId = Math.floor(Math.random() * 1000) + 1;
    console.log(`Player ${playerId} connected.`);

    socket.on('joined', (roomId) => {
        if (!games[roomId]) {
            console.error(`Room ID ${roomId} does not exist.`);
            socket.emit('error', 'Invalid room ID.');
            return;
        }

        if (games[roomId].players >= 2) {
            console.log(`Room ${roomId} is full.`);
            socket.emit('full', roomId);
            return;
        }

        games[roomId].playerIds[games[roomId].players] = playerId;
        games[roomId].players++;

        const color = games[roomId].players % 2 === 0 ? 'black' : 'white';
        console.log(`Player ${playerId} joined room ${roomId} as ${color}.`);

        socket.emit('player', { playerId, players: games[roomId].players, color, roomId });
    });

    socket.on('move', (msg) => {
        console.log(`Player ${playerId} made a move:`, msg);
        socket.broadcast.emit('move', msg);
    });

    socket.on('play', (msg) => {
        console.log(`Player ${playerId} is ready to play:`, msg);
        socket.broadcast.emit('play', msg);
    });

    socket.on('disconnect', () => {
        for (let i = 0; i < MAX_ROOMS; i++) {
            const playerIndex = games[i].playerIds.indexOf(playerId);
            if (playerIndex !== -1) {
                games[i].playerIds[playerIndex] = 0;
                games[i].players--;
                console.log(`Player ${playerId} left room ${i}.`);
                break;
            }
        }
        console.log(`Player ${playerId} disconnected.`);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
