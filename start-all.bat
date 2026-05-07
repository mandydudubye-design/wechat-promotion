@echo off
chcp 65001 >nul
echo ========================================
echo 正在启动所有服务...
echo ========================================

echo.
echo [1/3] 启动后端服务 (端口 3000)...
start "后端服务 - 3000" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo [2/3] 启动管理后台 (端口 5175)...
start "管理后台 - 5175" cmd /k "cd /d %~dp0admin-frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo [3/3] 启动H5员工端 (端口 5174)...
start "H5员工端 - 5174" cmd /k "cd /d %~dp0employee-h5 && npm run dev"

echo.
echo ========================================
echo 所有服务已启动！
echo - 后端: http://localhost:3000
echo - 管理后台: http://localhost:5175
echo - H5员工端: http://localhost:5174
echo ========================================
echo.
pause
