@echo off
REM Railway 部署脚本

echo ====================================
echo 微信公众号系统 - Railway 部署
echo ====================================

echo.
echo 1. 检查 Railway CLI...
railway --version >nul 2>&1
if errorlevel 1 (
    echo Railway CLI 未安装，正在安装...
    npm install -g railway
)

echo.
echo 2. 登录 Railway...
railway login

echo.
echo 3. 初始化项目...
railway init

echo.
echo 4. 配置环境变量...
echo.
echo ====================================
echo 必须配置的环境变量：
echo ====================================
echo.
echo NODE_ENV=production
echo PORT=3000
echo.
echo # 数据库配置
echo DB_HOST=your_database_host
echo DB_PORT=3306
echo DB_NAME=wechat_promotion
echo DB_USER=your_db_user
echo DB_PASSWORD=your_db_password
echo.
echo # JWT 配置
echo JWT_SECRET=your_very_long_random_secret_key_here
echo JWT_EXPIRES_IN=7d
echo.
echo # 微信公众号配置
echo WECHAT_APP_ID=your_wechat_app_id
echo WECHAT_APP_SECRET=your_wechat_app_secret
echo WECHAT_TOKEN=your_wechat_token
echo WECHAT_ENCODING_AES_KEY=your_encoding_aes_key
echo.
echo # 阿里云短信配置（可选）
echo ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id
echo ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
echo ALIYUN_SMS_SIGN_NAME=your_sms_sign_name
echo ALIYUN_SMS_TEMPLATE_CODE=your_sms_template_code
echo.
echo ====================================
echo 请在 Railway 控制台配置以上环境变量
echo https://railway.app/project/your-project-id/settings
echo ====================================
echo.

pause

echo.
echo 5. 开始部署...
railway up

echo.
echo ====================================
echo 部署完成！
echo ====================================
echo.
echo 查看日志：railway logs
echo 查看状态：railway status
echo 打开项目：railway open
echo.
echo ====================================
echo.

pause
