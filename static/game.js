document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const checkBtn = document.getElementById('check-btn');
    const helpBtn = document.getElementById('help-btn');
    const tutorialBtn = document.getElementById('tutorial-btn');
    const difficultySelect = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('timer');
    const progressDisplay = document.getElementById('progress');
    const scoreDisplay = document.getElementById('score');
    
    // Modal elements
    const tutorialModal = document.getElementById('tutorial-modal');
    const helpModal = document.getElementById('help-modal');
    const errorList = document.getElementById('error-list');
    const suggestionList = document.getElementById('suggestion-list');
    const strategyTips = document.getElementById('strategy-tips');
    
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const resetBtn = document.getElementById('reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const saveModal = document.getElementById('save-modal');
    const loadModal = document.getElementById('load-modal');
    
    const statsBtn = document.getElementById('stats-btn');
    const achievementsBtn = document.getElementById('achievements-btn');
    const statsModal = document.getElementById('stats-modal');
    const achievementsModal = document.getElementById('achievements-modal');
    
    const soundBtn = document.getElementById('sound-btn');
    const soundModal = document.getElementById('sound-modal');
    
    // Audio elements
    const bgm = document.getElementById('bgm');
    const sunSound = document.getElementById('sun-sound');
    const moonSound = document.getElementById('moon-sound');
    const errorSound = document.getElementById('error-sound');
    const successSound = document.getElementById('success-sound');
    const achievementSound = document.getElementById('achievement-sound');
    const clickSound = document.getElementById('click-sound');
    
    // Sound settings elements
    const masterVolume = document.getElementById('master-volume');
    const musicVolume = document.getElementById('music-volume');
    const effectsVolume = document.getElementById('effects-volume');
    const masterMute = document.getElementById('master-mute');
    const musicMute = document.getElementById('music-mute');
    const effectsMute = document.getElementById('effects-mute');
    
    const themeBtn = document.getElementById('theme-btn');
    const themeModal = document.getElementById('theme-modal');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const fontFamilySelect = document.getElementById('font-family');
    
    // Multiplayer elements
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    const multiplayerModal = document.getElementById('multiplayer-modal');
    const createRoomBtn = document.getElementById('create-room-btn');
    const refreshRoomsBtn = document.getElementById('refresh-rooms-btn');
    const createRoomModal = document.getElementById('create-room-modal');
    const gameRoomModal = document.getElementById('game-room-modal');
    const avatarModal = document.getElementById('avatar-modal');
    
    // Daily Challenge elements
    const dailyBtn = document.getElementById('daily-btn');
    const dailyModal = document.getElementById('daily-modal');
    
    let gameState = {
        board: [],
        initialBoard: [],
        difficulty: 'medium',
        size: 8,
        score: 0,
        time: 0,
        timer: null,
        isGameActive: false,
        hintsUsed: 0,
        isFirstVisit: !localStorage.getItem('hasVisitedBefore'),
        moveHistory: [],
        moveHistoryIndex: -1,
        stats: {
            totalGames: 0,
            gamesWon: 0,
            totalHints: 0,
            bestTimes: {
                easy: null,
                medium: null,
                hard: null
            },
            currentStreak: 0,
            bestStreak: 0,
            achievements: {
                firstWin: false,
                speedRunner: false,
                perfectSolver: false,
                difficultyMaster: {
                    easy: false,
                    medium: false,
                    hard: false
                },
                streakMaster: false
            }
        },
        sound: {
            masterVolume: 100,
            musicVolume: 80,
            effectsVolume: 100,
            masterMuted: false,
            musicMuted: false,
            effectsMuted: false
        },
        theme: {
            darkMode: false,
            colorTheme: 'default',
            symbolStyle: 'default',
            boardStyle: 'default',
            fontFamily: 'Poppins'
        },
        multiplayer: {
            player: {
                id: null,
                name: '',
                avatar: 'default-avatar.png',
                rating: 1000,
                rank: '-',
                wins: 0
            },
            room: {
                id: null,
                name: '',
                difficulty: 'medium',
                type: 'competitive',
                privacy: 'public',
                password: '',
                players: [],
                status: 'waiting'
            },
            activeGames: [],
            leaderboard: {
                global: [],
                friends: []
            }
        },
        dailyChallenge: {
            currentChallenge: null,
            streak: 0,
            history: [],
            rewards: [],
            completedDates: new Set(),
            bestTimes: {}
        }
    };

    // WebSocket connection
    let socket = null;

    function connectWebSocket() {
        socket = new WebSocket(`ws://${window.location.host}/ws`);
        
        socket.onopen = () => {
            console.log('WebSocket connected');
            if (gameState.multiplayer.player.id) {
                socket.send(JSON.stringify({
                    type: 'reconnect',
                    playerId: gameState.multiplayer.player.id
                }));
            }
        };
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };
        
        socket.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
        };
    }

    function handleWebSocketMessage(data) {
        switch (data.type) {
            case 'player_joined':
                handlePlayerJoined(data);
                break;
            case 'player_left':
                handlePlayerLeft(data);
                break;
            case 'room_created':
                handleRoomCreated(data);
                break;
            case 'room_updated':
                handleRoomUpdated(data);
                break;
            case 'game_started':
                handleGameStarted(data);
                break;
            case 'game_ended':
                handleGameEnded(data);
                break;
            case 'chat_message':
                handleChatMessage(data);
                break;
            case 'leaderboard_update':
                handleLeaderboardUpdate(data);
                break;
        }
    }

    // Player Profile Functions
    function loadPlayerProfile() {
        const savedProfile = localStorage.getItem('tangoPlayerProfile');
        if (savedProfile) {
            gameState.multiplayer.player = JSON.parse(savedProfile);
            updatePlayerProfileDisplay();
        }
    }

    function savePlayerProfile() {
        localStorage.setItem('tangoPlayerProfile', JSON.stringify(gameState.multiplayer.player));
    }

    function updatePlayerProfileDisplay() {
        const player = gameState.multiplayer.player;
        document.getElementById('player-avatar').src = `/static/images/${player.avatar}`;
        document.getElementById('player-name').value = player.name;
        document.getElementById('player-rank').textContent = player.rank;
        document.getElementById('player-wins').textContent = player.wins;
        document.getElementById('player-rating').textContent = player.rating;
    }

    // Room Management Functions
    function createRoom() {
        const roomName = document.getElementById('room-name').value;
        const difficulty = document.getElementById('room-difficulty').value;
        const type = document.getElementById('room-type').value;
        const privacy = document.getElementById('room-privacy').value;
        const password = document.getElementById('room-password').value;

        if (!roomName) {
            alert('Please enter a room name');
            return;
        }

        if (privacy === 'private' && !password) {
            alert('Please enter a password for private room');
            return;
        }

        socket.send(JSON.stringify({
            type: 'create_room',
            data: {
                name: roomName,
                difficulty,
                type,
                privacy,
                password
            }
        }));

        hideCreateRoomModal();
    }

    function joinRoom(roomId, password = '') {
        socket.send(JSON.stringify({
            type: 'join_room',
            data: {
                roomId,
                password
            }
        }));
    }

    function leaveRoom() {
        if (gameState.multiplayer.room.id) {
            socket.send(JSON.stringify({
                type: 'leave_room',
                data: {
                    roomId: gameState.multiplayer.room.id
                }
            }));
        }
        hideGameRoomModal();
    }

    function startGame() {
        if (gameState.multiplayer.room.id) {
            socket.send(JSON.stringify({
                type: 'start_game',
                data: {
                    roomId: gameState.multiplayer.room.id
                }
            }));
        }
    }

    // Chat Functions
    function sendChatMessage(message) {
        if (gameState.multiplayer.room.id && message.trim()) {
            socket.send(JSON.stringify({
                type: 'chat_message',
                data: {
                    roomId: gameState.multiplayer.room.id,
                    message: message.trim()
                }
            }));
            document.getElementById('chat-input').value = '';
        }
    }

    function addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <div class="sender">${sender}</div>
            <div class="content">${message}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Leaderboard Functions
    function updateLeaderboard() {
        socket.send(JSON.stringify({
            type: 'get_leaderboard'
        }));
    }

    function updateLeaderboardDisplay() {
        const globalLeaderboard = document.getElementById('global-leaderboard');
        const friendsLeaderboard = document.getElementById('friends-leaderboard');

        // Update global leaderboard
        globalLeaderboard.innerHTML = gameState.multiplayer.leaderboard.global
            .map((player, index) => createLeaderboardEntry(player, index + 1))
            .join('');

        // Update friends leaderboard
        friendsLeaderboard.innerHTML = gameState.multiplayer.leaderboard.friends
            .map((player, index) => createLeaderboardEntry(player, index + 1))
            .join('');
    }

    function createLeaderboardEntry(player, rank) {
        return `
            <div class="leaderboard-entry">
                <div class="leaderboard-rank">${rank}</div>
                <div class="leaderboard-player">
                    <img src="/static/images/${player.avatar}" alt="${player.name}">
                    <span>${player.name}</span>
                </div>
                <div class="leaderboard-stats">
                    <div>Rating: ${player.rating}</div>
                    <div>Wins: ${player.wins}</div>
                </div>
            </div>
        `;
    }

    // Avatar Functions
    function showAvatarModal() {
        avatarModal.classList.add('active');
        loadPresetAvatars();
    }

    function hideAvatarModal() {
        avatarModal.classList.remove('active');
    }

    function loadPresetAvatars() {
        const presetAvatars = document.getElementById('preset-avatars');
        const presets = [
            'avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png',
            'avatar5.png', 'avatar6.png', 'avatar7.png', 'avatar8.png'
        ];

        presetAvatars.innerHTML = presets
            .map(avatar => `
                <img src="/static/images/${avatar}" 
                     alt="Preset Avatar" 
                     class="preset-avatar"
                     onclick="selectPresetAvatar('${avatar}')">
            `)
            .join('');
    }

    function selectPresetAvatar(avatar) {
        gameState.multiplayer.player.avatar = avatar;
        updatePlayerProfileDisplay();
        savePlayerProfile();
        hideAvatarModal();
    }

    function uploadAvatar(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('avatar-preview');
                img.src = e.target.result;
                
                // Convert image to base64 and send to server
                socket.send(JSON.stringify({
                    type: 'upload_avatar',
                    data: {
                        image: e.target.result
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    }

    // Event Listeners
    multiplayerBtn.addEventListener('click', () => {
        playSound(clickSound);
        multiplayerModal.classList.add('active');
        updateLeaderboard();
    });

    createRoomBtn.addEventListener('click', () => {
        playSound(clickSound);
        createRoomModal.classList.add('active');
    });

    refreshRoomsBtn.addEventListener('click', () => {
        playSound(clickSound);
        socket.send(JSON.stringify({
            type: 'get_rooms'
        }));
    });

    document.getElementById('create-room-submit').addEventListener('click', () => {
        playSound(clickSound);
        createRoom();
    });

    document.getElementById('room-privacy').addEventListener('change', (e) => {
        const passwordGroup = document.getElementById('room-password-group');
        passwordGroup.style.display = e.target.value === 'private' ? 'block' : 'none';
    });

    document.getElementById('start-game-btn').addEventListener('click', () => {
        playSound(clickSound);
        startGame();
    });

    document.getElementById('leave-room-btn').addEventListener('click', () => {
        playSound(clickSound);
        leaveRoom();
    });

    document.getElementById('send-message').addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        sendChatMessage(input.value);
    });

    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage(e.target.value);
        }
    });

    document.getElementById('change-avatar').addEventListener('click', () => {
        playSound(clickSound);
        showAvatarModal();
    });

    document.getElementById('upload-avatar').addEventListener('click', () => {
        document.getElementById('avatar-upload').click();
    });

    document.getElementById('avatar-upload').addEventListener('change', uploadAvatar);

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`${tab}-leaderboard`).classList.add('active');
        });
    });

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            multiplayerModal.classList.remove('active');
            createRoomModal.classList.remove('active');
            gameRoomModal.classList.remove('active');
            avatarModal.classList.remove('active');
        });
    });

    // Initialize multiplayer
    loadPlayerProfile();
    connectWebSocket();

    // Daily Challenge Functions
    function loadDailyChallenge() {
        const savedChallenge = localStorage.getItem('tangoDailyChallenge');
        if (savedChallenge) {
            gameState.dailyChallenge = JSON.parse(savedChallenge);
            gameState.dailyChallenge.completedDates = new Set(gameState.dailyChallenge.completedDates);
            updateDailyChallengeDisplay();
        }
    }

    function saveDailyChallenge() {
        const challengeToSave = {
            ...gameState.dailyChallenge,
            completedDates: Array.from(gameState.dailyChallenge.completedDates)
        };
        localStorage.setItem('tangoDailyChallenge', JSON.stringify(challengeToSave));
    }

    function updateDailyChallengeDisplay() {
        const today = new Date().toISOString().split('T')[0];
        const challenge = gameState.dailyChallenge.currentChallenge;

        // Update challenge info
        document.getElementById('challenge-date').textContent = formatDate(today);
        document.getElementById('challenge-difficulty').textContent = challenge?.difficulty || 'Not Available';
        document.getElementById('challenge-time-limit').textContent = challenge?.timeLimit || '--:--';
        document.getElementById('challenge-best-time').textContent = 
            gameState.dailyChallenge.bestTimes[today] || '--:--';

        // Update streak
        document.getElementById('streak-count').textContent = gameState.dailyChallenge.streak;

        // Update calendar
        updateStreakCalendar();

        // Update leaderboard
        updateDailyLeaderboard();

        // Update history
        updateChallengeHistory();

        // Update rewards
        updateDailyRewards();
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function updateStreakCalendar() {
        const calendar = document.getElementById('streak-calendar');
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);

        let calendarHTML = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            const isCompleted = gameState.dailyChallenge.completedDates.has(dateString);
            const isToday = dateString === today.toISOString().split('T')[0];

            calendarHTML += `
                <div class="calendar-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}"
                     title="${formatDate(dateString)}">
                    ${date.getDate()}
                </div>
            `;
        }
        calendar.innerHTML = calendarHTML;
    }

    function updateDailyLeaderboard() {
        const globalLeaderboard = document.getElementById('daily-global-leaderboard');
        const friendsLeaderboard = document.getElementById('daily-friends-leaderboard');

        // Update global leaderboard
        globalLeaderboard.innerHTML = gameState.dailyChallenge.currentChallenge?.globalLeaderboard
            ?.map((entry, index) => createLeaderboardEntry(entry, index + 1))
            .join('') || '<p>No entries yet</p>';

        // Update friends leaderboard
        friendsLeaderboard.innerHTML = gameState.dailyChallenge.currentChallenge?.friendsLeaderboard
            ?.map((entry, index) => createLeaderboardEntry(entry, index + 1))
            .join('') || '<p>No entries yet</p>';
    }

    function updateChallengeHistory() {
        const historyList = document.getElementById('challenge-history');
        historyList.innerHTML = gameState.dailyChallenge.history
            .slice(-10)
            .map(entry => `
                <div class="history-item">
                    <div class="history-date">${formatDate(entry.date)}</div>
                    <div class="history-time">${entry.time}</div>
                    <div class="history-rank">Rank #${entry.rank}</div>
                </div>
            `)
            .join('');
    }

    function updateDailyRewards() {
        const rewardsGrid = document.getElementById('daily-rewards');
        const rewards = [
            {
                icon: '🎯',
                title: 'Perfect Score',
                description: 'Complete the daily challenge with no errors'
            },
            {
                icon: '⚡',
                title: 'Speed Demon',
                description: 'Complete the challenge in under 5 minutes'
            },
            {
                icon: '🔥',
                title: 'Streak Master',
                description: 'Maintain a 7-day streak'
            },
            {
                icon: '👑',
                title: 'Daily Champion',
                description: 'Finish in the top 10 on the global leaderboard'
            }
        ];

        rewardsGrid.innerHTML = rewards
            .map(reward => `
                <div class="reward-item ${isRewardUnlocked(reward) ? '' : 'locked'}">
                    <div class="reward-icon">${reward.icon}</div>
                    <div class="reward-title">${reward.title}</div>
                    <div class="reward-description">${reward.description}</div>
                </div>
            `)
            .join('');
    }

    function isRewardUnlocked(reward) {
        const today = new Date().toISOString().split('T')[0];
        const challenge = gameState.dailyChallenge.currentChallenge;

        switch (reward.title) {
            case 'Perfect Score':
                return challenge?.perfectScore;
            case 'Speed Demon':
                return challenge?.time && challenge.time < 300; // 5 minutes
            case 'Streak Master':
                return gameState.dailyChallenge.streak >= 7;
            case 'Daily Champion':
                return challenge?.rank && challenge.rank <= 10;
            default:
                return false;
        }
    }

    function startDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        
        // Generate new challenge if not exists
        if (!gameState.dailyChallenge.currentChallenge) {
            gameState.dailyChallenge.currentChallenge = {
                date: today,
                difficulty: getRandomDifficulty(),
                timeLimit: '10:00',
                board: generateDailyBoard(),
                globalLeaderboard: [],
                friendsLeaderboard: []
            };
        }

        // Start the game with the daily challenge board
        startNewGame(gameState.dailyChallenge.currentChallenge.board);
        hideDailyModal();
    }

    function getRandomDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        return difficulties[Math.floor(Math.random() * difficulties.length)];
    }

    function generateDailyBoard() {
        // Use the current date as a seed for the random number generator
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        // Generate a unique board based on the seed
        // This ensures everyone gets the same puzzle for the day
        return generateBoard(seed);
    }

    function completeDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        const time = document.getElementById('timer').textContent;
        
        // Update best time
        if (!gameState.dailyChallenge.bestTimes[today] || 
            time < gameState.dailyChallenge.bestTimes[today]) {
            gameState.dailyChallenge.bestTimes[today] = time;
        }

        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (gameState.dailyChallenge.completedDates.has(yesterdayString)) {
            gameState.dailyChallenge.streak++;
        } else {
            gameState.dailyChallenge.streak = 1;
        }

        // Add to completed dates
        gameState.dailyChallenge.completedDates.add(today);

        // Add to history
        gameState.dailyChallenge.history.push({
            date: today,
            time: time,
            rank: calculateRank(time)
        });

        // Update leaderboard
        updateLeaderboardEntry(time);

        // Save changes
        saveDailyChallenge();
        updateDailyChallengeDisplay();

        // Show completion message
        showAchievementNotification('Daily Challenge Completed!', 
            `You completed today's challenge in ${time}!`);
    }

    function calculateRank(time) {
        // Simple rank calculation based on time
        // In a real implementation, this would be based on the actual leaderboard
        return Math.floor(Math.random() * 100) + 1;
    }

    function updateLeaderboardEntry(time) {
        const today = new Date().toISOString().split('T')[0];
        const player = gameState.multiplayer.player;
        
        const entry = {
            player: player.name,
            avatar: player.avatar,
            time: time,
            date: today
        };

        // Update global leaderboard
        const globalLeaderboard = gameState.dailyChallenge.currentChallenge.globalLeaderboard;
        globalLeaderboard.push(entry);
        globalLeaderboard.sort((a, b) => a.time.localeCompare(b.time));
        globalLeaderboard.splice(100); // Keep only top 100

        // Update friends leaderboard
        const friendsLeaderboard = gameState.dailyChallenge.currentChallenge.friendsLeaderboard;
        friendsLeaderboard.push(entry);
        friendsLeaderboard.sort((a, b) => a.time.localeCompare(b.time));
        friendsLeaderboard.splice(50); // Keep only top 50
    }

    // Event Listeners
    dailyBtn.addEventListener('click', () => {
        playSound(clickSound);
        dailyModal.classList.add('active');
        updateDailyChallengeDisplay();
    });

    document.querySelector('#daily-modal .close-modal').addEventListener('click', () => {
        dailyModal.classList.remove('active');
    });

    // Initialize daily challenge
    loadDailyChallenge();

    // Tutorial System Functions
    function showTutorial() {
        tutorialModal.style.display = 'block';
        currentTutorialStep = 1;
        updateTutorialProgress();
        showTutorialStep(currentTutorialStep);
    }

    function hideTutorial() {
        tutorialModal.style.display = 'none';
    }

    function showTutorialStep(step) {
        tutorialSteps.forEach((s, index) => {
            s.style.display = index + 1 === step ? 'block' : 'none';
        });
    }

    function updateTutorialProgress() {
        const progress = (currentTutorialStep / totalTutorialSteps) * 100;
        progressFill.style.width = `${progress}%`;
        currentStepSpan.textContent = currentTutorialStep;
        totalStepsSpan.textContent = totalTutorialSteps;
    }

    function generatePracticePuzzle() {
        const practiceBoard = document.createElement('div');
        practiceBoard.className = 'practice-board';
        
        // Create a simple 4x4 practice puzzle
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'practice-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handlePracticeCellClick);
                practiceBoard.appendChild(cell);
            }
        }
        
        practicePuzzle.innerHTML = '';
        practicePuzzle.appendChild(practiceBoard);
    }

    function handlePracticeCellClick(event) {
        const cell = event.target;
        if (!cell.classList.contains('practice-cell')) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Toggle between sun and moon
        if (cell.classList.contains('sun')) {
            cell.classList.remove('sun');
            cell.classList.add('moon');
        } else if (cell.classList.contains('moon')) {
            cell.classList.remove('moon');
        } else {
            cell.classList.add('sun');
        }
        
        updatePracticeHelpers(row, col);
        checkPracticePuzzle();
    }

    function updatePracticeHelpers(row, col) {
        const cells = document.querySelectorAll('.practice-cell');
        cells.forEach(cell => {
            const cellRow = parseInt(cell.dataset.row);
            const cellCol = parseInt(cell.dataset.col);
            
            // Clear previous helpers
            cell.classList.remove('helper');
            
            // Add helpers for adjacent cells
            if ((Math.abs(cellRow - row) === 1 && cellCol === col) ||
                (Math.abs(cellCol - col) === 1 && cellRow === row)) {
                cell.classList.add('helper');
            }
        });
    }

    function checkPracticePuzzle() {
        const cells = document.querySelectorAll('.practice-cell');
        let isComplete = true;
        
        cells.forEach(cell => {
            if (!cell.classList.contains('sun') && !cell.classList.contains('moon')) {
                isComplete = false;
            }
        });
        
        if (isComplete) {
            // Check if the puzzle is solved correctly
            const isCorrect = validatePracticePuzzle();
            if (isCorrect) {
                // Move to next tutorial step
                currentTutorialStep++;
                if (currentTutorialStep <= totalTutorialSteps) {
                    updateTutorialProgress();
                    showTutorialStep(currentTutorialStep);
                } else {
                    hideTutorial();
                }
            }
        }
    }

    function validatePracticePuzzle() {
        // Simple validation for the practice puzzle
        const cells = document.querySelectorAll('.practice-cell');
        let isValid = true;
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (cell.classList.contains('sun')) {
                // Check adjacent cells
                const adjacentCells = document.querySelectorAll(
                    `.practice-cell[data-row="${row-1}"][data-col="${col}"],` +
                    `.practice-cell[data-row="${row+1}"][data-col="${col}"],` +
                    `.practice-cell[data-row="${row}"][data-col="${col-1}"],` +
                    `.practice-cell[data-row="${row}"][data-col="${col+1}"]`
                );
                
                adjacentCells.forEach(adjCell => {
                    if (adjCell.classList.contains('sun')) {
                        isValid = false;
                    }
                });
            }
        });
        
        return isValid;
    }

    // Timer functions
    function startTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
        }
        gameState.time = 0;
        gameState.timer = setInterval(updateTimer, 1000);
    }

    function stopTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
    }

    function updateTimer() {
        const elapsed = Math.floor(gameState.time / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    // Progress calculation
    function updateProgress() {
        const totalCells = gameState.size * gameState.size;
        const initialCells = gameState.initialBoard.flat().filter(cell => cell !== '').length;
        const filledCells = gameState.board.flat().filter(cell => cell !== '').length;
        const progress = Math.round(((filledCells - initialCells) / (totalCells - initialCells)) * 100);
        progressDisplay.textContent = `${progress}%`;
    }

    // Scoring system
    function calculateScore() {
        const timeElapsed = Math.floor(gameState.time / 1000);
        const baseScore = 1000;
        const timePenalty = Math.floor(timeElapsed / 10); // 1 point per 10 seconds
        const hintPenalty = gameState.hintsUsed * 50; // 50 points per hint
        
        gameState.score = Math.max(0, baseScore - timePenalty - hintPenalty);
        scoreDisplay.textContent = gameState.score;
    }

    // Initialize game board
    function initializeBoard() {
        gameState.board = Array(gameState.size).fill().map(() => Array(gameState.size).fill(''));
        gameState.initialBoard = Array(gameState.size).fill().map(() => Array(gameState.size).fill(''));
        renderBoard();
    }

    function renderBoard() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${gameState.size}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${gameState.size}, 1fr)`;
        
        for (let row = 0; row < gameState.size; row++) {
            for (let col = 0; col < gameState.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (gameState.initialBoard[row][col]) {
                    cell.classList.add('initial');
                    cell.textContent = gameState.initialBoard[row][col] === 'sun' ? '☀️' : '🌙';
                } else if (gameState.board[row][col]) {
                    cell.textContent = gameState.board[row][col] === 'sun' ? '☀️' : '🌙';
                }
                
                cell.addEventListener('click', () => handleCellClick(row, col));
                gameBoard.appendChild(cell);
            }
        }
        updateHelpers();
    }

    function updateHelpers() {
        // Update column helpers
        for (let col = 0; col < gameState.size; col++) {
            const suns = countSymbolsInCol(col, 'sun');
            const moons = countSymbolsInCol(col, 'moon');
            const helper = document.querySelector(`.helper-cell[data-col="${col}"]`);
            if (helper) {
                helper.textContent = `${suns}/${moons}`;
                
                // Check if column is complete
                if (suns + moons === gameState.size) {
                    helper.classList.add('complete');
                } else {
                    helper.classList.remove('complete');
                }
            }
        }
        
        // Update row helpers
        for (let row = 0; row < gameState.size; row++) {
            const suns = countSymbolsInRow(row, 'sun');
            const moons = countSymbolsInRow(row, 'moon');
            const helper = document.querySelector(`.helper-cell[data-row="${row}"]`);
            if (helper) {
                helper.textContent = `${suns}/${moons}`;
                
                // Check if row is complete
                if (suns + moons === gameState.size) {
                    helper.classList.add('complete');
                } else {
                    helper.classList.remove('complete');
                }
            }
        }
    }

    function countSymbolsInRow(row, symbol) {
        return gameState.board[row].filter(cell => cell === symbol).length;
    }

    function countSymbolsInCol(col, symbol) {
        return gameState.board.filter(row => row[col] === symbol).length;
    }

    function handleCellClick(row, col) {
        if (!gameState.isGameActive) {
            gameState.isGameActive = true;
            startTimer();
        }
        
        // Skip if cell is part of initial board
        if (gameState.initialBoard[row][col]) {
            return;
        }
        
        // Toggle between sun and moon
        if (gameState.board[row][col] === 'sun') {
            gameState.board[row][col] = 'moon';
        } else if (gameState.board[row][col] === 'moon') {
            gameState.board[row][col] = '';
        } else {
            gameState.board[row][col] = 'sun';
        }
        
        // Update the display
        const cell = gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = gameState.board[row][col] ? (gameState.board[row][col] === 'sun' ? '☀️' : '🌙') : '';
        
        // Update helper numbers
        updateHelpers();
        
        // Check if puzzle is complete
        checkPuzzle();
    }

    function checkPuzzle() {
        const cells = document.querySelectorAll('.cell');
        let isComplete = true;
        
        cells.forEach(cell => {
            if (!cell.classList.contains('initial') && !cell.classList.contains('sun') && !cell.classList.contains('moon')) {
                isComplete = false;
            }
        });
        
        if (isComplete) {
            // Puzzle is complete
            stopTimer();
            updateProgress();
            calculateScore();
            showAchievementNotification('Puzzle Completed!', 'Congratulations, you solved the puzzle!');
        }
    }

    function generateBoard(seed = null) {
        const board = Array(gameState.size).fill().map(() => Array(gameState.size).fill(''));
        const random = seed ? new Math.seedrandom(seed) : Math.random;

        // Generate a valid initial state
        for (let row = 0; row < gameState.size; row++) {
            for (let col = 0; col < gameState.size; col++) {
                if (random() < 0.3) { // 30% chance of initial value
                    board[row][col] = random() < 0.5 ? '☀️' : '🌙';
                }
            }
        }

        // Ensure the board is valid
        validateAndFixBoard(board);
        return board;
    }

    function validateAndFixBoard(board) {
        // Ensure no more than two identical symbols are adjacent
        for (let row = 0; row < gameState.size; row++) {
            for (let col = 0; col < gameState.size; col++) {
                if (board[row][col]) {
                    const symbol = board[row][col];
                    let adjacentCount = 0;

                    // Check adjacent cells
                    if (row > 0 && board[row-1][col] === symbol) adjacentCount++;
                    if (row < gameState.size-1 && board[row+1][col] === symbol) adjacentCount++;
                    if (col > 0 && board[row][col-1] === symbol) adjacentCount++;
                    if (col < gameState.size-1 && board[row][col+1] === symbol) adjacentCount++;

                    if (adjacentCount > 1) {
                        board[row][col] = ''; // Remove invalid placement
                    }
                }
            }
        }

        // Ensure equal number of suns and moons in each row and column
        for (let i = 0; i < gameState.size; i++) {
            let rowSuns = board[i].filter(cell => cell === '☀️').length;
            let rowMoons = board[i].filter(cell => cell === '🌙').length;
            let colSuns = board.map(row => row[i]).filter(cell => cell === '☀️').length;
            let colMoons = board.map(row => row[i]).filter(cell => cell === '🌙').length;

            // Adjust if needed
            while (rowSuns > gameState.size / 2) {
                const sunIndex = board[i].indexOf('☀️');
                if (sunIndex !== -1) {
                    board[i][sunIndex] = '';
                    rowSuns--;
                }
            }
            while (rowMoons > gameState.size / 2) {
                const moonIndex = board[i].indexOf('🌙');
                if (moonIndex !== -1) {
                    board[i][moonIndex] = '';
                    rowMoons--;
                }
            }
        }
    }

    function startNewGame(board = null) {
        stopTimer();
        updateBoardSize();
        gameState.board = Array(gameState.size).fill().map(() => Array(gameState.size).fill(''));
        gameState.initialBoard = board || generateBoard();
        gameState.time = 0;
        gameState.hintsUsed = 0;
        gameState.score = 0;
        gameState.moveHistory = [];
        gameState.moveHistoryIndex = -1;

        renderBoard();
        updateProgress();
        calculateScore();
        startTimer();
    }

    // Add difficulty handling
    function updateDifficulty(difficulty) {
        gameState.difficulty = difficulty;
        switch (difficulty) {
            case 'easy':
                gameState.size = 6;
                break;
            case 'medium':
                gameState.size = 8;
                break;
            case 'hard':
                gameState.size = 10;
                break;
        }
        startNewGame();
    }

    // Update the game board container size
    function updateBoardSize() {
        const container = document.querySelector('.game-board-container');
        
        // Update column helpers
        const columnHelpers = document.querySelector('.column-helpers');
        columnHelpers.style.gridTemplateColumns = `repeat(${gameState.size}, 1fr)`;
        columnHelpers.innerHTML = '';
        for (let i = 0; i < gameState.size; i++) {
            const helper = document.createElement('div');
            helper.className = 'helper-cell column-helper';
            helper.dataset.col = i;
            helper.innerHTML = `
                <div class="sun-count">0</div>
                <div class="moon-count">0</div>
            `;
            columnHelpers.appendChild(helper);
        }

        // Update row helpers
        const rowHelpers = document.querySelector('.row-helpers');
        rowHelpers.style.gridTemplateRows = `repeat(${gameState.size}, 1fr)`;
        rowHelpers.innerHTML = '';
        for (let i = 0; i < gameState.size; i++) {
            const helper = document.createElement('div');
            helper.className = 'helper-cell row-helper';
            helper.dataset.row = i;
            helper.innerHTML = `
                <div class="sun-count">0</div>
                <div class="moon-count">0</div>
            `;
            rowHelpers.appendChild(helper);
        }

        // Update game board
        const gameBoard = document.querySelector('.game-board');
        gameBoard.style.gridTemplateColumns = `repeat(${gameState.size}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${gameState.size}, 1fr)`;
    }

    // Add event listener for difficulty changes
    difficultySelect.addEventListener('change', (e) => {
        updateDifficulty(e.target.value);
    });

    // Initialize with medium difficulty
    updateDifficulty('medium');

    // Initialize the game
    initializeBoard();
    startNewGame();
}); 