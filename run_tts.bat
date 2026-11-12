@echo off
chcp 65001 >nul
title HealthVoice - Python FastAPI TTS Service (Port 8000)
echo ========================================================
echo   KHOI DONG PYTHON FASTAPI TTS SERVICE (PORT 8000)
echo ========================================================
cd /d %~dp0tts-service
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause

