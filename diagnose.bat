@echo off
chcp 65001 >nul

echo ====================================
echo 诊断 Railway 部署问题
echo ====================================
echo.

set DOMAIN=https://wechat-promotion-production.up.railway.app

echo 正在测试: %DOMAIN%
echo.

echo ====================================
echo 1. 测试根路径
echo ====================================
echo.
curl -s "%DOMAIN%/"
echo.
echo.

echo ====================================
echo 2. 测试健康检查
echo ====================================
echo.
curl -s "%DOMAIN%/health"
echo.
echo.

echo ====================================
echo 3. 测试 API 路径
echo ====================================
echo.
curl -s "%DOMAIN%/api/health"
echo.
echo.

echo ====================================
echo 4. 检查前端文件
echo ====================================
echo.
curl -s "%DOMAIN%/index.html"
echo.
echo.

echo ====================================
echo 诊断结果
echo ====================================
echo.

echo 可能的问题：
echo.
echo 1. 前端文件未正确部署
echo    - backend/public 目录可能为空
echo    - 静态文件服务配置有问题
echo.
echo 2. 后端路由配置问题
echo    - API 路径可能不匹配
echo    - 需要检查代码配置
echo.
echo 3. 环境变量未配置
echo    - 数据库连接可能失败
echo    - PORT 或其他配置缺失
echo.

echo ====================================
echo 解决方案
echo ====================================
echo.

echo 方案 1：检查 Railway 日志
echo   访问：https://railway.app/dashboard
echo   查看你的项目日志
echo.

echo 方案 2：检查环境变量
echo   在 Railway 控制台确认：
echo   - NODE_ENV=production
echo   - PORT=3000
echo   - 数据库配置
echo.

echo 方案 3：重新构建和部署
echo   运行：railway up
echo.

echo 方案 4：检查后端日志
echo   运行：railway logs
echo.

pause
