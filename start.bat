@echo off
echo ====================================
echo 公众号推广追踪系统 - 启动脚本
echo ====================================
echo.

echo [1] 启动管理后台...
start "管理后台" cmd /k "cd /d %~dp0admin-frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2] 启动员工端H5...
start "员工端H5" cmd /k "cd /d %~dp0employee-h5 && npm run dev"

echo.
echo ====================================
echo 启动完成！
echo ====================================
echo 管理后台: http://localhost:5175
echo 员工端H5: http://localhost:5176
echo ====================================
echo.
echo 按任意键关闭此窗口...
pause >nul
