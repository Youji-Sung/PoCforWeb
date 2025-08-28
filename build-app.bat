@echo off
echo ===========================================
echo Medical Image Renderer PoC - Build App
echo ===========================================
echo.

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Building frontend...
call npm run build

echo.
echo [3/4] Building backend...
call npm run build-backend

echo.
echo [4/4] Creating Windows installer...
call npm run build-electron

echo.
echo ✅ Build completed!
echo Check the 'dist' folder for the installer.
echo.

pause