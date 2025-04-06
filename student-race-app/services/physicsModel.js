// Упрощённая модель с расчётом времени забега
function calculateTime(athlete) {
    const { reaction_time, acceleration, max_speed, decay } = athlete;
  
    const phase1 = max_speed / acceleration; // t = v/a
    const distance1 = 0.5 * acceleration * Math.pow(phase1, 2);
  
    const remaining = 100 - distance1;
    const average_speed = max_speed * (1 - decay);
    const phase2 = remaining / average_speed;
  
    return reaction_time + phase1 + phase2;
  }
  
  async function simulateRaceWithPhysics() {
    const athletes = await Athlete.findAll();
    const times = athletes.map(a => ({
      id: a.id,
      time: calculateTime(a),
    }));
  
    times.sort((a, b) => a.time - b.time);
  
    const race = await Race.create({});
    for (let i = 0; i < times.length; i++) {
      await Result.create({
        race_id: race.id,
        athlete_id: times[i].id,
        position: i + 1,
      });
    }
  
    return race;
  }

  function generateRunnerData() {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const runners = [];
    
    for (let i = 1; i <= 6; i++) {
        runners.push({
            id: i,
            name: `Ученик ${i}`,
            reactionTime: (Math.random() * 0.2 + 0.1).toFixed(2),
            acceleration: (Math.random() * 5 + 5).toFixed(2),
            maxSpeed: (Math.random() * 5 + 15).toFixed(2),
            speedLoss: (Math.random() * 0.3 + 0.1).toFixed(2),
            color: colors[i-1]
        });
    }
    
    return runners;
}