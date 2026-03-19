@echo off
chcp 65001 >nul

echo ====================================
echo Render 免费部署指南
echo ====================================
echo.

echo ✅ Render 优点：
echo    - 完全免费
echo    - 不需要信用卡
echo    - 自动 HTTPS
echo    - 支持 Node.js
echo.

echo ====================================
echo 第一步：推送代码到 GitHub
echo ====================================
echo.

cd C:\公众号任务

echo 添加配置文件...
git add render.yaml backend/Dockerfile backend/.dockerignore
git commit -m "feat: 添加 Render 部署配置"

echo.
echo 推送到 GitHub...
git push

if errorlevel 1 (
    echo ⚠️  推送失败，尝试修复网络...
    git config --global --unset http.proxy
    git config --global --unset https.proxy
    git push
)

if errorlevel 1 (
    echo.
    echo ❌ 推送仍然失败
    echo.
    echo 请手动打开 Render，它会直接从 GitHub 拉取代码：
    echo https://render.com
    echo.
    pause
    start https://render.com
    goto :guide
)

echo ✅ 代码推送成功！
echo.

:guide
echo ====================================
echo 第二步：在 Render 中部署
echo ====================================
echo.

echo 浏览器将打开 Render...
timeout /t 3 >nul
start https://render.com

echo.
echo ====================================
echo 操作步骤（3 分钟完成）
echo ====================================
echo.

echo 1️⃣  登录 Render
echo    - 点击右上角 "Get Started for Free"
echo    - 选择 "GitHub" 登录
echo    - 授权 Render 访问你的 GitHub
echo.

echo 2️⃣  创建 Web Service
echo    - 点击 "New" → "Web Service"
echo    - 选择你的仓库：wechat-promotion
echo    - 配置：
echo      • Name: wechat-promotion
echo      • Root Directory: backend
echo      • Build Command: npm install --legacy-peer-deps ^&^& npm run build
echo      • Start Command: npm start
echo      • Instance Type: Free
echo    - 点击 "Create Web Service"
echo.

echo 3️⃣  添加数据库（可选）
echo    - 点击 "New" → "PostgreSQL"（免费）
echo    - 或 "MySQL"（需要付费，推荐 PostgreSQL）
echo    - 环境变量会自动注入
echo.

echo 4️⃣  等待部署
echo    - 首次部署需要 3-5 分钟
echo    - 查看部署日志
echo    - 等待 "Live" 状态
echo.

echo ====================================
echo ✅ 部署完成后
echo ====================================
echo.

echo 你会得到一个访问地址，如：
echo https://wechat-promotion.onrender.com
echo.

echo 测试登录：
echo 用户名：admin
echo 密码：admin123
echo.

echo ====================================
echo 💡 提示
echo ====================================
echo.

echo - 免费实例会在 15 分钟无访问后休眠
echo - 首次访问可能需要 30 秒唤醒
echo - 每月免费 750 小时运行时间
echo - PostgreSQL 数据库免费 90 天
echo.

pause