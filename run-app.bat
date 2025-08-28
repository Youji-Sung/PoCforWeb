@echo off
cd /d "%~dp0"

echo Starting Medical Image Renderer...

REM Check if built files exist
if not exist "dist\index.html" (
    echo Building frontend...
    call npm run build
)

if not exist "backend\bin\Release\net8.0\publish\MedicalImageApi.dll" (
    echo Building backend...
    call npm run build-backend
)

echo Starting backend...
start "Backend" cmd /c "cd /d "%~dp0backend\bin\Release\net8.0\publish" && dotnet MedicalImageApi.dll"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Electron app...
set NODE_ENV=production
call npx electron .

pause