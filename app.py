from flask import Flask, render_template, jsonify, request
import random
import copy

app = Flask(__name__)

# Difficulty levels
DIFFICULTY_EASY = {
    'size': 6,
    'min_fill': 0.30,
    'max_fill': 0.35
}
DIFFICULTY_MEDIUM = {
    'size': 8,
    'min_fill': 0.25,
    'max_fill': 0.30
}
DIFFICULTY_HARD = {
    'size': 10,
    'min_fill': 0.20,
    'max_fill': 0.25
}

def get_board_size(difficulty='medium'):
    difficulty_settings = {
        'easy': DIFFICULTY_EASY,
        'medium': DIFFICULTY_MEDIUM,
        'hard': DIFFICULTY_HARD
    }.get(difficulty.lower(), DIFFICULTY_MEDIUM)
    return difficulty_settings['size']

def create_empty_board(size):
    return [['' for _ in range(size)] for _ in range(size)]

def is_valid_move(board, row, col, value):
    if value == '':
        return True
        
    board_size = len(board)
    # Check if the move would create three in a row horizontally
    if col >= 2:
        if board[row][col-1] == value and board[row][col-2] == value:
            return False
    if col <= board_size-3:
        if board[row][col+1] == value and board[row][col+2] == value:
            return False
    if 0 < col < board_size-1:
        if board[row][col-1] == value and board[row][col+1] == value:
            return False

    # Check if the move would create three in a row vertically
    if row >= 2:
        if board[row-1][col] == value and board[row-2][col] == value:
            return False
    if row <= board_size-3:
        if board[row+1][col] == value and board[row+2][col] == value:
            return False
    if 0 < row < board_size-1:
        if board[row-1][col] == value and board[row+1][col] == value:
            return False

    return True

def count_symbols_in_row(board, row, symbol):
    return sum(1 for cell in board[row] if cell == symbol)

def count_symbols_in_col(board, col, symbol):
    return sum(1 for row in board if row[col] == symbol)

def is_row_valid(board, row):
    board_size = len(board)
    suns = count_symbols_in_row(board, row, 'sun')
    moons = count_symbols_in_row(board, row, 'moon')
    return suns <= board_size//2 and moons <= board_size//2

def is_col_valid(board, col):
    board_size = len(board)
    suns = count_symbols_in_col(board, col, 'sun')
    moons = count_symbols_in_col(board, col, 'moon')
    return suns <= board_size//2 and moons <= board_size//2

def are_rows_unique(board):
    filled_rows = [row for row in board if '' not in row]
    return len(filled_rows) == len(set(tuple(row) for row in filled_rows))

def are_cols_unique(board):
    board_size = len(board)
    filled_cols = []
    for col in range(board_size):
        col_values = [board[row][col] for row in range(board_size)]
        if '' not in col_values:
            filled_cols.append(tuple(col_values))
    return len(filled_cols) == len(set(filled_cols))

def count_empty_cells(board):
    return sum(1 for row in board for cell in row if cell == '')

def is_board_valid(board):
    board_size = len(board)
    # Check if any row or column has more than two identical symbols adjacent
    for row in range(board_size):
        for col in range(board_size):
            if board[row][col] != '' and not is_valid_move(board, row, col, board[row][col]):
                return False
    
    # Check if rows and columns have equal numbers of suns and moons
    for i in range(board_size):
        if not is_row_valid(board, i) or not is_col_valid(board, i):
            return False
    
    # Check if rows and columns are unique
    if not are_rows_unique(board) or not are_cols_unique(board):
        return False
    
    return True

def find_empty_cell(board):
    board_size = len(board)
    for row in range(board_size):
        for col in range(board_size):
            if board[row][col] == '':
                return row, col
    return None

def solve_puzzle(board):
    """Solve the puzzle using backtracking."""
    empty = find_empty_cell(board)
    if not empty:
        return True  # Puzzle is solved
    
    row, col = empty
    for value in ['sun', 'moon']:
        if is_valid_move(board, row, col, value):
            board[row][col] = value
            
            if is_board_valid(board) and solve_puzzle(board):
                return True
            
            board[row][col] = ''
    
    return False

