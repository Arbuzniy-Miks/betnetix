const express = require('express');
const cors = require('cors');
const app = express();
const raceRoutes = require('./routes/raceRoutes');

const path = require('path');
app.use(express.static(path.join(__dirname, 'api')));

app.use(express.static(path.join(__dirname)));

app.use(express.static(__dirname, {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

app.use(express.static(path.join(__dirname, '../frontend')));

// Маршруты для отдельных страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/bfbf.html'));
});

app.get('/bfbf', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/bfbf.html'));
});

app.get('/html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html.html'));
});

app.get('/diagram', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/diagram.html'));
});



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



const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

app.use(cors());
app.use(express.json());
app.use('/api/races', raceRoutes);

module.exports = app;