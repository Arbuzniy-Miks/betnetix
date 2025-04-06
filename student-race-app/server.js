const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
app.use(express.static('public'));
app.use(express.static(__dirname));
const io = socketio(server, {
  
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

require('./sockets/raceSocket')(io);

const { sequelize } = require('./models');

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);
  
  // Отправка начальных данных при запросе
  socket.on('requestInitialData', () => {
      console.log('Клиент запросил начальные данные');
      const initialData = generateRunnerData();
      socket.emit('initialData', initialData);
      console.log('Отправлены начальные данные:', initialData);
  });
  
  // Обработка запроса на генерацию новых данных
  socket.on('generateData', () => {
      console.log('Запрос на генерацию новых данных от', socket.id);
      const newData = generateRunnerData();
      socket.emit('newData', newData);
      console.log('Отправлены новые данные:', newData);
  });
  
  // Обработка запроса на начало забега
  socket.on('startRace', (runnersData) => {
      console.log('Запрос на начало забега от', socket.id);
      socket.emit('raceStarted', runnersData);
      console.log('Отправлен сигнал о начале забега');
  });
  
  socket.on('disconnect', () => {
      console.log('Клиент отключился:', socket.id);
  });
});

sequelize.sync({ alter: true }) // или { force: true } для сброса
  .then(() => {
    console.log("БД синхронизирована");
  })
  .catch(err => {
    console.error("Ошибка подключения к базе данных:", err);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));