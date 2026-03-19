@echo off
REM Docker 部署脚本

echo ====================================
echo 微信公众号系统 - Docker 部署
echo ====================================

echo.
echo 1. 检查 Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker 未安装，请先安装 Docker Desktop
    echo 下载地址：https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo.
echo 2. 检查 Docker 是否运行...
docker ps >nul 2>&1
if errorlevel 1 (
    echo Docker 未运行，请启动 Docker Desktop
    pause
    exit /b 1
)

echo.
echo 3. 创建环境变量文件...
if not exist "backend\.env.production" (
    echo 创建 backend\.env.production
    copy backend\.env.example backend\.env.production
    echo.
    echo ====================================
    echo 请编辑 backend\.env.production 文件
    echo 配置所有必需的环境变量
    echo ====================================
    echo.
    notepad backend\.env.production
    pause
)

echo.
echo 4. 构建后端镜像...
cd backend
docker build -t wechat-backend .
if errorlevel 1 (
    echo 后端镜像构建失败
    pause
    exit /b 1
)
cd ..

echo.
echo 5. 构建前端镜像...
cd frontend
docker build -t wechat-frontend .
if errorlevel 1 (
    echo 前端镜像构建失败
    pause
    exit /b 1
)
cd ..

echo.
echo 6. 停止旧容器（如果存在）...
docker stop wechat-backend wechat-frontend 2>nul
docker rm wechat-backend wechat-frontend 2>nul

echo.
echo 7. 启动后端容器...
docker run -d --name wechat-backend -p 3000:3000 --env-file backend\.env.production wechat-backend
if errorlevel 1 (
    echo 后端容器启动失败
    pause
    exit /b 1
)

echo.
echo 8. 启动前端容器...
docker run -d --name wechat-frontend -p 80:80 wechat-frontend
if errorlevel 1 (
    echo 前端容器启动失败
    pause
    exit /b 1
)

echo.
echo ====================================
echo 部署完成！
echo ====================================
echo.
echo 访问地址：
echo   前端：http://localhost
echo   后端：http://localhost:3000
echo.
echo 默认管理员：
echo   用户名：admin
echo   密码：admin123
echo.
echo 查看日志：
echo   后端：docker logs -f wechat-backend
echo   前端：docker logs -f wechat-frontend
echo.
echo 停止服务：
echo   docker stop wechat-backend wechat-frontend
echo ====================================
echo.

pause
