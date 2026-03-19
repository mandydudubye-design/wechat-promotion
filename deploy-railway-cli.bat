@echo off
chcp 65001 >nul

echo ====================================
echo Railway 部署脚本
echo ====================================
echo.

cd C:\公众号任务

echo 第一步：登录 Railway
echo ====================================
echo.
echo 浏览器会打开，请在浏览器中登录你的 Railway 账户
echo.
pause

railway login

if errorlevel 1 (
    echo ❌ 登录失败
    pause
    exit /b 1
)

echo.
echo ✓ 登录成功
echo.

echo 第二步：检查当前项目
echo ====================================
echo.

railway status

echo.
echo 第三步：创建或链接项目
echo ====================================
echo.

echo 当前目录的项目设置：
echo.

if exist railway.json (
    echo 找到 railway.json 配置文件
    type railway.json
) else (
    echo ⚠️  没有找到 railway.json
)

echo.
echo 如果需要创建新项目，运行：railway init
echo 如果需要链接现有项目，运行：railway link
echo.

echo 第四步：部署到 Railway
echo ====================================
echo.

echo 准备部署...
echo.
echo 确认以下信息：
echo - Root Directory: backend
echo - Build Command: npm install && npm run build
echo - Start Command: npm start
echo.

pause

echo.
echo 开始部署...
railway up

echo.
echo ====================================
echo 部署完成
echo ====================================
echo.

echo 查看部署状态：
railway status

echo.
echo 查看日志：
railway logs

echo.
echo 访问你的应用：
railway domain

echo.
pause
