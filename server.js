const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
const chatFile = 'chat.txt';

// Serviamo i file statici della cartella "public" (che creeremo dopo)
app.use(express.static(path.join(__dirname, 'public')));

// Quando un utente si connette
io.on('connection', (socket) => {
  console.log('Nuovo utente connesso');

  // Invia la cronologia chat all'utente appena connesso
  fs.readFile(chatFile, 'utf8', (err, data) => {
    if (!err && data) {
      socket.emit('chatHistory', data.split('\n'));
    }
  });

  // Quando un utente invia un messaggio
  socket.on('message', (msg) => {
    const message = `${new Date().toISOString()} - ${msg}`;

    // Salva il messaggio nel file di testo
    fs.appendFile(chatFile, message + '\n', (err) => {
      if (err) console.error('Errore nel salvare il messaggio:', err);
    });

    // Invia il messaggio a tutti gli utenti connessi
    io.emit('message', message);
  });

  // Quando un utente si disconnette
  socket.on('disconnect', () => {
    console.log('Utente disconnesso');
  });
});

// Avvia il server
server.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
