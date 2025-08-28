@echo off
echo ===========================================
echo Medical Image Renderer PoC - Development Mode
echo ===========================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Starting development environment...
echo Backend: http://localhost:5175
echo Frontend: http://localhost:5180
echo.

call npm run dev-full

pause