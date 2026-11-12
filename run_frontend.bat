@echo off
chcp 65001 >nul
title HealthVoice - React Vite Frontend (Port 3000)
echo ========================================================
echo   KHOI DONG REACT FRONTEND WEB (PORT 3000)
echo ========================================================
cd /d %~dp0health-voice-frontend
call npm.cmd run dev
pause
