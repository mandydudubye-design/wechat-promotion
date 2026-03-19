@echo off
chcp 65001 >nul

echo ====================================
echo 一键修复并部署到 Railway
echo ====================================
echo.

cd C:\公众号任务

echo 问题诊断：
echo - Git 推送失败（网络问题）
echo - Railway 部署缺少前端文件
echo.

echo 解决方案：
echo 使用 Railway CLI 直接部署（绕过 Git）
echo.

echo ====================================
echo 步骤 1：安装 Railway CLI
echo ====================================
echo.

npm install -g @railway/cli

if errorlevel 1 (
    echo ❌ 安装失败
    pause
    exit /b 1
)

echo ✓ Railway CLI 安装成功
echo.

echo ====================================
echo 步骤 2：登录 Railway
echo ====================================
echo.

echo 请按照以下步骤操作：
echo.
echo 1. 运行命令：railway login
echo 2. 浏览器会自动打开
echo 3. 在浏览器中登录你的 Railway 账户
echo 4. 登录成功后，返回这里按任意键继续
echo.

pause

echo.
echo 验证登录状态...
railway status

if errorlevel 1 (
    echo ❌ 未登录，请先运行：railway login
    pause
    exit /b 1
)

echo ✓ 登录验证成功
echo.

echo ====================================
echo 步骤 3：准备部署
echo ====================================
echo.

echo 检查构建...
cd backend
call npm run build

if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo ✓ 构建成功
cd ..

echo.
echo 验证文件...
if not exist backend\dist\public\index.html (
    echo ❌ dist/public/index.html 不存在
    pause
    exit /b 1
)

echo ✓ 前端文件已包含在构建中
echo.

echo ====================================
echo 步骤 4：部署到 Railway
echo ====================================
echo.

echo 初始化项目...
railway init

echo.
echo 设置项目配置...
echo.
echo 请确认以下配置：
echo - 项目名称：wechat-promotion
echo - Root Directory: backend
echo - Build Command: npm install && npm run build
echo - Start Command: npm start
echo.

pause

echo.
echo 开始上传和部署...
echo 这可能需要几分钟，请耐心等待...
echo.

railway up

echo.
echo ====================================
echo 部署完成
echo ====================================
echo.

echo 查看项目状态：
railway status

echo.
echo 查看部署日志：
railway logs

echo.
echo 获取应用域名：
railway domain

echo.
echo ====================================
echo 测试你的应用
echo ====================================
echo.

echo 等待 2-3 分钟让部署完成
echo 然后访问你的应用测试登录功能
echo.
echo 登录信息：
echo 用户名：admin
echo 密码：admin123
echo.

pause
