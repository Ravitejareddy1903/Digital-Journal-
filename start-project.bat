@echo off
title Aura Journal Full-Stack Launcher
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ========================================================
echo Launching Digital Journal Application (MERN + Vite)
echo ========================================================

echo 1. Starting Node.js Backend API on http://localhost:5000 ...
start "Aura Journal - Backend API" cmd /k "cd /d "%~dp0backend" && set PATH=C:\Program Files\nodejs;%PATH% && node server.js"

timeout /t 2 /nobreak >nul

echo 2. Starting Vite React Frontend on http://localhost:5173 ...
start "Aura Journal - Vite Frontend" cmd /k "cd /d "%~dp0frontend" && set PATH=C:\Program Files\nodejs;%PATH% && npm run dev -- --open"

echo.
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo MongoDB Service: Running on localhost:27017
pause
