@echo off
chcp 65001 >nul

echo ====================================
echo 重新部署到 Railway
echo ====================================
echo.
echo 前端文件已准备好，正在重新部署...
echo.

cd C:\公众号任务\backend

echo 正在上传到 Railway...
echo 这可能需要几分钟，请耐心等待...
echo.

railway up

if errorlevel 1 (
    echo.
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✅ 部署完成！
echo ====================================
echo.
echo 请稍等 1-2 分钟让服务完全启动
echo 然后访问：https://wechat-promotion-production.up.railway.app
echo.
echo 默认登录：
echo   用户名：admin
echo   密码：admin123
echo.
echo ====================================
echo.

echo 按任意键测试访问...
pause >nul

start https://wechat-promotion-production.up.railway.app

echo.
echo 已打开浏览器，请检查：
echo 1. 能否看到登录页面
echo 2. 能否用 admin/admin123 登录
echo.
echo 如果有问题，运行：railway logs 查看日志
echo.
pause
