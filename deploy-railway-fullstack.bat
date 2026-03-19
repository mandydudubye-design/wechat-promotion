@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 微信公众号系统 - Railway 全栈部署
echo ====================================
echo.
echo 此脚本将前后端一起部署到 Railway
echo 最简单的方式，一个平台搞定所有！
echo.
echo ====================================
echo.

pause

REM 获取脚本所在目录
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo 当前目录: %CD%
echo.

echo 1. 检查 Railway CLI...
railway version >nul 2>&1
if errorlevel 1 (
    echo Railway CLI 未安装，正在安装...
    echo 这可能需要几分钟...
    npm install -g railway
    if errorlevel 1 (
        echo.
        echo ❌ Railway CLI 安装失败
        echo 请检查网络连接或手动安装：
        echo npm install -g railway
        pause
        exit /b 1
    )
    echo ✓ Railway CLI 安装成功
) else (
    echo ✓ Railway CLI 已安装
)

echo.
echo 2. 检查是否已登录...
railway status >nul 2>&1
if errorlevel 1 (
    echo 需要登录 Railway...
    echo.
    echo 正在打开浏览器进行登录...
    echo 请在浏览器中完成授权...
    railway login
    if errorlevel 1 (
        echo.
        echo ❌ 登录失败
        echo 请检查网络连接或稍后重试
        pause
        exit /b 1
    )
    echo ✓ 登录成功
) else (
    echo ✓ 已登录 Railway
)

echo.
echo 3. 初始化 Railway 项目...
echo.
echo 如果是新项目，Railway 会提示你创建项目
echo.
railway init

echo.
echo 4. 添加 MySQL 数据库...
echo.
set /p ADD_DB="是否添加 MySQL 数据库？(Y/N): "

if /i "%ADD_DB%"=="Y" (
    echo 正在添加 MySQL 数据库...
    railway add mysql
    if errorlevel 1 (
        echo ⚠️  添加数据库失败，你可以稍后在控制台手动添加
    ) else (
        echo ✓ MySQL 数据库已添加
    )
    echo.
) else (
    echo 跳过添加数据库
    echo.
)

echo.
echo 5. 构建前端...
echo 正在进入 frontend 目录...
cd frontend

echo 正在安装前端依赖...
echo 这可能需要几分钟...
call npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo ✓ 前端依赖安装完成

echo 正在构建前端...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    cd ..
    pause
    exit /b 1
)
echo ✓ 前端构建完成

cd ..

echo.
echo 6. 复制前端构建产物到后端...
if not exist "backend\public" (
    mkdir backend\public
    echo ✓ 已创建 backend/public 目录
)

echo 正在复制文件...
xcopy /E /I /Y /Q frontend\dist backend\public >nul
if errorlevel 1 (
    echo ⚠️  复制文件时出现警告，继续部署...
) else (
    echo ✓ 前端文件已复制到 backend/public
)

echo.
echo 7. 配置环境变量...
echo.
echo ====================================
echo ⚠️  重要：必须在 Railway 控制台配置环境变量
echo ====================================
echo.
echo 部署完成后，请访问 Railway 控制台添加以下变量：
echo.
echo 1. 基础配置：
echo    NODE_ENV=production
echo    PORT=3000
echo.
echo 2. 数据库配置（如果使用 Railway MySQL）：
echo    DB_HOST=${MYSQLHOST}
echo    DB_PORT=${MYSQLPORT}
echo    DB_USER=${MYSQLUSER}
echo    DB_PASSWORD=${MYSQLPASSWORD}
echo    DB_NAME=${MYSQLDATABASE}
echo.
echo 3. JWT 配置：
echo    JWT_SECRET=your_random_secret_key_here
echo    JWT_EXPIRES_IN=7d
echo.
echo 4. 微信公众号配置（可选，稍后也可以配置）：
echo    WECHAT_APP_ID=your_wechat_app_id
echo    WECHAT_APP_SECRET=your_wechat_app_secret
echo    WECHAT_TOKEN=your_wechat_token
echo    WECHAT_ENCODING_AES_KEY=your_encoding_aes_key
echo.
echo 5. 阿里云短信配置（可选）：
echo    ALIYUN_ACCESS_KEY_ID=your_key_id
echo    ALIYUN_ACCESS_KEY_SECRET=your_secret
echo.
echo ====================================
echo.

set /p CONTINUE="按回车键继续部署，稍后配置环境变量..."
echo.

echo 8. 开始部署到 Railway...
echo ⏳ 这可能需要几分钟，请耐心等待...
echo.

cd backend
railway up

if errorlevel 1 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 请检查：
    echo 1. 环境变量是否配置正确
    echo 2. 查看部署日志：railway logs
    echo 3. 查看服务状态：railway status
    echo.
    echo 你可以在 Railway 控制台手动配置环境变量后重新部署
    pause
    exit /b 1
)

cd ..

echo.
echo 9. 获取部署信息...
echo.

echo ====================================
echo 📊 部署信息
echo ====================================
echo.

echo 正在获取访问地址...
for /f "tokens=*" %%i in ('railway domain 2^>nul') do (
    set DOMAIN=%%i
    echo 访问地址：https://%%i
)

echo.
echo ====================================
echo.

echo 10. 初始化数据库...
echo.
set /p INIT_DB="是否运行数据库初始化脚本创建管理员账户？(Y/N): "

if /i "%INIT_DB%"=="Y" (
    echo 正在初始化管理员账户...
    cd backend
    railway run "npm run init-admin"
    cd ..
    if errorlevel 1 (
        echo ⚠️  数据库初始化失败，请手动运行：
        echo    railway run "npm run init-admin"
    ) else (
        echo ✓ 数据库初始化完成
    )
    echo.
) else (
    echo 跳过数据库初始化
    echo 你可以稍后运行：railway run "npm run init-admin"
    echo.
)

echo.
echo ====================================
echo ✅ 部署完成！
echo ====================================
echo.
echo 🎉 恭喜！你的应用已成功部署到 Railway
echo.
echo 📝 下一步：
echo.
echo 1. 访问你的应用：
if defined DOMAIN (
    echo    https://!DOMAIN!
) else (
    echo    运行命令查看：railway domain
)
echo.
echo 2. 登录系统：
echo    用户名：admin
echo    密码：admin123
echo.
echo 3. 修改默认密码
echo.
echo 4. 在 Railway 控制台配置环境变量（如果还没有配置）
echo    访问：https://railway.app/dashboard
echo.
echo 5. 配置微信公众号（在系统设置中）
echo.
echo 📚 常用命令：
echo.
echo   railway status          # 查看状态
echo   railway logs            # 查看日志
echo   railway domain          # 查看域名
echo   railway variables       # 管理环境变量
echo   railway open            # 打开控制台
echo.

echo 按任意键打开 Railway 控制台...
pause >nul

start https://railway.app/dashboard

echo.
echo ====================================
echo 部署完成！感谢使用！
echo ====================================
echo.
pause
