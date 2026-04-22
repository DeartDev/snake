const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;

const COLORS = {
    dark: {
        bg: '#12121a',
        snakeHead: '#39ff14',
        snakeBody: '#2dd310',
        foodNormal: '#39ff14',
        foodGold: '#ffd700',
        foodRed: '#ff0040',
        grid: '#1a1a24'
    },
    light: {
        bg: '#e0e0e5',
        snakeHead: '#1a8f00',
        snakeBody: '#156d00',
        foodNormal: '#1a8f00',
        foodGold: '#ccac00',
        foodRed: '#cc0033',
        grid: '#d0d0d8'
    }
};

const MODES = {
    classic: {
        name: 'CLÁSICO',
        tickRate: 150,
        lives: 1,
        foodTypes: ['normal']
    },
    challenge: {
        name: 'RETO',
        tickRate: 120,
        lives: 3,
        foodTypes: ['normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'gold', 'gold', 'red']
    },
    endless: {
        name: 'INFINITO',
        tickRate: 100,
        lives: Infinity,
        foodTypes: ['normal', 'normal', 'normal', 'normal', 'normal', 'gold', 'gold', 'red', 'red'],
        speedIncrease: 5
    }
};

const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

let gameState = GAME_STATES.MENU;
let currentMode = 'classic';
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let score = 0;
let highScore = parseInt(localStorage.getItem('snake_highscore')) || 0;
let lives = 1;
let gameLoop = null;
let tickRate = MODES.classic.tickRate;
let isThemeDark = localStorage.getItem('snake_theme') !== 'light';
let foodExpireTimer = null;
let foodExpireTime = 0;
let isFlashing = false;
let colorChangeInterval = null;

const elements = {
    score: document.getElementById('score'),
    highScore: document.getElementById('highScore'),
    modeIndicator: document.getElementById('modeIndicator'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    overlayScore: document.getElementById('overlayScore'),
    livesPanel: document.getElementById('livesPanel'),
    lives: document.getElementById('lives'),
    themeToggle: document.getElementById('themeToggle'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playPauseIcon: document.getElementById('playPauseIcon'),
    playPauseText: document.getElementById('playPauseText'),
    modeButtons: document.querySelectorAll('.mode-btn'),
    dpadButtons: document.querySelectorAll('.d-pad-btn')
};

function getColors() {
    return isThemeDark ? COLORS.dark : COLORS.light;
}

function init() {
    updateTheme();
    updateHighScoreDisplay();
    setMode('classic');
    drawGrid();
    setupEventListeners();
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.dataset.mode);
        });
    });

    elements.dpadButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDirection(btn.dataset.dir);
        });
        btn.addEventListener('click', () => {
            handleDirection(btn.dataset.dir);
        });
    });

    elements.playPauseBtn.addEventListener('click', handlePlayPause);
}

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (key === 'enter') {
        if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER) {
            startGame();
        }
        return;
    }

    if (key === ' ' || key === 'spacebar') {
        e.preventDefault();
        togglePause();
        return;
    }

    if (key === 'n' && gameState === GAME_STATES.PLAYING) {
        resetGame();
        startGame();
        return;
    }

    if (key === '1') {
        setMode('classic');
        return;
    }
    if (key === '2') {
        setMode('challenge');
        return;
    }
    if (key === '3') {
        setMode('endless');
        return;
    }

    if (gameState !== GAME_STATES.PLAYING) return;

    if (key === 'arrowup' || key === 'w') {
        handleDirection('up');
    } else if (key === 'arrowdown' || key === 's') {
        handleDirection('down');
    } else if (key === 'arrowleft' || key === 'a') {
        handleDirection('left');
    } else if (key === 'arrowright' || key === 'd') {
        handleDirection('right');
    }
}

function handleDirection(dir) {
    if (gameState !== GAME_STATES.PLAYING) return;

    const opposites = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
    };

    const currentDirName = getDirectionName(direction);
    if (opposites[dir] === currentDirName) return;

    const directions = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };

    nextDirection = directions[dir];
}

function getDirectionName(dir) {
    if (dir.x === 0 && dir.y === -1) return 'up';
    if (dir.x === 0 && dir.y === 1) return 'down';
    if (dir.x === -1 && dir.y === 0) return 'left';
    if (dir.x === 1 && dir.y === 0) return 'right';
    return '';
}

