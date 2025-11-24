@echo off
echo ========================================
echo   QR Attend - Phone Testing Setup
echo ========================================
echo.

REM Get IP address
echo Finding your computer's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo.
echo ========================================
echo   Your Computer IP: %IP%
echo ========================================
echo.
echo Access from your phone:
echo   http://%IP%:8000
echo.
echo ========================================
echo.

REM Check if Laravel is available
where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PHP not found! Make sure Laravel is set up.
    pause
    exit /b 1
)

REM Check if Node is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found! Make sure Node.js is installed.
    pause
    exit /b 1
)

echo Starting servers...
echo.
echo [1/2] Starting Laravel server on port 8000...
start "Laravel Server" cmd /k "title Laravel Server && php artisan serve --host=0.0.0.0 --port=8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite dev server on port 5173...
start "Vite Dev Server" cmd /k "title Vite Dev Server && npm run dev"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Laravel: http://%IP%:8000
echo Vite:    http://%IP%:5173
echo.
echo ========================================
echo   IMPORTANT: Camera Setup
echo ========================================
echo.
echo For camera to work on your phone:
echo.
echo Option 1 (Easiest - Android):
echo   1. Enable USB Debugging on phone
echo   2. Run: adb reverse tcp:8000 tcp:8000
echo   3. Access: http://localhost:8000 on phone
echo.
echo Option 2 (Chrome):
echo   1. On phone Chrome, go to:
echo      chrome://flags/#unsafely-treat-insecure-origin-as-secure
echo   2. Enable the flag
echo   3. Add: http://%IP%:8000
echo   4. Restart Chrome
echo.
echo ========================================
echo.
echo Press any key to stop servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Laravel Server*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Vite Dev Server*" /T /F >nul 2>&1

echo Done!