def count_solutions(board):
    """Count the number of solutions for the puzzle."""
    solutions = 0
    
    def count_solutions_recursive(board):
        nonlocal solutions
        empty = find_empty_cell(board)
        if not empty:
            solutions += 1
            return
        
        row, col = empty
        for value in ['sun', 'moon']:
            if is_valid_move(board, row, col, value):
                board[row][col] = value
                if is_board_valid(board):
                    count_solutions_recursive(board)
                board[row][col] = ''
    
    count_solutions_recursive(copy.deepcopy(board))
    return solutions

def generate_complete_solution(size):
    """Generate a complete, valid solution."""
    board = create_empty_board(size)
    if solve_puzzle(board):
        return board
    return None

def generate_puzzle(difficulty='medium'):
    # Get board size based on difficulty
    board_size = get_board_size(difficulty)
    board = create_empty_board(board_size)
    initial_board = create_empty_board(board_size)
    
    # Select difficulty settings
    difficulty_settings = {
        'easy': DIFFICULTY_EASY,
        'medium': DIFFICULTY_MEDIUM,
        'hard': DIFFICULTY_HARD
    }.get(difficulty.lower(), DIFFICULTY_MEDIUM)
    
    # Calculate target number of initial cells based on difficulty
    target_cells = int(board_size * board_size * random.uniform(
        difficulty_settings['min_fill'],
        difficulty_settings['max_fill']
    ))
    placed_cells = 0
    
    # Try to place symbols
    attempts = 0
    max_attempts = 1000
    
    while placed_cells < target_cells and attempts < max_attempts:
        row = random.randint(0, board_size - 1)
        col = random.randint(0, board_size - 1)
        
        if board[row][col] == '':
            symbol = random.choice(['sun', 'moon'])
            if is_valid_move(board, row, col, symbol):
                board[row][col] = symbol
                initial_board[row][col] = symbol
                placed_cells += 1
        
        attempts += 1
    
    return board, initial_board

@app.route('/')
def index():
    return render_template('index.html', board_size=DIFFICULTY_MEDIUM['size'])

@app.route('/api/new-game', methods=['GET'])
def new_game():
    difficulty = request.args.get('difficulty', 'medium')
    board, initial_board = generate_puzzle(difficulty)
    return jsonify({
        'board': board,
        'initial_board': initial_board,
        'difficulty': difficulty,
        'size': get_board_size(difficulty)
    })

@app.route('/api/check', methods=['POST'])
def check_board():
    data = request.get_json()
    board = data.get('board', [])
    initial_board = data.get('initial_board', [])
    
    errors = check_board_state(board, initial_board)
    return jsonify({
        'errors': errors
    })

@app.route('/api/help', methods=['POST'])
def get_help():
    data = request.get_json()
    board = data.get('board', [])
    initial_board = data.get('initial_board', [])
    
    solution = find_help_solution(board, initial_board)
    return jsonify(solution)

@app.route('/api/make-move', methods=['POST'])
def make_move():
    data = request.get_json()
    row = data.get('row')
    col = data.get('col')
    value = data.get('value')
    
    # TODO: Implement move validation and board update logic
    
    return jsonify({'success': True})

def check_board_state(board, initial_board):
    errors = []
    
    # Check each cell
    for row in range(get_board_size()):
        for col in range(get_board_size()):
            # Skip initial cells
            if initial_board[row][col] != '':
                continue
                
            cell = board[row][col]
            if cell == '':  # Skip empty cells
                continue
                
            # Check for three in a row horizontally
            if col >= 2:
                if board[row][col-1] == cell and board[row][col-2] == cell:
                    errors.append((row, col, "Three identical symbols in a row"))
            if col <= get_board_size()-3:
                if board[row][col+1] == cell and board[row][col+2] == cell:
                    errors.append((row, col, "Three identical symbols in a row"))
            if 0 < col < get_board_size()-1:
                if board[row][col-1] == cell and board[row][col+1] == cell:
                    errors.append((row, col, "Three identical symbols in a row"))
            
            # Check for three in a row vertically
            if row >= 2:
                if board[row-1][col] == cell and board[row-2][col] == cell:
                    errors.append((row, col, "Three identical symbols in a column"))
            if row <= get_board_size()-3:
                if board[row+1][col] == cell and board[row+2][col] == cell:
                    errors.append((row, col, "Three identical symbols in a column"))
            if 0 < row < get_board_size()-1:
                if board[row-1][col] == cell and board[row+1][col] == cell:
                    errors.append((row, col, "Three identical symbols in a column"))
    
    # Check row and column counts
    for i in range(get_board_size()):
        # Check row counts
        suns_in_row = count_symbols_in_row(board, i, 'sun')
        moons_in_row = count_symbols_in_row(board, i, 'moon')
        if suns_in_row > get_board_size()//2:
            errors.append((i, 0, f"Too many suns in row {i+1}"))
        if moons_in_row > get_board_size()//2:
            errors.append((i, 0, f"Too many moons in row {i+1}"))
        
        # Check column counts
        suns_in_col = count_symbols_in_col(board, i, 'sun')
        moons_in_col = count_symbols_in_col(board, i, 'moon')
        if suns_in_col > get_board_size()//2:
            errors.append((0, i, f"Too many suns in column {i+1}"))
        if moons_in_col > get_board_size()//2:
            errors.append((0, i, f"Too many moons in column {i+1}"))
    
    # Check for duplicate rows
    filled_rows = []
    for row in range(get_board_size()):
        if '' not in board[row]:  # Only check complete rows
            row_tuple = tuple(board[row])
            if row_tuple in filled_rows:
                errors.append((row, 0, f"Row {row+1} is identical to another row"))
            filled_rows.append(row_tuple)
    
    # Check for duplicate columns
    filled_cols = []
    for col in range(get_board_size()):
        col_values = [board[row][col] for row in range(get_board_size())]
        if '' not in col_values:  # Only check complete columns
            col_tuple = tuple(col_values)
            if col_tuple in filled_cols:
                errors.append((0, col, f"Column {col+1} is identical to another column"))
            filled_cols.append(col_tuple)
    
    return errors

def find_help_solution(board, initial_board):
    # First check for errors
    errors = check_board_state(board, initial_board)
    if errors:
        return {
            'type': 'error',
            'errors': errors
        }
    
    # If no errors, find a cell that can be solved
    for row in range(get_board_size()):
        for col in range(get_board_size()):
            if initial_board[row][col] != '' or board[row][col] != '':
                continue  # Skip initial and filled cells
            
            # Try placing a sun
            if is_valid_move(board, row, col, 'sun'):
                # Check if this would create any errors
                board[row][col] = 'sun'
                if not check_board_state(board, initial_board):
                    board[row][col] = ''  # Reset the cell
                    return {
                        'type': 'hint',
                        'row': row,
                        'col': col,
                        'symbol': 'sun',
                        'reason': 'This cell can be filled with a sun as it follows all game rules'
                    }
                board[row][col] = ''  # Reset the cell
            
            # Try placing a moon
            if is_valid_move(board, row, col, 'moon'):
                # Check if this would create any errors
                board[row][col] = 'moon'
                if not check_board_state(board, initial_board):
                    board[row][col] = ''  # Reset the cell
                    return {
                        'type': 'hint',
                        'row': row,
                        'col': col,
                        'symbol': 'moon',
                        'reason': 'This cell can be filled with a moon as it follows all game rules'
                    }
                board[row][col] = ''  # Reset the cell
    
    # If we get here, either the puzzle is complete or we couldn't find a valid move
    if all(cell != '' for row in board for cell in row):
        return {
            'type': 'complete',
            'message': 'Congratulations! The puzzle is complete!'
        }
    else:
        return {
            'type': 'error',
            'errors': [(0, 0, "No valid moves found. Try removing some symbols and try again.")]
        }

if __name__ == '__main__':
    app.run(debug=True) 