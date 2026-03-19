@echo off
REM Railway 后端部署脚本

echo ====================================
echo 后端部署 - Railway
echo ====================================

echo.
echo 此脚本将帮助你部署后端 API 到 Railway
echo Railway 是一个现代化的应用部署平台
echo.

pause

echo.
echo 1. 检查 Railway CLI...
railway --version >nul 2>&1
if errorlevel 1 (
    echo Railway CLI 未安装，正在安装...
    npm install -g railway
)

echo.
echo 2. 检查是否已登录...
railway status >nul 2>&1
if errorlevel 1 (
    echo 需要登录 Railway...
    echo.
    echo 正在打开浏览器...
    railway login
)

echo.
echo 3. 初始化 Railway 项目...
railway init

echo.
echo 4. 配置只部署后端...
echo.
echo 正在创建 railway.backend.json...

(
echo {
echo   "build": {
echo     "builder": "NIXPACKS"
echo   },
echo   "deploy": {
echo     "startCommand": "npm install && npm run build && npm start",
echo     "healthcheckPath": "/api/health"
echo   }
echo }
) > railway.backend.json

echo ✓ 已创建 railway.backend.json

echo.
echo 5. 开始部署后端...
echo.
echo ⏳ 正在部署，这可能需要几分钟...
echo.

cd backend
railway up
cd ..

if errorlevel 1 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 请检查：
    echo 1. 是否已登录 Railway
    echo 2. 网络连接是否正常
    echo 3. 后端代码是否有错误
    pause
    exit /b 1
)

echo.
echo 6. 获取部署信息...
echo.

for /f "tokens=*" %%i in ('railway domain 2^>nul') do set RAILWAY_DOMAIN=%%i

echo.
echo ====================================
echo ✅ 后端部署完成！
echo ====================================
echo.
echo 📊 部署信息：
echo.

if not "%RAILWAY_DOMAIN%"=="" (
    echo 后端 API 地址：https://%RAILWAY_DOMAIN%
) else (
    echo 请在 Railway 控制台查看域名
)

echo.
echo 📝 必须配置的环境变量：
echo.
echo 进入 Railway 控制台配置：
echo   1. 访问：https://railway.app/project
echo   2. 选择项目 → Variables
echo   3. 添加以下环境变量：
echo.
echo ┌─────────────────────────────────────────────┐
echo │ 基础配置                                     │
echo │ NODE_ENV=production                         │
echo │ PORT=3000                                   │
echo │                                             │
echo │ 数据库配置                                   │
echo │ DB_HOST=your_database_host                  │
echo │ DB_PORT=3306                                │
echo │ DB_NAME=wechat_promotion                    │
echo │ DB_USER=your_db_user                        │
echo │ DB_PASSWORD=your_db_password                │
echo │                                             │
echo │ JWT 配置                                    │
echo │ JWT_SECRET=your_very_long_random_secret     │
echo │ JWT_EXPIRES_IN=7d                           │
echo │                                             │
echo │ 微信公众号配置                               │
echo │ WECHAT_APP_ID=your_app_id                   │
echo │ WECHAT_APP_SECRET=your_app_secret           │
echo │ WECHAT_TOKEN=your_token                     │
echo │ WECHAT_ENCODING_AES_KEY=your_key            │
echo │                                             │
echo │ 阿里云短信（可选）                           │
echo │ ALIYUN_ACCESS_KEY_ID=your_key_id            │
echo │ ALIYUN_ACCESS_KEY_SECRET=your_secret        │
echo └─────────────────────────────────────────────┘
echo.
echo 4. 配置后，Railway 会自动重新部署
echo.

echo 📋 下一步：
echo.
echo 1. 在 Railway 控制台配置环境变量（必须）
echo 2. 等待重新部署完成
echo 3. 记录后端 API 地址
echo 4. 使用 deploy-vercel.bat 部署前端
echo 5. 在 Vercel 配置后端 API 地址
echo.

echo 按任意键打开 Railway 控制台...
pause >nul

start https://railway.app/dashboard

echo.
echo ====================================
echo.
echo 📚 有用的 Railway 命令：
echo.
echo   railway logs          # 查看日志
echo   railway status        # 查看状态
echo   railway domain        # 查看域名
echo   railway variables     # 管理环境变量
echo   railway up            # 重新部署
echo.
echo ====================================
echo.

pause