function setMode(mode) {
    currentMode = mode;
    const modeConfig = MODES[mode];
    
    elements.modeIndicator.textContent = modeConfig.name;
    
    elements.modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'challenge') {
        lives = modeConfig.lives;
        elements.livesPanel.classList.add('visible');
        updateLivesDisplay();
    } else {
        elements.livesPanel.classList.remove('visible');
    }

    if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER) {
        resetGame();
        drawGrid();
    }
}

function startGame() {
    resetGame();
    gameState = GAME_STATES.PLAYING;
    hideOverlay();
    spawnFood();
    gameLoop = setInterval(update, tickRate);
    updatePlayPauseButton();
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    tickRate = MODES[currentMode].tickRate;
    lives = MODES[currentMode].lives;
    
    if (foodExpireTimer) {
        clearTimeout(foodExpireTimer);
        foodExpireTimer = null;
    }
    if (colorChangeInterval) {
        clearInterval(colorChangeInterval);
        colorChangeInterval = null;
    }
    isFlashing = false;
    food = null;
    
    updateScoreDisplay();
    if (currentMode === 'challenge') {
        updateLivesDisplay();
    }
    
    if (gameLoop) {
        clearInterval(gameLoop);
    }
}

function togglePause() {
    if (gameState === GAME_STATES.PLAYING) {
        gameState = GAME_STATES.PAUSED;
        clearInterval(gameLoop);
        showOverlay('PAUSA', 'Presiona ESPACIO para continuar', '');
        updatePlayPauseButton();
    } else if (gameState === GAME_STATES.PAUSED) {
        gameState = GAME_STATES.PLAYING;
        hideOverlay();
        gameLoop = setInterval(update, tickRate);
        updatePlayPauseButton();
    }
}

function handlePlayPause() {
    if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER) {
        startGame();
    } else if (gameState === GAME_STATES.PLAYING) {
        togglePause();
    } else if (gameState === GAME_STATES.PAUSED) {
        togglePause();
    }
}

function updatePlayPauseButton() {
    if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER) {
        elements.playPauseIcon.className = 'bi bi-play-fill';
        elements.playPauseText.textContent = 'JUGAR';
    } else if (gameState === GAME_STATES.PLAYING) {
        elements.playPauseIcon.className = 'bi bi-pause-fill';
        elements.playPauseText.textContent = 'PAUSA';
    } else if (gameState === GAME_STATES.PAUSED) {
        elements.playPauseIcon.className = 'bi bi-play-fill';
        elements.playPauseText.textContent = 'CONTINUAR';
    }
}

function update() {
    direction = { ...nextDirection };

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleDeath();
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            handleDeath();
            return;
        }
    }

    snake.unshift(head);

    if (food && head.x === food.x && head.y === food.y) {
        handleFood();
    } else {
        snake.pop();
    }

    render();
}

function handleFood() {
    const modeConfig = MODES[currentMode];
    let points = 1;
    let growth = 0;

    if (food.type === 'gold') {
        points = 3;
        growth = 2;
        score += points;
    } else if (food.type === 'red') {
        if (currentMode === 'challenge') {
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                handleDeath();
                return;
            }
        } else if (currentMode === 'endless') {
            score = Math.floor(score / 3);
            
            const segmentsToRemove = Math.min(3, snake.length - 1);
            if (snake.length - segmentsToRemove <= 3) {
                handleDeath();
                return;
            }
            snake = snake.slice(0, -segmentsToRemove);
            updateScoreDisplay();
        }
    } else {
        score += points;
        growth = 1;
    }

    if (growth > 0) {
        for (let i = 0; i < growth; i++) {
            const tail = snake[snake.length - 1];
            snake.push({ ...tail });
        }
    }

    if (currentMode === 'endless' && modeConfig.speedIncrease) {
        const speedThreshold = score % modeConfig.speedIncrease;
        if (speedThreshold === 0 && tickRate > 60) {
            tickRate -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, tickRate);
        }
    }

    updateScoreDisplay();
    spawnFood();
}

function handleDeath() {
    gameState = GAME_STATES.GAME_OVER;
    clearInterval(gameLoop);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake_highscore', highScore);
        updateHighScoreDisplay();
    }

    showOverlay('GAME OVER', `Puntaje: ${score}`, score > highScore - 1 && score === highScore ? '¡NUEVO HIGH SCORE!' : '');
    updatePlayPauseButton();
}

