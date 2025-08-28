@echo off
cd /d "%~dp0"

echo ======================================
echo Medical Image Renderer - Quick Start
echo ======================================

REM Start backend
echo Starting backend server...
start "Backend Server" cmd /k "cd backend\bin\Release\net8.0\publish && dotnet MedicalImageApi.dll"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start Electron
echo Starting Electron app...
set NODE_ENV=production
npx electron dist/electron/main.js

echo.
echo If there are errors, please run 'start-release.bat' first to build everything.
pause