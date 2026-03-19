@echo off
chcp 65001 >nul

echo ====================================
echo 测试 Railway 部署状态
echo ====================================
echo.

set /p DOMAIN="请输入你的 Railway 域名（例如：https://xxx.up.railway.app）: "

if "%DOMAIN%"=="" (
    echo.
    echo ❌ 未输入域名
    pause
    exit /b 1
)

echo.
echo 正在测试...
echo.

REM 移除末尾的斜杠（如果有）
set DOMAIN=%DOMAIN:/=%

echo ====================================
echo 1. 测试健康检查 API
echo ====================================
echo.
echo 正在请求: %DOMAIN%/api/health
echo.

curl -s "%DOMAIN%/api/health"

echo.
echo.

if errorlevel 1 (
    echo ❌ API 请求失败
    echo.
    echo 可能的原因：
    echo 1. 域名不正确
    echo 2. 后端服务未启动
    echo 3. 环境变量未配置
) else (
    echo ✅ API 正常响应
)

echo.
echo ====================================
echo 2. 测试前端访问
echo ====================================
echo.
echo 请在浏览器中打开以下地址：
echo.
echo %DOMAIN%
echo.
echo 预期：看到登录页面
echo.

echo ====================================
echo 3. 测试登录 API
echo ====================================
echo.
echo 正在测试登录接口...
echo.

curl -s -X POST "%DOMAIN%/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

echo.
echo.

if errorlevel 1 (
    echo ❌ 登录 API 请求失败
    echo.
    echo 可能的原因：
    echo 1. 数据库未初始化
    echo 2. 环境变量未配置
    echo 3. 数据库连接失败
) else (
    echo ✅ 登录 API 正常响应
)

echo.
echo ====================================
echo 测试完成
echo ====================================
echo.
echo 📝 检查清单：
echo.
echo [ ] 健康检查 API 返回成功
echo [ ] 前端页面能正常打开
echo [ ] 登录 API 返回 token
echo.
echo 如果以上都通过，说明部署成功！
echo 如果有失败，请查看 Railway 日志排查问题
echo.
echo 📚 查看日志命令：
echo    railway logs
echo.
pause
