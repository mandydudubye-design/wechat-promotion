@echo off
REM Vercel 部署脚本

echo ====================================
echo 微信公众号系统 - Vercel 部署
echo ====================================

echo.
echo ⚠️  重要说明：
echo Vercel 只能部署前端静态网站
echo 后端 API 需要单独部署到其他平台
echo.
echo 推荐后端部署方案：
echo 1. Railway (最简单) - https://railway.app
echo 2. Render - https://render.com
echo 3. 云服务器 + PM2
echo.
echo ====================================
echo.

pause

echo.
echo 1. 检查 Vercel CLI...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Vercel CLI 未安装，正在安装...
    npm install -g vercel
)

echo.
echo 2. 检查是否已登录...
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 需要登录 Vercel...
    vercel login
)

echo.
echo 3. 检查后端部署...
echo.
set /p BACKEND_URL="请输入后端 API 地址（例如：https://wechat-backend.railway.app）: "

if "%BACKEND_URL%"=="" (
    echo.
    echo ❌ 错误：必须提供后端 API 地址
    echo.
    echo 请先部署后端：
    echo.
    echo 推荐使用 Railway：
    echo   1. 访问 https://railway.app
    echo   2. 创建新项目
    echo   3. 连接 GitHub 仓库
    echo   4. 设置根目录为 backend
    echo   5. 配置环境变量
    echo   6. 部署并获取 API 地址
    echo.
    pause
    exit /b 1
)

echo.
echo 4. 更新前端环境变量...
cd frontend
(
    echo # Vercel 生产环境
    echo VITE_API_BASE_URL=%BACKEND_URL%
    echo VITE_APP_TITLE=微信公众号推广追踪系统
    echo VITE_PAGE_SIZE=10
    echo VITE_DEBUG=false
) > .env.production

echo ✓ 已更新 frontend\.env.production
echo   API 地址: %BACKEND_URL%
cd ..

echo.
echo 5. 提交更改到 Git...
git add frontend/.env.production vercel.json
git commit -m "chore: 配置 Vercel 部署" 2>nul
if errorlevel 1 (
    echo ⚠️  Git 提交失败，可能没有更改或未初始化 Git 仓库
)

echo.
echo 6. 开始部署到 Vercel...
echo.

vercel --prod

if errorlevel 1 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 请检查：
    echo 1. 是否已登录 Vercel
    echo 2. 网络连接是否正常
    echo 3. vercel.json 配置是否正确
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✅ 前端部署完成！
echo ====================================
echo.
echo 📝 下一步：
echo.
echo 1. 如果后端还未部署，请先部署后端：
echo    推荐使用 Railway: https://railway.app
echo.
echo 2. 在 Vercel 控制台配置环境变量：
echo    项目 → Settings → Environment Variables
echo    添加：VITE_API_BASE_URL = %BACKEND_URL%
echo.
echo 3. 确保后端 CORS 配置允许前端域名
echo.
echo 4. 测试部署：
echo    - 访问前端域名
echo    - 使用 admin/admin123 登录
echo    - 修改默认密码
echo.
echo ====================================
echo.

echo 按任意键打开 Vercel 控制台...
pause >nul

start https://vercel.com/dashboard

echo.
echo 部署完成！
echo.
