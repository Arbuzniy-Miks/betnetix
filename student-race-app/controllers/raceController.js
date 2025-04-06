const { generateRace } = require('../services/raceGenerator');
const { simulateRaceWithPhysics } = require('../services/physicsModel');
const { calculateProbabilities, pairedTop2Stats } = require('../services/probabilityCalculator');
const { Race, Result, Athlete } = require('../models');


// Генерация случайного забега
const generateRandomRace = async (req, res) => {
  try {
    const race = await generateRace();
    res.json({ message: "Случайный забег сгенерирован", race_id: race.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при генерации забега" });
  }
};

// Физическая симуляция
const simulatePhysicsRace = async (req, res) => {
  try {
    const race = await simulateRaceWithPhysics();
    res.json({ message: "Физический забег сгенерирован", race_id: race.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при симуляции физического забега" });
  }
};

// Вероятности
const getProbabilities = async (req, res) => {
  try {
    const probs = await calculateProbabilities();
    res.json(probs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при расчёте вероятностей" });
  }
};

// Парная статистика
const getPairedStats = async (req, res) => {
  try {
    const stats = await pairedTop2Stats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при расчёте парной статистики" });
  }
};

module.exports = {
  generateRandomRace,
  simulatePhysicsRace,
  getProbabilities,
  getPairedStats
};