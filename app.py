from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__)

# Game board size (8x8)
BOARD_SIZE = 8

def create_empty_board():
    return [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]

def is_valid_move(board, row, col, value):
    if value is None:
        return True
        
    # Check if the move would create three in a row horizontally
    if col >= 2:
        if board[row][col-1] == value and board[row][col-2] == value:
            return False
    if col <= BOARD_SIZE-3:
        if board[row][col+1] == value and board[row][col+2] == value:
            return False
    if 0 < col < BOARD_SIZE-1:
        if board[row][col-1] == value and board[row][col+1] == value:
            return False

    # Check if the move would create three in a row vertically
    if row >= 2:
        if board[row-1][col] == value and board[row-2][col] == value:
            return False
    if row <= BOARD_SIZE-3:
        if board[row+1][col] == value and board[row+2][col] == value:
            return False
    if 0 < row < BOARD_SIZE-1:
        if board[row-1][col] == value and board[row+1][col] == value:
            return False

    return True

def count_symbols_in_row(board, row, symbol):
    return sum(1 for cell in board[row] if cell == symbol)

def count_symbols_in_col(board, col, symbol):
    return sum(1 for row in board if row[col] == symbol)

def is_row_valid(board, row):
    suns = count_symbols_in_row(board, row, 'sun')
    moons = count_symbols_in_row(board, row, 'moon')
    return suns <= BOARD_SIZE//2 and moons <= BOARD_SIZE//2

def is_col_valid(board, col):
    suns = count_symbols_in_col(board, col, 'sun')
    moons = count_symbols_in_col(board, col, 'moon')
    return suns <= BOARD_SIZE//2 and moons <= BOARD_SIZE//2

def are_rows_unique(board):
    filled_rows = [row for row in board if None not in row]
    return len(filled_rows) == len(set(tuple(row) for row in filled_rows))

def are_cols_unique(board):
    filled_cols = []
    for col in range(BOARD_SIZE):
        col_values = [board[row][col] for row in range(BOARD_SIZE)]
        if None not in col_values:
            filled_cols.append(tuple(col_values))
    return len(filled_cols) == len(set(filled_cols))

def count_empty_cells(board):
    return sum(1 for row in board for cell in row if cell is None)

def is_board_valid(board):
    # Check if any row or column has more than two identical symbols adjacent
    for row in range(BOARD_SIZE):
        for col in range(BOARD_SIZE):
            if board[row][col] is not None and not is_valid_move(board, row, col, board[row][col]):
                return False
    
    # Check if rows and columns have equal numbers of suns and moons
    for i in range(BOARD_SIZE):
        if not is_row_valid(board, i) or not is_col_valid(board, i):
            return False
    
    # Check if rows and columns are unique
    if not are_rows_unique(board) or not are_cols_unique(board):
        return False
    
    return True

def generate_puzzle():
    max_attempts = 2000
    attempts = 0
    
    while attempts < max_attempts:
        board = create_empty_board()
        symbols = ['sun', 'moon']
        
        # First, fill the board with a valid pattern
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                valid_symbols = [s for s in symbols if is_valid_move(board, row, col, s)]
                if valid_symbols:
                    board[row][col] = random.choice(valid_symbols)
                else:
                    # If no valid symbol can be placed, start over
                    break
            else:
                continue
            break
        
        # Verify the board is valid
        if is_board_valid(board):
            # Remove cells to create the puzzle
            # For 8x8, we want to remove between 32 and 40 cells (50-62.5% empty)
            min_empty = BOARD_SIZE * 4  # 32 cells
            max_empty = BOARD_SIZE * 5  # 40 cells
            cells_to_remove = random.randint(min_empty, max_empty)
            
            # Create a list of all cell positions
            positions = [(row, col) for row in range(BOARD_SIZE) for col in range(BOARD_SIZE)]
            random.shuffle(positions)
            
            # Remove cells while maintaining puzzle validity
            for row, col in positions[:cells_to_remove]:
                board[row][col] = None
            
            # Verify we have enough empty cells
            if count_empty_cells(board) >= min_empty:
                return board
        
        attempts += 1
    
    # If we couldn't generate a valid puzzle, create a simple one with some pre-filled cells
    board = create_empty_board()
    # Add some initial cells in a valid pattern
    for row in range(0, BOARD_SIZE, 2):
        for col in range(0, BOARD_SIZE, 2):
            board[row][col] = 'sun' if (row + col) % 4 == 0 else 'moon'
    return board

@app.route('/')
def index():
    return render_template('index.html', board_size=BOARD_SIZE)

@app.route('/api/new-game')
def new_game():
    board = generate_puzzle()
    return jsonify({'board': board})

@app.route('/api/make-move', methods=['POST'])
def make_move():
    data = request.get_json()
    row = data.get('row')
    col = data.get('col')
    value = data.get('value')
    
    # TODO: Implement move validation and board update logic
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True) 