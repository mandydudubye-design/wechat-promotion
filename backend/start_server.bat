@echo off
REM 微信推广追踪系统 - 快速启动脚本
REM 使用方法: start_server.bat

echo ================================================
echo  微信推广追踪系统 - 服务器启动脚本
echo ================================================
echo.

REM 检查MySQL服务
echo [1/4] 检查MySQL服务...
sc query MySQL80 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] MySQL80服务未找到，尝试启动MySQL服务...
    net start MySQL80 >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [X] MySQL服务启动失败！
        echo [*] 请先安装MySQL并启动服务
        echo [*] 下载地址: https://dev.mysql.com/downloads/mysql/
        pause
        exit /b 1
    )
) else (
    echo [*] MySQL服务已运行
)

REM 检查数据库是否存在
echo [2/4] 检查数据库...
mysql -u root -p123456 -e "USE wechat_promotion;" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] 数据库不存在，正在初始化...
    mysql -u root -p123456 < init_database.sql
    if %ERRORLEVEL% neq 0 (
        echo [X] 数据库初始化失败！
        echo [*] 请检查MySQL密码是否正确（默认：123456）
        pause
        exit /b 1
    )
    echo [OK] 数据库初始化成功
) else (
    echo [*] 数据库已存在
)

REM 检查Node.js依赖
echo [3/4] 检查Node.js依赖...
if not exist "node_modules\" (
    echo [*] 正在安装依赖...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [X] 依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo [*] 依赖已安装
)

REM 检查是否已有服务器进程运行
echo [4/4] 启动服务器...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [!] 检测到已有Node.js进程运行，正在关闭...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

REM 创建日志目录
if not exist "logs\" mkdir logs

REM 启动开发服务器
echo [*] 正在启动开发服务器...
start /B cmd /c "npm run dev > logs\server.log 2>&1"

REM 等待服务器启动
echo [*] 等待服务器启动...
timeout /t 5 /nobreak >nul

REM 测试服务器
echo [*] 测试服务器连接...
curl -s http://localhost:3000/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================
    echo  [OK] 服务器启动成功！
    echo ================================================
    echo.
    echo [*] 服务器地址: http://localhost:3000
    echo [*] API文档: http://localhost:3000/api-docs
    echo [*] 健康检查: http://localhost:3000/health
    echo.
    echo [*] 默认管理员账号:
    echo     用户名: admin
    echo     密码: admin123
    echo.
    echo [*] 查看日志: 
    echo     Get-Content logs\server.log -Wait
    echo.
    echo [*] 停止服务器: 
    echo     taskkill /F /IM node.exe
    echo.
) else (
    echo [X] 服务器启动失败！
    echo [*] 请查看日志文件: logs\server.log
    echo.
    type logs\server.log
    pause
)

pause
