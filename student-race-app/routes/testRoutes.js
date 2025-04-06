const express = require('express');
const router = express.Router();

const { sequelize, Race, Result, Athlete } = require('../models');
const { generateRace } = require('../services/raceGenerator');

// 👇 Создание тестовых данных
router.post('/seed', async (req, res) => {
  try {
    const athletes = [];
    for (let i = 1; i <= 6; i++) {
      athletes.push({
        name: `Атлет ${i}`,
        reaction_time: +(0.1 + Math.random() * 0.2).toFixed(2),
        acceleration: +(2 + Math.random() * 2).toFixed(2),
        max_speed: +(8 + Math.random() * 4).toFixed(2),
        decay: +(0.01 + Math.random() * 0.04).toFixed(3),
      });
    }

    await Athlete.bulkCreate(athletes);
    await generateRace(); // генерируем забег

    res.json({ success: true, message: 'Тестовые данные созданы' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 👇 Очистка всех таблиц
router.delete('/clear', async (req, res) => {
  try {
    await sequelize.query('TRUNCATE TABLE "Results", "Races", "Athletes" RESTART IDENTITY CASCADE');
    res.json({ success: true, message: 'Все таблицы очищены' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;