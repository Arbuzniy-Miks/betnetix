const { generateRace } = require('../services/raceGenerator');
const { calculateProbabilities } = require('../services/probabilityCalculator');


function generateRunnerData() {
  const newRunners = [];
  
  for (let i = 1; i <= 6; i++) {
      // Генерация случайного цвета в HEX формате
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      
      // Генерируем ускорение от 3 до 7 м/с²
      const acceleration = (Math.random() * 4 + 3).toFixed(2);
      
      // Генерируем максимальную скорость от ускорения до 10 м/с
      const maxSpeed = Math.max(
          parseFloat(acceleration),
          (Math.random() * (10 - parseFloat(acceleration)) + parseFloat(acceleration)
      ).toFixed(2));
      const speedLoss = (Math.random() * 0.3 + 0.1).toFixed(2);
      const reactionTime = (Math.random() * 0.2 + 0.1).toFixed(2);
      
      newRunners.push({
          id: i,
          name: `${i}`,
          reactionTime: reactionTime,
          acceleration: acceleration,
          maxSpeed: maxSpeed,
          speedLoss: speedLoss,
          color: randomColor
      });
  }
  
  return newRunners;
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);
    
    // Отправляем начальные данные при подключении
    socket.emit('runnerData', generateRunnerData());
    
    // Обработка запроса на генерацию новых данных
    socket.on('requestRunnerData', () => {
        socket.emit('runnerData', generateRunnerData());
    });
    
    // Обработка результатов забега
    socket.on('raceResults', (results) => {
        console.log('Получены результаты забега:', results);
    });
    
    socket.on('disconnect', () => {
        console.log('Клиент отключился:', socket.id);
    });
});
};