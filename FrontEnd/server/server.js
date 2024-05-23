const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// Configura CORS
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://estoquify.es",  // URL de tu aplicación Angular
    methods: ["GET", "POST"]
  }
});

const users = {}; // Almacenar usuarios conectados

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Manejar inicio de sesión de usuarios
  socket.on('login', (username) => {
    users[socket.id] = username; // Asociar el ID del socket con el nombre de usuario
    console.log(`Usuario ${username} se ha conectado`);
  });

  // Manejar desconexión de usuarios
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id]; // Eliminar usuario de la lista de usuarios conectados
      console.log(`Usuario ${username} se ha desconectado`);
    }
  });

  // Manejar mensajes privados
  socket.on('private message', ({ to, message }) => {
    const fromUsername = users[socket.id]; // Obtener el nombre de usuario del remitente
    const toSocketId = Object.keys(users).find(id => users[id] === to); // Obtener el ID del socket del usuario destinatario
    if (toSocketId) {
      // Enviar mensaje privado al usuario destinatario con el nombre de usuario del remitente
      io.to(toSocketId).emit('private message', { from: fromUsername, message });
    } else {
      // Manejar caso de usuario no encontrado
      console.log(`Usuario ${to} no encontrado`);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
