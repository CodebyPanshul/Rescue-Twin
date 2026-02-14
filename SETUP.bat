@echo off
title Rescue Twin - First-time setup
cd /d "%~dp0"

echo.
echo  Rescue Twin - First-time setup (run this once per machine)
echo  =========================================================
echo.
echo  You need Python 3.9+ and Node.js 18+ installed first.
echo  If not: https://python.org  and  https://nodejs.org
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found. Install Python 3.9+ from https://python.org
    echo.
    pause
    exit /b 1
)
echo  [1/4] Python found.

:: Check Node
npm --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js/npm not found. Install from https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo  [2/4] Node.js found.

:: Create venv and install Python deps
if not exist "venv\Scripts\activate.bat" (
    echo  [3/4] Creating Python virtual environment...
    python -m venv venv
) else (
    echo  [3/4] Virtual environment already exists.
)
call venv\Scripts\activate.bat
echo        Installing Python packages...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo  [ERROR] pip install failed.
    pause
    exit /b 1
)
echo        Done.

:: Install Node deps (frontend + root)
echo  [4/4] Installing Node packages (root + frontend)...
call npm run install:all
if errorlevel 1 (
    echo  [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo  =========================================================
echo   Setup complete. You can now start the app:
echo   - Double-click start.bat   OR   run: npm start
echo   - Then open http://localhost:3000 in your browser
echo  =========================================================
echo.
pause
