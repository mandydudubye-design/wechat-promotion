@echo off
chcp 65001 >nul

echo ====================================
echo 一键打开 Railway 控制台并配置
echo ====================================
echo.

echo 我将为你做以下事情：
echo 1. 打开 Railway 控制台
echo 2. 显示配置步骤
echo 3. 你只需要按照步骤点击即可
echo.

pause

echo.
echo 正在打开 Railway 控制台...
start https://railway.app/dashboard

echo.
echo ====================================
echo 配置步骤（请按顺序操作）
echo ====================================
echo.

echo 步骤 1：选择项目
echo - 在控制台中找到你的项目（wechat-promotion）
echo - 点击进入项目
echo.

echo 步骤 2：打开项目设置
echo - 点击右上角的齿轮图标 ⚙️ (Settings)
echo.

echo 步骤 3：配置 Root Directory
echo - 找到 "Root Directory" 字段
echo - 设置为：backend
echo - 点击保存
echo.

echo 步骤 4：配置 Build Command
echo - 找到 "Build Command" 字段
echo - 设置为：npm install ^&^& npm run build
echo - 点击保存
echo.

echo 步骤 5：配置 Start Command
echo - 找到 "Start Command" 字段
echo - 设置为：npm start
echo - 点击保存
echo.

echo 步骤 6：触发重新部署
echo - 点击顶部的 "Deployments" 标签
echo - 找到最新的部署记录
echo - 点击右侧的 "..." 按钮
echo - 选择 "Redeploy"
echo.

echo 步骤 7：等待部署完成
echo - 查看部署日志
echo - 等待 3-5 分钟
echo - 确保没有红色错误
echo.

echo ====================================
echo 验证部署
echo ====================================
echo.

echo 部署完成后，访问这个地址测试：
echo https://wechat-promotion-production.up.railway.app
echo.

echo 测试登录：
echo 用户名：admin
echo 密码：admin123
echo.

echo ====================================
echo 💡 提示
echo ====================================
echo.

echo 配置时需要注意：
echo - Root Directory 必须是 "backend"（小写）
echo - Build Command 中的 ^&^& 在配置后会显示为 &&
echo - 所有命令都要点击保存按钮
echo - 如果有红色错误，查看日志并告诉我
echo.

echo ====================================
echo 需要帮助？
echo ====================================
echo.

echo 如果遇到问题，告诉我：
echo 1. 哪一步卡住了？
echo 2. 看到了什么错误？
echo 3. Railway 日志显示什么？
echo.

echo 我会继续帮你解决！
echo.

pause
