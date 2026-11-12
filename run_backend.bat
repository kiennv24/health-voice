@echo off
chcp 65001 >nul
title HealthVoice - Spring Boot Core Backend (Port 8080)
echo ========================================================
echo   KHOI DONG SPRING BOOT BACKEND CORE (PORT 8080)
echo ========================================================
cd /d %~dp0health-voice-backend
call .\mvnw.cmd spring-boot:run
pause

