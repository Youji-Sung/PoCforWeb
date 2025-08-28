@echo off
cd /d "%~dp0"

echo =============================================
echo Medical Image Renderer PoC - WORKING VERSION
echo =============================================
echo.

REM Compile TypeScript first
echo [1/3] Compiling TypeScript...
call npx tsc
if %errorlevel% neq 0 (
    echo Error: TypeScript compilation failed
    pause
    exit /b 1
)

echo.
echo [2/3] Starting backend server...
start "Medical Image Renderer Backend" cmd /k "cd backend\bin\Release\net8.0\publish && echo Backend starting on http://localhost:5175 && dotnet MedicalImageApi.dll"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo [3/3] Starting Electron app...
call npx electron .

echo.
echo Application closed.
pause