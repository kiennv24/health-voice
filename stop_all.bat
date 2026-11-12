@echo off
chcp 65001 >nul
echo ========================================================
echo   DANG DUNG TAT CA DICH VU HEALTH VOICE
echo ========================================================

echo Dang dung tien trinh tren Port 3000 (React Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Dang dung tien trinh tren Port 8080 (Spring Boot Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Dang dung tien trinh tren Port 8000 (Python FastAPI TTS)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo ========================================================
echo   DA DUNG HOAN TOAN CAC DICH VU!
echo ========================================================
pause

