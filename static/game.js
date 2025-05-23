document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const symbolBtns = document.querySelectorAll('.symbol-btn');
    let selectedSymbol = null;
    let gameState = {
        board: Array(6).fill().map(() => Array(6).fill(null)),
        isGameOver: false
    };

    // Initialize the game
    function initGame() {
        fetch('/api/new-game')
            .then(response => response.json())
            .then(data => {
                gameState.board = data.board;
                updateBoard();
            });
    }

    // Update the visual board based on game state
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = gameState.board[row][col];
            
            cell.className = 'cell';
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

    // Get next value in the cycle (null -> sun -> moon -> null)
    function getNextValue(currentValue) {
        if (currentValue === null) return 'sun';
        if (currentValue === 'sun') return 'moon';
        return null;
    }

    // Handle cell click
    function handleCellClick(event) {
        if (gameState.isGameOver) return;

        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const currentValue = gameState.board[row][col];
        const nextValue = getNextValue(currentValue);

        // Make API call to validate and update the move
        fetch('/api/make-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                row,
                col,
                value: nextValue
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                gameState.board[row][col] = nextValue;
                updateBoard();
                checkGameOver();
            }
        });
    }

    // Check if the game is over
    function checkGameOver() {
        // TODO: Implement game over check logic
        // Check for:
        // 1. Three in a row
        // 2. Equal number of suns and moons in each row/column
        // 3. No duplicate rows/columns
    }

    // Event Listeners
    newGameBtn.addEventListener('click', initGame);
    gameBoard.addEventListener('click', handleCellClick);
    symbolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedSymbol = btn.dataset.symbol;
            symbolBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Start the game
    initGame();
}); 