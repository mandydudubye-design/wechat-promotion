@echo off
REM 微信推广追踪系统 - 停止服务器脚本
REM 使用方法: stop_server.bat

echo ================================================
echo  微信推广追踪系统 - 停止服务器
echo ================================================
echo.

echo [*] 正在停止Node.js服务器...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM node.exe
    echo [OK] 服务器已停止
) else (
    echo [!] 未发现运行中的Node.js服务器
)

echo.
echo [*] 完成！
echo.
pause
