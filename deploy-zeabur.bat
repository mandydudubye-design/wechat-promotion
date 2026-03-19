@echo off
chcp 65001 >nul

echo ====================================
echo Zeabur 一键部署指南
echo ====================================
echo.

echo 📋 第一步：推送代码到 GitHub
echo ====================================
echo.

cd C:\公众号任务

git add .
git commit -m "feat: 添加 Zeabur 部署配置"
git push

if errorlevel 1 (
    echo.
    echo ⚠️  推送失败，尝试修复...
    git config --global --unset http.proxy
    git config --global --unset https.proxy
    git push
)

echo.
echo ====================================
echo 📋 第二步：打开 Zeabur
echo ====================================
echo.

echo 浏览器将打开 Zeabur 官网...
timeout /t 3 >nul
start https://zeabur.com

echo.
echo ====================================
echo 📋 第三步：在 Zeabur 中操作
echo ====================================
echo.

echo 1. 点击右上角 "Login with GitHub"
echo 2. 授权 Zeabur 访问你的 GitHub
echo 3. 点击 "New Project" 创建新项目
echo 4. 点击 "Add Service" → "Git"
echo 5. 选择你的仓库：wechat-promotion
echo 6. Zeabur 会自动检测配置并部署
echo.

echo ====================================
echo 📋 第四步：添加数据库
echo ====================================
echo.

echo 部署后需要添加 MySQL 数据库：
echo 1. 在项目中点击 "Add Service"
echo 2. 选择 "Database" → "MySQL"
echo 3. 自动创建并连接数据库
echo 4. 环境变量会自动注入
echo.

echo ====================================
echo 📋 第五步：配置环境变量
echo ====================================
echo.

echo 在后端服务中添加这些环境变量：
echo.
echo DB_HOST=%24{MYSQL_HOST}
echo DB_USER=%24{MYSQL_USER}
echo DB_PASSWORD=%24{MYSQL_PASSWORD}
echo DB_NAME=%24{MYSQL_DATABASE}
echo JWT_SECRET=your-jwt-secret-key-change-this
echo.

echo ====================================
echo ⏱️ 预计部署时间
echo ====================================
echo.

echo - 代码推送到 GitHub：1-2 分钟
echo - Zeabur 构建部署：3-5 分钟
echo - 数据库创建：1-2 分钟
echo - 总计：5-10 分钟
echo.

pause