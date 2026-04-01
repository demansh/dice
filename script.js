document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Получаем ВСЕ нужные элементы ---
    const appContainer = document.getElementById("app-container");
    const diceArea = document.getElementById("dice-area");
    
    // Элементы управления
    const settingsBtn = document.getElementById("settings-btn");
    const rollBtn = document.getElementById("roll-btn");
    
    // Элементы режима редактирования
    const applyBtn = document.getElementById("apply-btn");
    const decreaseBtn = document.getElementById("decrease-btn");
    const increaseBtn = document.getElementById("increase-btn");
    const diceCountDisplay = document.getElementById("dice-count-display");

    // --- 2. Константы и переменные состояния ---
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const MIN_DICE = 1;
    const MAX_DICE = 10;
    const ANIMATION_DURATION = 500;
    const FLICKER_INTERVAL = 100;
    const BUTTON_LOCK_DURATION = 500;

    // Временное хранилище для счетчика
    let tempDiceCount = 2;

    /**
     * Читает 'count' из URL.
     * @returns {number} Количество кубиков (по умолчанию 2).
     */
    function getDiceCountFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        let count = parseInt(urlParams.get('count'), 10);
        
        if (isNaN(count) || count < MIN_DICE) {
            count = 2; // Значение по умолчанию
        } else if (count > MAX_DICE) {
            count = MAX_DICE;
        }
        return count;
    }

    /**
     * Проверяет и отключает кнопки +/- если достигнут лимит
     */
    function checkMinMaxButtons() {
        decreaseBtn.disabled = (tempDiceCount <= MIN_DICE);
        increaseBtn.disabled = (tempDiceCount >= MAX_DICE);
    }

    // --- 3. Новые функции управления UI ---

    /**
     * Включает режим редактирования
     */
    function enterEditMode() {
        // Синхронизируем временный счетчик с текущим из URL
        tempDiceCount = getDiceCountFromURL();
        diceCountDisplay.textContent = tempDiceCount;
        
        // Проверяем кнопки +/-
        checkMinMaxButtons();

        // Переключаем CSS класс
        appContainer.classList.add("is-editing");
        
        // (Мы БОЛЬШЕ не блокируем кнопку "Бросить")
    }

    /**
     * Применяет настройки и выходит из режима редактирования
     */
    function applySettings() {
        // Переключаем CSS класс
        appContainer.classList.remove("is-editing");
        
        // Обновляем URL
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('count', tempDiceCount);
        window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    }

    /**
     * Уменьшает счетчик
     */
    function decreaseCount() {
        if (tempDiceCount > MIN_DICE) {
            tempDiceCount--;
            diceCountDisplay.textContent = tempDiceCount;
            checkMinMaxButtons();
        }
    }

    /**
     * Увеличивает счетчик
     */
    function increaseCount() {
        if (tempDiceCount < MAX_DICE) {
            tempDiceCount++;
            diceCountDisplay.textContent = tempDiceCount;
            checkMinMaxButtons();
        }
    }

    /**
     * Выполняет бросок кубиков
     */
    function rollDice() {
        rollBtn.disabled = true;
        const count = getDiceCountFromURL();
        diceArea.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const finalValueIndex = Math.floor(Math.random() * 6);
            const finalFace = diceFaces[finalValueIndex];
            
            const dieElement = document.createElement('div');
            dieElement.className = 'die';
            dieElement.textContent = diceFaces[Math.floor(Math.random() * 6)];
            diceArea.appendChild(dieElement);

            const animationInterval = setInterval(() => {
                dieElement.textContent = diceFaces[Math.floor(Math.random() * 6)];
            }, FLICKER_INTERVAL);

            setTimeout(() => {
                clearInterval(animationInterval);
                dieElement.textContent = finalFace;
            }, ANIMATION_DURATION);
        }

        setTimeout(() => {
            rollBtn.disabled = false;
        }, BUTTON_LOCK_DURATION);
    }

    // --- 4. Инициализация и обработчики событий ---

    // Назначаем обработчики
    settingsBtn.addEventListener("click", enterEditMode);
    
    // Кнопка "Применить"
    applyBtn.addEventListener("click", () => {
        applySettings(); // Применяем и закрываем
        diceArea.innerHTML = '<p>Настройки сохранены. Бросайте!</p>'; // Показываем
                                                                      // сообщение
    });

    decreaseBtn.addEventListener("click", decreaseCount);
    increaseBtn.addEventListener("click", increaseCount);

    // Кнопка "Бросить"
    rollBtn.addEventListener("click", () => {
        // Если мы в режиме редактирования...
        if (appContainer.classList.contains("is-editing")) {
            applySettings(); // ...сначала применяем настройки (это
                             // закроет UI)
        }
        // В любом случае бросаем кубики
        rollDice();
    });

    // --- Инициализация при загрузке ---
    // Устанавливаем tempDiceCount из URL при первой загрузке
    tempDiceCount = getDiceCountFromURL();
    // Обновляем текст (хоть он и скрыт, он будет верным, когда
    // откроется)
    diceCountDisplay.textContent = tempDiceCount;

    if (!diceArea.hasChildNodes()) {
         diceArea.innerHTML = '<p>Нажмите "Бросить кубики", чтобы начать.</p>';
    }
});