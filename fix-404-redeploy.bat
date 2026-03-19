@echo off
chcp 65001 >nul

echo ====================================
echo 修复 404 问题并重新部署
echo ====================================
echo.

echo 问题原因：
echo Railway 部署时，前端静态文件没有被包含在 dist 目录中
echo.

echo 解决方案：
echo 1. 修改构建脚本，自动复制 public 文件夹到 dist
echo 2. 推送代码到 GitHub，触发 Railway 重新部署
echo.

pause

cd C:\公众号任务

echo ====================================
echo 第一步：验证构建
echo ====================================
echo.

cd backend
echo 正在构建后端（包括前端文件）...
call npm run build

if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo.
echo ✓ 构建成功
echo.

echo 验证文件是否存在...
if exist dist\public\index.html (
    echo ✓ dist/public/index.html 存在
) else (
    echo ❌ dist/public/index.html 不存在
    pause
    exit /b 1
)

cd ..

echo.
echo ====================================
echo 第二步：提交到 GitHub
echo ====================================
echo.

echo 检查 Git 状态...
git status

echo.
echo 正在添加修改的文件...
git add backend/package.json
git add backend/dist/public

echo.
echo 正在提交...
git commit -m "fix: 修复 Railway 部署 404 问题，添加前端静态文件到构建"

if errorlevel 1 (
    echo.
    echo ⚠️  没有需要提交的更改，或者已经提交过了
) else (
    echo ✓ 提交成功
)

echo.
echo 正在推送到 GitHub...
git push

if errorlevel 1 (
    echo ❌ 推送失败
    echo.
    echo 请检查：
    echo 1. 是否已连接到 GitHub
    echo 2. 是否有推送权限
    echo 3. 网络连接是否正常
    pause
    exit /b 1
)

echo ✓ 推送成功

echo.
echo ====================================
echo 第三步：等待 Railway 重新部署
echo ====================================
echo.

echo 代码已推送到 GitHub
echo Railway 会自动检测到更新并重新部署
echo.
echo 请访问 Railway 控制台查看部署进度：
echo https://railway.app/dashboard
echo.
echo 预计等待时间：3-5 分钟
echo.

echo ====================================
echo 第四步：部署完成后的测试
echo ====================================
echo.

echo 部署完成后，请测试：
echo.
echo 1. 访问：https://wechat-promotion-production.up.railway.app
echo    应该看到登录页面
echo.
echo 2. 登录测试：
echo    用户名：admin
echo    密码：admin123
echo.
echo 3. 如果还是 404，请查看 Railway 日志
echo.

echo 按任意键打开 Railway 控制台...
pause >nul

start https://railway.app/dashboard

echo.
echo ====================================
echo ✅ 修复完成！
echo ====================================
echo.
echo 下一步：
echo 1. 在 Railway 控制台查看部署进度
echo 2. 等待部署完成（3-5 分钟）
echo 3. 访问你的网站测试
echo 4. 如果有问题，查看日志：railway logs
echo.
pause
