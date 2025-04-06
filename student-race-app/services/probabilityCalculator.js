const { Result, Athlete } = require('../models');

async function calculateProbabilities() {
  const athletes = await Athlete.findAll();
  const totalRaces = await Result.count({ distinct: true, col: 'race_id' });

  let probabilities = {};

  for (const athlete of athletes) {
    const results = await Result.findAll({
      where: { athlete_id: athlete.id },
    });

    let placeCount = [0, 0, 0, 0, 0, 0]; // индекс 0 = 1-е место

    results.forEach(result => {
      placeCount[result.position - 1]++;
    });

    probabilities[athlete.name] = {
      places: placeCount.map(count => count / totalRaces),
      top2: (placeCount[0] + placeCount[1]) / totalRaces,
      top3: (placeCount[0] + placeCount[1] + placeCount[2]) / totalRaces,
    };
  }

  return probabilities;
}
async function pairedTop2Stats() {
    const allRaces = await Race.findAll({ include: Result });
  
    const pairs = {};
  
    for (const race of allRaces) {
      const results = race.Results;
      const sorted = results.sort((a, b) => a.position - b.position);
  
      const first = sorted[0].athlete_id;
      const second = sorted[1].athlete_id;
  
      const key = `${first}-${second}`;
      pairs[key] = (pairs[key] || 0) + 1;
    }
  
    const totalRaces = allRaces.length;
    const probabilities = {};
  
    for (const key in pairs) {
      probabilities[key] = pairs[key] / totalRaces;
    }
  
    return probabilities;
}