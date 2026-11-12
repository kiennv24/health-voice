@echo off
chcp 65001 >nul
echo ========================================================
echo   KHOI DONG HE THONG HEALTH VOICE 2.0 (CLIENT-SERVER)
echo   Khong can Docker - Chay truc tiep tren Windows
echo ========================================================

echo [1/3] Khoi dong Python FastAPI TTS Microservice (Port 8000)...
start "HealthVoice - Python TTS Microservice" cmd /k "cd /d %~dp0tts-service && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Khoi dong Spring Boot Core Backend (Port 8080)...
start "HealthVoice - Spring Boot Core" cmd /k "cd /d %~dp0health-voice-backend && .\mvnw.cmd spring-boot:run"

timeout /t 5 /nobreak >nul

echo [3/3] Khoi dong React Frontend Web (Port 3000)...
start "HealthVoice - React Client" cmd /k "cd /d %~dp0health-voice-frontend && npm.cmd run dev"

timeout /t 4 /nobreak >nul

echo.
echo ========================================================
echo   TAT CA DICH VU DA DUOC KHOI DONG THANH CONG!
echo   - Giao dien Web (React):   http://localhost:3000
echo   - May chu API (Java):       http://localhost:8080
echo   - May chu TTS (FastAPI):    http://localhost:8000/docs
echo ========================================================
echo Dang mo trinh duyet...
start http://localhost:3000
pause
