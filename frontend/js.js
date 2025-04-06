document.addEventListener('DOMContentLoaded', function() {
    const studentsTable = document.getElementById('studentsTable');
    const runnersContainer = document.getElementById('runners');
    const generateBtn = document.getElementById('generateBtn');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timeDisplay = document.getElementById('time');
    const resultsList = document.getElementById('resultsList');
    
    let runners = [];
    let finishedRunners = [];
    let animationId = null;
    let currentTime = 0;
    let raceInProgress = false;
    let lastTimestamp = 0;
    
    // Подключение к Socket.IO серверу
    const socket = io();
    
    console.log('Подключение к Socket.IO...');
    
    // Отслеживание успешного подключения
    socket.on('connect', () => {
        console.log('Соединение с сервером установлено');
        // Запрашиваем начальные данные после подключения
        socket.emit('requestInitialData');
    });
    
    // Отслеживание ошибок подключения
    socket.on('connect_error', (error) => {
        console.error('Ошибка подключения к серверу:', error);
    });
    
    // Получение начальных данных от сервера
    socket.on('initialData', (data) => {
        console.log('Получены начальные данные:', data);
        updateTableWithData(data);
        runners = data;
    });
    
    // Обновление данных от сервера
    socket.on('newData', (data) => {
        console.log('Получены новые данные:', data);
        updateTableWithData(data);
        runners = data;
    });
    
    // Начало забега
    socket.on('raceStarted', (runnerData) => {
        console.log('Получен сигнал о начале забега', runnerData);
        prepareRace(runnerData);
        startRace();
    });
    
    // Обновление таблицы данными с сервера
    function updateTableWithData(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error('Получены некорректные данные:', data);
            return;
        }
        
        const tbody = studentsTable.querySelector('tbody');
        if (!tbody) {
            console.error('Элемент tbody не найден в таблице');
            return;
        }
        
        // Очищаем таблицу
        tbody.innerHTML = '';
        
        // Заполняем таблицу новыми данными
        data.forEach((runner) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td contenteditable="true">${runner.name}</td>
                <td contenteditable="true">${runner.reactionTime}</td>
                <td contenteditable="true">${runner.acceleration}</td>
                <td contenteditable="true">${runner.maxSpeed}</td>
                <td contenteditable="true">${runner.speedLoss}</td>
                <td style="background-color: ${runner.color}"></td>
            `;
            
            tbody.appendChild(row);
        });
        
        console.log('Таблица обновлена с', data.length, 'строками');
    }
    
    // Получение данных учеников из таблицы
    function getStudentsData() {
        const rows = studentsTable.querySelectorAll('tbody tr');
        const students = [];
        
        rows.forEach((row, index) => {
            students.push({
                id: index + 1,
                name: row.cells[0].textContent || `Ученик ${index + 1}`,
                reactionTime: parseFloat(row.cells[1].textContent) || 0.15,
                acceleration: parseFloat(row.cells[2].textContent) || 5,
                maxSpeed: parseFloat(row.cells[3].textContent) || 10,
                speedLoss: Math.min(parseFloat(row.cells[4].textContent) || 0.1, 0.9),
                color: row.cells[5].style.backgroundColor
            });
        });
        
        return students;
    }
    
    // Подготовка забега
    function prepareRace(runnersData) {
        runnersContainer.innerHTML = '';
        finishedRunners = [];
        currentTime = 0;
        timeDisplay.textContent = '0.00';
        resultsList.innerHTML = '';
        
        runnersData.forEach(runner => {
            const runnerElement = document.createElement('div');
            runnerElement.className = 'runner';
            runnerElement.style.backgroundColor = runner.color;
            runnerElement.style.top = `${(runner.id - 1) * 50 + 10}px`;
            runnerElement.style.left = '0';
            runnerElement.dataset.id = runner.id;
            
            // Добавляем имя бегуна
            const nameElement = document.createElement('div');
            nameElement.className = 'runner-name';
            nameElement.textContent = runner.name;
            runnerElement.appendChild(nameElement);
            
            runnersContainer.appendChild(runnerElement);
        });
    }
    
    // Расчет финальной скорости с учетом потерь
    function calculateFinalSpeed(runner) {
        return runner.maxSpeed * (1 - runner.speedLoss);
    }
    
    // Расчет позиции бегуна в заданное время
    function calculatePosition(runner, time) {
        if (time <= runner.reactionTime) {
            return 0;
        }
        
        const runningTime = time - runner.reactionTime;
        const accelerationTime = runner.maxSpeed / runner.acceleration;
        
        if (runningTime <= accelerationTime) {
            // Фаза ускорения
            return 0.5 * runner.acceleration * runningTime * runningTime;
        } else {
            // Фаза максимальной скорости и замедления
            const distanceAfterAcceleration = 0.5 * runner.acceleration * accelerationTime * accelerationTime;
            const remainingTime = runningTime - accelerationTime;
            
            // Вычисляем скорость в конце дистанции с учетом потерь
            const finalSpeed = calculateFinalSpeed(runner);
            
            // Линейное изменение скорости от максимальной до финальной
            const averageSpeed = (runner.maxSpeed + finalSpeed) / 2;
            const distanceAfterMaxSpeed = averageSpeed * remainingTime;
            
            return distanceAfterAcceleration + distanceAfterMaxSpeed;
        }
    }
    
    // Анимация забега
    function animateRace(timestamp) {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }
        
        const deltaTime = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        
        if (raceInProgress) {
            currentTime += deltaTime;
            timeDisplay.textContent = currentTime.toFixed(2);
            
            let allFinished = true;
            
            runners.forEach(runner => {
                if (finishedRunners.includes(runner.id)) {
                    return;
                }
                
                const position = calculatePosition(runner, currentTime);
                const runnerElement = document.querySelector(`.runner[data-id="${runner.id}"]`);
                
                if (position >= 100) {
                    runnerElement.style.left = '100%';
                    finishedRunners.push(runner.id);
                    
                    // Добавление результата
                    const resultItem = document.createElement('li');
                    resultItem.innerHTML = `<span style="color:${runner.color}">■</span> ${runner.name}: ${currentTime.toFixed(2)} сек`;
                    resultsList.appendChild(resultItem);
                } else {
                    runnerElement.style.left = `${position}%`;
                    allFinished = false;
                }
            });
            
            if (allFinished) {
                raceInProgress = false;
            } else {
                animationId = requestAnimationFrame(animateRace);
            }
        }
    }
    
    // Начало забега
    function startRace() {
        if (!raceInProgress) {
            raceInProgress = true;
            lastTimestamp = 0;
            animationId = requestAnimationFrame(animateRace);
        }
    }
    
    // Сброс забега
    function resetRace() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        raceInProgress = false;
        currentTime = 0;
        timeDisplay.textContent = '0.00';
        finishedRunners = [];
        resultsList.innerHTML = '';
        
        const runnerElements = document.querySelectorAll('.runner');
        runnerElements.forEach(el => {
            el.style.left = '0';
        });
    }
    
    // Обработчики событий для кнопок
    generateBtn.addEventListener('click', () => {
        console.log('Запрос на генерацию новых данных');
        socket.emit('generateData');
    });
    
    startBtn.addEventListener('click', () => {
        if (!raceInProgress) {
            console.log('Запрос на начало забега');
            const studentsData = getStudentsData();
            socket.emit('startRace', studentsData);
        }
    });
    
    resetBtn.addEventListener('click', resetRace);
    
    // Инициализация таблицы с начальными данными (на случай, если сервер не отвечает)
    initStudentsTable();
    
    // Функция для начальной инициализации таблицы
    function initStudentsTable() {
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        const tbody = studentsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        for (let i = 1; i <= 6; i++) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td contenteditable="true">Ученик ${i}</td>
                <td contenteditable="true">0.15</td>
                <td contenteditable="true">5.00</td>
                <td contenteditable="true">10.00</td>
                <td contenteditable="true">0.20</td>
                <td style="background-color: ${colors[i-1]}"></td>
            `;
            
            tbody.appendChild(row);
        }
    }
});