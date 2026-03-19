@echo off
REM 本地部署脚本 - 使用 PM2

echo ====================================
echo 微信公众号系统 - 本地部署
echo ====================================

echo.
echo 1. 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js 未安装，请先安装 Node.js 18+
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo 2. 检查 MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo MySQL 未安装或不在 PATH 中
    echo 请确保 MySQL 8.0+ 已安装
    pause
    exit /b 1
)

echo.
echo 3. 安装后端依赖...
cd backend
call npm install
if errorlevel 1 (
    echo 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 4. 配置环境变量...
if not exist ".env.production" (
    echo 创建 .env.production
    copy .env.example .env.production
    echo.
    echo ====================================
    echo 请编辑 backend\.env.production 文件
    echo 配置所有必需的环境变量
    echo ====================================
    echo.
    notepad .env.production
    pause
)

echo.
echo 5. 构建后端...
call npm run build
if errorlevel 1 (
    echo 后端构建失败
    pause
    exit /b 1
)
cd ..

echo.
echo 6. 安装 PM2...
call npm install -g pm2
if errorlevel 1 (
    echo PM2 安装失败
    pause
    exit /b 1
)

echo.
echo 7. 停止旧进程...
pm2 stop wechat-backend 2>nul
pm2 delete wechat-backend 2>nul

echo.
echo 8. 启动后端服务...
cd backend
pm2 start dist/app.js --name wechat-backend
if errorlevel 1 (
    echo 后端启动失败
    pause
    exit /b 1
)
cd ..

echo.
echo 9. 保存 PM2 配置...
pm2 save
pm2 startup

echo.
echo 10. 安装前端依赖...
cd frontend
call npm install
if errorlevel 1 (
    echo 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 11. 配置前端 API 地址...
if not exist ".env.production" (
    echo VITE_API_BASE_URL=http://localhost:3000 > .env.production
    echo 已创建 frontend\.env.production
    echo API 地址设置为：http://localhost:3000
    echo.
    echo 如果需要修改，请编辑 frontend\.env.production
)

echo.
echo 12. 构建前端...
call npm run build
if errorlevel 1 (
    echo 前端构建失败
    pause
    exit /b 1
)
cd ..

echo.
echo ====================================
echo 部署完成！
echo ====================================
echo.
echo 后端服务：
echo   地址：http://localhost:3000
echo   状态：pm2 status
echo   日志：pm2 logs wechat-backend
echo   重启：pm2 restart wechat-backend
echo.
echo 前端文件：
echo   位置：frontend\dist
echo.
echo 需要使用 Nginx 或其他 Web 服务器托管前端文件
echo.
echo 默认管理员：
echo   用户名：admin
echo   密码：admin123
echo ====================================
echo.

pause
