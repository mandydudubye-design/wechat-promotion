@echo off
echo 正在启动所有服务...
PowerShell -ExecutionPolicy Bypass -File "%~dp0start-services.ps1"
pause
