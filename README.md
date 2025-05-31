# Tango Game

⚠️ **AI-Generated Project** ⚠️

This project was generated using AI assistance and is currently in a non-functional state. The codebase contains several issues that need to be addressed:

## Current Issues
- Grid layout is not displaying correctly
- Game mechanics are not fully implemented
- UI components need significant refinement
- Core game logic requires debugging

## Project Structure
```
tango-game/
├── app.py              # Flask backend
├── static/
│   ├── game.js         # Game logic
│   └── style.css       # Styling
└── templates/
    └── index.html      # Main game interface
```

## Development Status
This project was created as an experiment in AI-assisted development. While the basic structure is in place, it requires significant work to become a functional game. The current implementation includes:

- Basic Flask server setup
- Incomplete game board implementation
- Partial UI styling
- Unfinished game mechanics

## Next Steps
To make this project functional, the following would need to be addressed:

1. Fix grid layout and rendering
2. Implement proper game mechanics
3. Debug core game logic
4. Refine UI/UX
5. Add proper error handling
6. Implement missing features

## Note
This project serves as a demonstration of AI-assisted development and highlights both the potential and limitations of current AI code generation tools. It should not be considered a production-ready application.

## License
MIT License - Feel free to use this as a learning resource or starting point for your own implementation.

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