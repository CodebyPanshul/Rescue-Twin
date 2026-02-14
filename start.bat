@echo off
title Rescue Twin - Starting...
cd /d "%~dp0"

:: If frontend deps not installed, tell user to run SETUP.bat first
if not exist "frontend\node_modules" (
    echo.
    echo  First time here? Run SETUP.bat once to install dependencies.
    echo  Then run this script again.
    echo.
    pause
    exit /b 1
)

echo.
echo  Rescue Twin - One-step start
echo  ===========================
echo.

:: Start backend in a new window (with venv so packages are found)
start "Rescue Twin Backend (API)" cmd /k "cd /d "%~dp0" && call venv\Scripts\activate && cd backend && python main.py"

:: Give backend a moment to bind the port
echo  Starting backend... (new window)
timeout /t 3 /nobreak >nul

:: Start frontend in this window (so you see the URL)
echo  Starting frontend...
echo.
echo  On your phone: use same Wi-Fi, then open the "Network" URL shown below
echo  (e.g. http://192.168.1.5:3000)
echo.
cd frontend
npm run dev
