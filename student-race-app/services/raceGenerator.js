// services/raceGenerator.js

const { Race, Result, Athlete } = require('../models');
const { shuffle } = require('../utils/shuffle');

async function generateRace() {
  const race = await Race.create(); // создаём забег

  const athletes = await Athlete.findAll(); // получаем всех участников
  const positions = shuffle([1, 2, 3, 4, 5, 6]); // случайное распределение мест

  // Записываем результаты забега
  for (let i = 0; i < athletes.length; i++) {
    await Result.create({
      race_id: race.id,
      athlete_id: athletes[i].id,
      position: positions[i],
    });
  }

  return race;
}

module.exports = { generateRace };