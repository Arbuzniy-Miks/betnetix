const express = require('express');
const router = express.Router();
const raceController = require('../controllers/raceController');

router.post('/random', raceController.generateRandomRace);
router.post('/physics', raceController.simulatePhysicsRace);
router.get('/probabilities', raceController.getProbabilities); // ✅
router.get('/paired', raceController.getPairedStats);

module.exports = router;