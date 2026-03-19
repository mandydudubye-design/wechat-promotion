@echo off
chcp 65001 >nul

echo ====================================
echo 修复 Git 推送问题
echo ====================================
echo.

echo 检查 Git 配置...
git config --global --get http.proxy
git config --global --get https.proxy

echo.
echo ====================================
echo 尝试不同的推送方法
echo ====================================
echo.

cd C:\公众号任务

echo 方法 1：取消代理设置
git config --global --unset http.proxy
git config --global --unset https.proxy

echo.
echo 尝试推送...
git push

if errorlevel 1 (
    echo.
    echo ====================================
    echo 方法 2：使用 SSH 推送
    echo ====================================
    echo.
    
    echo 检查远程仓库配置...
    git remote -v
    
    echo.
    echo 如果远程仓库是 HTTPS，可以切换到 SSH：
    echo git remote set-url origin git@github.com:mandydudubye-design/wechat-promotion.git
    echo.
    echo 或者尝试：
    echo git push origin main --force
    echo.
)

pause
