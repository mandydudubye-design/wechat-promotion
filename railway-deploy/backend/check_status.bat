@echo off
REM 微信推广追踪系统 - 状态检查脚本
REM 使用方法: check_status.bat

echo ================================================
echo  微信推广追踪系统 - 状态检查
echo ================================================
echo.

REM 检查MySQL服务
echo [MySQL服务]
sc query MySQL80 | find "STATE"
echo.

REM 检查Node.js进程
echo [Node.js进程]
tasklist /FI "IMAGENAME eq node.exe" 2>NUL
if %ERRORLEVEL% neq 0 (
    echo [!] 未发现Node.js进程
)
echo.

REM 检查服务器健康状态
echo [服务器健康检查]
curl -s http://localhost:3000/health 2>nul
if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] 服务器运行正常
) else (
    echo [X] 服务器无法访问
)
echo.

REM 检查数据库连接
echo [数据库连接]
mysql -u root -p123456 -e "SELECT 'Connected' as status;" 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] 数据库连接正常
) else (
    echo [X] 数据库连接失败
)
echo.

REM 检查端口占用
echo [端口占用情况]
netstat -an | find ":3000"
echo.

pause
