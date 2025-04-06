document.addEventListener('DOMContentLoaded', () => {
    // Константы
    const SPEED_RANGE = { min: 10, max: 20 };
    const REACTION_TIME_RANGE = { min: 0.1, max: 0.3 };
    const ACCELERATION_RANGE = { min: 0, max: 10 };
    const SPEED_LOSS_RANGE = { min: 0, max: 0.5 };
    const PARTICIPANT_COUNT = 6;

    // DOM элементы
    const tableRows = document.querySelectorAll('table tr');
    const dataRows = Array.from(tableRows).slice(1); // Пропускаем заголовок
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-container';
    document.body.appendChild(resultsContainer);

    // Утилитарные функции
    const getRandomInRange = (min, max, decimals = 2) => 
        (Math.random() * (max - min) + min).toFixed(decimals);

    const generateHexColor = () => 
        `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;

    /**
     * Генерирует уникальные случайные значения скорости для каждого участника
     * @returns {Array} Массив уникальных скоростей
     */
    function generateUniqueSpeeds() {
        const speeds = new Set();
        while (speeds.size < PARTICIPANT_COUNT) {
            speeds.add(getRandomInRange(SPEED_RANGE.min, SPEED_RANGE.max));
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
            cells[1].textContent = getRandomInRange(REACTION_TIME_RANGE.min, REACTION_TIME_RANGE.max);
            cells[2].textContent = getRandomInRange(ACCELERATION_RANGE.min, ACCELERATION_RANGE.max);
            cells[3].textContent = uniqueSpeeds[index];
            cells[4].textContent = getRandomInRange(SPEED_LOSS_RANGE.min, SPEED_LOSS_RANGE.max);
            cells[5].style.backgroundColor = generateHexColor();
        });
    }

    /**
     * Рассчитывает конечные скорости и сортирует участников
     * @returns {Array} Отсортированный массив результатов
     */
    function calculateFinalSpeeds() {
        return dataRows.map((row, index) => {
            const cells = row.cells;
            const maxSpeed = parseFloat(cells[3].textContent);
            const speedLoss = parseFloat(cells[4].textContent);
            const finalSpeed = Math.max(0, maxSpeed * (1 - speedLoss)).toFixed(2);
            
            cells[3].textContent = finalSpeed;

            return {
                id: index + 1,
                name: cells[0].textContent || `Участник ${index + 1}`,
                finalSpeed: parseFloat(finalSpeed)
            };
        }).sort((a, b) => b.finalSpeed - a.finalSpeed);
    }

    /**
     * Рассчитывает вероятности занятий мест
     * @param {Array} results - Результаты забега
     * @returns {Array} Массив с вероятностями для каждого участника
     */
    function calculatePlaceProbabilities(results) {
        const totalSpeed = results.reduce((sum, r) => sum + r.finalSpeed, 0);
        return results.map(result => ({
            ...result,
            normalizedSpeed: result.finalSpeed / totalSpeed
        }));
    }

    /**
     * Рассчитывает вероятности для топ-N мест
     * @param {Array} probs - Нормализованные вероятности
     * @param {Number} topN - Количество топовых мест
     * @returns {Array} Массив с суммарными вероятностями
     */
    function calculateTopNProbabilities(probs, topN) {
        return probs.map(prob => ({
            ...prob,
            topProbability: prob.placeProbabilities
                .slice(0, topN)
                .reduce((sum, p) => sum + p, 0)
                .toFixed(2)
        }));
    }

    /**
     * Рассчитывает парные вероятности для призовых мест
     * @param {Array} probs - Нормализованные вероятности
     * @returns {Array} Массив парных вероятностей
     */
    function calculatePairProbabilities(probs) {
        return probs.flatMap((prob1, i, arr) => 
            arr.filter((_, j) => i !== j)
                .map(prob2 => ({
                    firstPlace: prob1.name,
                    secondPlace: prob2.name,
                    probability: (prob1.normalizedSpeed * prob2.normalizedSpeed / 
                                (1 - prob1.normalizedSpeed) * 100).toFixed(2) + '%'
                }))
        );
    }

    /**
     * Создает HTML таблицу с результатами
     * @param {String} title - Заголовок таблицы
     * @param {Array} headers - Заголовки столбцов
     * @param {Array} data - Данные для отображения
     * @returns {HTMLElement} Созданный элемент таблицы
     */
    function createResultsTable(title, headers, data) {
        const container = document.createElement('div');
        container.innerHTML = `<h3>${title}</h3>`;
        
        const table = document.createElement('table');
        table.border = 1;
        
        // Заголовки
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Данные
        data.forEach(item => {
            const row = document.createElement('tr');
            Object.values(item).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            table.appendChild(row);
        });
        
        container.appendChild(table);
        return container;
    }

    /**
     * Отображает все результаты расчетов
     * @param {Array} results - Результаты забега
     */
    function displayAllResults(results) {
        resultsContainer.innerHTML = '';
        
        const placeProbs = calculatePlaceProbabilities(results);
        
        // 01. Вероятности по местам
        const placeData = placeProbs.map(prob => ({
            Участник: prob.name,
            ...Object.fromEntries(
                prob.placeProbabilities.map((p, i) => [`${i+1}-е место`, `${p.toFixed(2)}%`])
            )
        }));
        
        resultsContainer.appendChild(
            createResultsTable(
                '01. Вероятность занятия каждого места',
                ['Участник', ...Array.from({length: PARTICIPANT_COUNT}, (_, i) => `${i+1}-е место`)],
                placeData
            )
        );
        
        // 02-03. Вероятности топ-2 и топ-3
        [2, 3].forEach(topN => {
            const topData = calculateTopNProbabilities(placeProbs, topN)
                .map(prob => ({
                    Участник: prob.name,
                    [`Вероятность топ-${topN}`]: `${prob.topProbability}%`
                }));
            
            resultsContainer.appendChild(
                createResultsTable(
                    `0${topN}. Вероятность топ-${topN} мест`,
                    ['Участник', `Вероятность топ-${topN}`],
                    topData
                )
            );
        });
        
        // 04. Парные вероятности
        const pairData = calculatePairProbabilities(placeProbs);
        resultsContainer.appendChild(
            createResultsTable(
                '04. Парная статистика (1-2 места)',
                ['1-е место', '2-е место', 'Вероятность'],
                pairData
            )
        );
    }

    // Инициализация
    function init() {
        // Настройка редактируемых ячеек
        dataRows.forEach(row => {
            Array.from(row.cells).forEach(cell => {
                cell.contentEditable = true;
                cell.addEventListener('blur', () => {
                    console.log(`Изменено значение: ${cell.textContent.trim()}`);
                });
            });
        });

        // Кнопка расчета
        const calculateButton = document.createElement('button');
        calculateButton.textContent = 'Рассчитать вероятности';
        calculateButton.id = 'calculateButton';
        calculateButton.addEventListener('click', () => {
            displayAllResults(calculateFinalSpeeds());
        });
        document.body.appendChild(calculateButton);

        // Генерация начальных данных
        generateRandomData();
    }

    init();
});