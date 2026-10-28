@echo off
title Aura Journal - Vite React Frontend
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo ========================================================
echo Starting Vite Development Server on http://localhost:5173
echo ========================================================
npm run dev -- --open
pause
