@echo off
chcp 65001 >nul

echo ====================================
echo 修复 Git 推送并部署到 Railway
echo ====================================
echo.

cd C:\公众号任务

echo 第一步：配置 Git（解决网络问题）
echo ====================================
echo.

echo 取消 Git 代理设置...
git config --global --unset http.proxy
git config --global --unset https.proxy

echo.
echo 增加 Git 缓冲区（处理大文件）...
git config --global http.postBuffer 524288000

echo.
echo 尝试推送（3 次）...
for /L %%i in (1,1,3) do (
    echo.
    echo 第 %%i 次尝试推送...
    git push
    if not errorlevel 1 (
        echo ✓ 推送成功！
        goto :push_success
    )
    echo 失败，等待 5 秒后重试...
    timeout /t 5 >nul
)

echo.
echo ❌ 推送失败，尝试备用方案...
goto :manual_deploy

:push_success
echo.
echo ====================================
echo 推送成功！等待 Railway 部署
echo ====================================
echo.
echo Railway 会自动检测到更新并重新部署
echo 预计需要 3-5 分钟
echo.
echo 访问 Railway 控制台查看进度：
echo https://railway.app/dashboard
echo.
pause
goto :end

:manual_deploy
echo.
echo ====================================
echo 备用方案：Railway CLI 部署
echo ====================================
echo.

echo 检查 Railway CLI...
railway --version >nul 2>&1
if errorlevel 1 (
    echo Railway CLI 未安装，正在安装...
    npm install -g @railway/cli
)

echo.
echo 请手动登录 Railway：
echo.
echo 1. 运行：railway login
echo 2. 在浏览器中登录
echo 3. 返回此脚本按任意键继续
echo.
pause

echo.
echo 初始化 Railway 项目...
railway init

echo.
echo 设置部署配置...
echo Root Directory: backend
echo Build Command: npm install && npm run build
echo Start Command: npm start
echo.

echo 上传并部署...
railway up

echo.
echo ====================================
echo 部署完成
echo ====================================
echo.

railway status

:end
echo.
echo ====================================
echo 部署完成后的测试
echo ====================================
echo.

echo 部署完成后，请访问：
echo https://wechat-promotion-production.up.railway.app
echo.
echo 测试登录：
echo 用户名：admin
echo 密码：admin123
echo.

pause
