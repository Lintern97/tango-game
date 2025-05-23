# Tango Puzzle Game

A web-based implementation of the Tango (Binairo) puzzle game using Flask. The game features a modern, user-friendly interface with sun and moon symbols instead of traditional 1s and 0s.

## Game Rules

1. No more than two identical symbols can be adjacent (horizontally or vertically)
2. Each row and column must have an equal number of suns and moons
3. No row or column can be identical to another row or column

## Setup (Windows)

1. Create a virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\activate
```

2. Install dependencies:
```powershell
pip install -r requirements.txt
```

3. Run the application:
```powershell
python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Features

- Modern, responsive design
- Intuitive sun (☀️) and moon (🌙) symbols
- Real-time move validation
- Game state persistence
- Clean and user-friendly interface

## Development

The project structure is as follows:
- `app.py`: Main Flask application
- `templates/`: HTML templates
- `static/`: CSS and JavaScript files
- `requirements.txt`: Project dependencies

## Troubleshooting

If you encounter any issues:
1. Make sure Python is installed and added to your PATH
2. Ensure you're running PowerShell or Command Prompt as administrator if you encounter permission issues
3. If the virtual environment activation fails, try running: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in PowerShell 