@echo off
cd /d "%~dp0"
echo ===========================================
echo Medical Image Renderer PoC - Release Mode
echo ===========================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Frontend build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Building backend...
call npm run build-backend
if %errorlevel% neq 0 (
    echo Error: Backend build failed
    pause
    exit /b 1
)

echo.
echo [4/4] Starting application...
echo Backend starting on http://localhost:5175
echo.

start "Medical Image Renderer Backend" cmd /c "cd /d "%~dp0backend\bin\Release\net8.0\publish" && dotnet MedicalImageApi.dll"
timeout /t 5 /nobreak > nul

echo Starting Electron app...
set NODE_ENV=production
call npx electron .

pause