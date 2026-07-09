@echo off
setlocal

cd /d "%~dp0"
title My Yacht Development Server

where npm >nul 2>&1
if errorlevel 1 (
  echo.
  echo Node.js and npm were not found.
  echo Install Node.js, then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting My Yacht at http://127.0.0.1:5173
echo Press Ctrl+C to stop the server.
echo.

start "My Yacht Contact API" powershell -NoProfile -WindowStyle Hidden -Command "cd /d '%~dp0'; npm run dev:api"
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:5173'"
call npm run dev -- --host 127.0.0.1

endlocal
