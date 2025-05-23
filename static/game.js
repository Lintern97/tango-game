document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const checkBtn = document.getElementById('check-btn');
    const helpBtn = document.getElementById('help-btn');
    
    let gameState = {
        board: [],
        initialBoard: [],
        size: 8
    };

    // Initialize the game
    function initGame() {
        fetch('/api/new-game')
            .then(response => response.json())
            .then(data => {
                gameState.board = data.board;
                gameState.initialBoard = data.initial_board;
                updateBoard();
                updateHelpers();
            });
    }

    // Update the visual board based on game state
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = gameState.board[row][col];
            const isInitial = gameState.initialBoard[row][col] !== '';
            
            cell.className = 'cell';
            if (isInitial) {
                cell.classList.add('initial');
            }
            
            if (value === 'sun') {
                cell.textContent = '☀️';
                cell.classList.add('sun');
            } else if (value === 'moon') {
                cell.textContent = '🌙';
                cell.classList.add('moon');
            } else {
                cell.textContent = '';
            }
        });
    }

    // Update helper numbers for rows and columns
    function updateHelpers() {
        // Update column helpers
        for (let col = 0; col < gameState.size; col++) {
            const sunCount = countSymbolsInColumn(col, 'sun');
            const moonCount = countSymbolsInColumn(col, 'moon');
            const helper = document.querySelector(`.column-helper[data-col="${col}"]`);
            helper.querySelector('.sun-count').textContent = sunCount;
            helper.querySelector('.moon-count').textContent = moonCount;
            
            // Check if column is complete
            if (sunCount === gameState.size/2 && moonCount === gameState.size/2) {
                helper.classList.add('complete');
            } else {
                helper.classList.remove('complete');
            }
        }

        // Update row helpers
        for (let row = 0; row < gameState.size; row++) {
            const sunCount = countSymbolsInRow(row, 'sun');
            const moonCount = countSymbolsInRow(row, 'moon');
            const helper = document.querySelector(`.row-helper[data-row="${row}"]`);
            helper.querySelector('.sun-count').textContent = sunCount;
            helper.querySelector('.moon-count').textContent = moonCount;
            
            // Check if row is complete
            if (sunCount === gameState.size/2 && moonCount === gameState.size/2) {
                helper.classList.add('complete');
            } else {
                helper.classList.remove('complete');
            }
        }
    }

    // Count symbols in a row
    function countSymbolsInRow(row, symbol) {
        return gameState.board[row].filter(cell => cell === symbol).length;
    }

    // Count symbols in a column
    function countSymbolsInColumn(col, symbol) {
        return gameState.board.filter(row => row[col] === symbol).length;
    }

    // Get next value in the cycle (empty -> sun -> moon -> empty)
    function getNextValue(currentValue) {
        if (currentValue === '') return 'sun';
        if (currentValue === 'sun') return 'moon';
        return '';
    }

    // Handle cell click
    function handleCellClick(event) {
        const cell = event.target;
        if (!cell.classList.contains('cell')) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Don't allow changes to initial cells
        if (gameState.initialBoard[row][col] !== '') return;

        const currentValue = gameState.board[row][col];
        const nextValue = getNextValue(currentValue);
        
        gameState.board[row][col] = nextValue;
        updateBoard();
        updateHelpers();
    }

    // Check the current board state
    function checkBoard() {
        fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board: gameState.board,
                initial_board: gameState.initialBoard
            })
        })
        .then(response => response.json())
        .then(data => {
            // Clear previous error highlights
            document.querySelectorAll('.cell.error').forEach(cell => {
                cell.classList.remove('error');
                cell.title = '';
            });
            
            // Highlight errors
            data.errors.forEach(error => {
                const [row, col, message] = error;
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                cell.classList.add('error');
                cell.title = message;
            });
        });
    }

    // Get help for the current board state
    function getHelp() {
        fetch('/api/help', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board: gameState.board,
                initial_board: gameState.initialBoard
            })
        })
        .then(response => response.json())
        .then(data => {
            // Clear previous highlights
            document.querySelectorAll('.cell.error, .cell.hint').forEach(cell => {
                cell.classList.remove('error', 'hint');
                cell.title = '';
            });
            
            if (data.type === 'error') {
                // Highlight errors
                data.errors.forEach(error => {
                    const [row, col, message] = error;
                    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('error');
                    cell.title = message;
                });
            } else if (data.type === 'hint') {
                // Show hint
                const cell = document.querySelector(`.cell[data-row="${data.row}"][data-col="${data.col}"]`);
                cell.classList.add('hint');
                cell.title = data.reason;
            } else if (data.type === 'complete') {
                alert(data.message);
            }
        });
    }

    // Event Listeners
    newGameBtn.addEventListener('click', initGame);
    checkBtn.addEventListener('click', checkBoard);
    helpBtn.addEventListener('click', getHelp);
    gameBoard.addEventListener('click', handleCellClick);

    // Start the game
    initGame();
}); 