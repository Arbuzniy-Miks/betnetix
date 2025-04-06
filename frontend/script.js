document.addEventListener('DOMContentLoaded', () => {
    // Константы
    const MIN_SPEED = 10;
    const MAX_SPEED = 20;
    const MIN_REACTION_TIME = 0.1;
    const MAX_REACTION_TIME = 0.3;
    const MIN_ACCELERATION = 0;
    const MAX_ACCELERATION = 10;
    const MAX_SPEED_LOSS = 0.5;

    // DOM элементы
    const tableRows = document.querySelectorAll('table tr');
    const calculateButton = document.getElementById('calculateButton');
    const dataRows = Array.from(tableRows).slice(1); // Пропускаем заголовок

    /**
     * Генерирует уникальные случайные значения скорости для каждого участника
     * @returns {Array} Массив уникальных скоростей
     */
    function generateUniqueSpeeds() {
        const speeds = new Set();
        const speedRange = MAX_SPEED - MIN_SPEED;
        const requiredCount = dataRows.length;

        while (speeds.size < requiredCount) {
            const speed = (Math.random() * speedRange + MIN_SPEED).toFixed(2);
            speeds.add(speed);
        }

        return Array.from(speeds);
    }

    /**
     * Генерирует случайные данные для всех участников
     */
    function generateRandomData() {
        const uniqueSpeeds = generateUniqueSpeeds();

        dataRows.forEach((row, index) => {
            const cells = row.cells;
            
            // Генерация значений с округлением до 2 знаков
            const reactionTime = (Math.random() * (MAX_REACTION_TIME - MIN_REACTION_TIME) + MIN_REACTION_TIME).toFixed(2);
            const acceleration = (Math.random() * MAX_ACCELERATION).toFixed(2);
            const speedLoss = (Math.random() * MAX_SPEED_LOSS).toFixed(2);
            const color = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;

            // Заполнение ячеек
            cells[1].textContent = reactionTime;
            cells[2].textContent = acceleration;
            cells[3].textContent = uniqueSpeeds[index];
            cells[4].textContent = speedLoss;
            cells[5].style.backgroundColor = color;
        });
    }

    /**
     * Рассчитывает конечные скорости и сортирует участников
     * @returns {Array} Отсортированный массив результатов
     */
    function calculateAndSortResults() {
        const results = dataRows.map((row, index) => {
            const cells = row.cells;
            const maxSpeed = parseFloat(cells[3].textContent);
            const speedLoss = parseFloat(cells[4].textContent);
            
            // Расчет конечной скорости с защитой от отрицательных значений
            const finalSpeed = Math.max(0, maxSpeed * (1 - speedLoss)).toFixed(2);
            
            // Обновляем отображаемое значение
            cells[3].textContent = finalSpeed;

            return {
                participant: index + 1,
                finalSpeed: parseFloat(finalSpeed)
            };
        });

        // Сортировка по убыванию скорости
        return results.sort((a, b) => b.finalSpeed - a.finalSpeed);
    }

    /**
     * Логирует результаты в консоль
     * @param {Array} results - Отсортированные результаты
     */
    function logResults(results) {
        console.log('Результаты забега (по убыванию скорости):');
        results.forEach((result, position) => {
            console.log(`${position + 1}. Участник ${result.participant}: ${result.finalSpeed.toFixed(2)} м/с`);
        });
    }

    /**
     * Инициализирует редактируемые ячейки таблицы
     */
    function setupEditableCells() {
        dataRows.forEach(row => {
            Array.from(row.cells).forEach(cell => {
                cell.contentEditable = true;
                cell.addEventListener('blur', () => {
                    console.log(`Изменено значение: ${cell.textContent.trim()}`);
                });
            });
        });
    }

    // Инициализация
    function init() {
        generateRandomData();
        setupEditableCells();
        
        calculateButton.addEventListener('click', () => {
            const results = calculateAndSortResults();
            logResults(results);
        });

        // Первоначальный расчет
        const initialResults = calculateAndSortResults();
        logResults(initialResults);
    }

    init();
});