function spawnFood() {
    const modeConfig = MODES[currentMode];
    let foodType;
    
    if (modeConfig.foodTypes.length === 1) {
        foodType = 'normal';
    } else {
        const randomIndex = Math.floor(Math.random() * modeConfig.foodTypes.length);
        foodType = modeConfig.foodTypes[randomIndex];
    }

    let validPosition = false;
    let newFood = null;

    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            type: foodType
        };

        validPosition = !snake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
    }

    food = newFood;

    if (currentMode === 'challenge' && food.type === 'red') {
        startFoodExpireTimer();
    } else if (currentMode === 'endless') {
        startColorChanger();
    }
}

function startColorChanger() {
    if (colorChangeInterval) {
        clearInterval(colorChangeInterval);
    }
    
    const changeColor = () => {
        if (!food || gameState !== GAME_STATES.PLAYING) {
            clearInterval(colorChangeInterval);
            return;
        }
        
        const types = ['normal', 'gold', 'red'];
        food.type = types[Math.floor(Math.random() * types.length)];
        render();
    };
    
    changeColor();
    
    colorChangeInterval = setInterval(changeColor, 400);
}

function startFoodExpireTimer() {
    if (foodExpireTimer) {
        clearTimeout(foodExpireTimer);
    }
    
    foodExpireTime = 2000 + Math.random() * 3000;
    const flashStartTime = foodExpireTime - 1000;
    
    const flashInterval = setInterval(() => {
        if (gameState !== GAME_STATES.PLAYING || !food || food.type !== 'red') {
            clearInterval(flashInterval);
            isFlashing = false;
            return;
        }
        isFlashing = !isFlashing;
        render();
    }, 150);
    
    foodExpireTimer = setTimeout(() => {
        clearInterval(flashInterval);
        isFlashing = false;
        if (food && food.type === 'red' && gameState === GAME_STATES.PLAYING) {
            food = null;
            spawnFood();
        }
    }, foodExpireTime);
}

function render() {
    const colors = getColors();
    
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    if (food) {
        drawFood();
    }

    drawSnake();
}

function drawGrid() {
    const colors = getColors();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    const colors = getColors();

    snake.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        
        ctx.fillStyle = index === 0 ? colors.snakeHead : colors.snakeBody;
        
        const padding = 1;
        const size = CELL_SIZE - padding * 2;
        
        ctx.shadowColor = colors.snakeHead;
        ctx.shadowBlur = index === 0 ? 15 : 8;
        
        ctx.fillRect(x + padding, y + padding, size, size);
        
        ctx.shadowBlur = 0;
    });
}

function drawFood() {
    if (!food) return;
    
    const colors = getColors();
    const x = food.x * CELL_SIZE + CELL_SIZE / 2;
    const y = food.y * CELL_SIZE + CELL_SIZE / 2;
    let radius = CELL_SIZE / 2 - 2;

    let color;
    if (food.type === 'gold') {
        color = colors.foodGold;
    } else if (food.type === 'red') {
        color = colors.foodRed;
        if (isFlashing) {
            radius = radius * 1.3;
        }
    } else {
        color = colors.foodNormal;
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isFlashing && food.type === 'red' ? 25 : 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function updateScoreDisplay() {
    elements.score.textContent = score;
}

function updateHighScoreDisplay() {
    elements.highScore.textContent = highScore;
}

function updateLivesDisplay() {
    elements.lives.innerHTML = '';
    for (let i = 0; i < MODES.challenge.lives; i++) {
        const life = document.createElement('div');
        life.className = 'life' + (i >= lives ? ' lost' : '');
        elements.lives.appendChild(life);
    }
}

function showOverlay(title, text, scoreText) {
    elements.overlayTitle.textContent = title;
    elements.overlayText.textContent = text;
    elements.overlayScore.textContent = scoreText;
    elements.overlay.classList.remove('hidden');
}

function hideOverlay() {
    elements.overlay.classList.add('hidden');
}

function toggleTheme() {
    isThemeDark = !isThemeDark;
    localStorage.setItem('snake_theme', isThemeDark ? 'dark' : 'light');
    updateTheme();
    render();
}

function updateTheme() {
    document.documentElement.setAttribute('data-theme', isThemeDark ? 'dark' : 'light');
    elements.themeToggle.innerHTML = isThemeDark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
}

init();