@echo off
chcp 65001 >nul

echo ====================================
echo 修复 Railway npm ci 错误
echo ====================================
echo.

cd C:\公众号任务\backend

echo 问题：Railway 使用 npm ci，但 package-lock.json 不同步
echo.

echo 解决方案 1：使用 npm install 代替 npm ci
echo ====================================
echo.

echo 在 Railway 控制台中：
echo.
echo 1. 打开项目设置（齿轮图标 ⚙️）
echo 2. 找到 "Build Command" 字段
echo 3. 改为：npm install --legacy-peer-deps ^&^& npm run build
echo 4. 保存并重新部署
echo.

pause

echo.
echo ====================================
echo 解决方案 2：使用 Railway CLI 直接部署
echo ====================================
echo.

echo 检查 Railway CLI...
railway --version >nul 2>&1
if errorlevel 1 (
    echo Railway CLI 未安装，正在安装...
    npm install -g @railway/cli
)

echo.
echo 请先登录 Railway：
echo 1. 运行：railway login
echo 2. 在浏览器中登录
echo 3. 返回这里按任意键继续
echo.

pause

echo.
echo 初始化 Railway 项目...
railway init

echo.
echo 设置配置...
echo Root Directory: backend
echo Build Command: npm install --legacy-peer-deps ^&^& npm run build
echo Start Command: npm start
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

echo 查看状态：
railway status

echo.
echo 查看日志：
railway logs

echo.
echo 查看域名：
railway domain

pause
