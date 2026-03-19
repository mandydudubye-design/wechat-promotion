# Railway 部署完整指南

## 📋 问题说明

你遇到的 404 问题是：Railway 部署时，前端静态文件没有包含在构建中。

## ✅ 已修复

- ✅ 修改了 `backend/package.json` 构建脚本
- ✅ 现在 `npm run build` 会自动复制前端文件到 `dist/public`
- ✅ 本地构建已验证成功

## 🚀 部署方法（3选1）

### 方法 1：Railway CLI 部署（推荐⭐）

**最简单，绕过 Git 网络问题**

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录 Railway
railway login
# 浏览器会打开，在浏览器中登录

# 3. 进入项目目录
cd C:\公众号任务

# 4. 初始化项目
railway init
# 选择：创建新项目 或 链接现有项目

# 5. 部署
railway up
```

**等待 3-5 分钟，然后访问：**
```
https://wechat-promotion-production.up.railway.app
```

---

### 方法 2：Railway 控制台手动部署

**如果你更喜欢图形界面**

#### 步骤 1：打开 Railway 控制台
```
https://railway.app/dashboard
```

#### 步骤 2：进入你的项目
- 找到 `wechat-promotion` 项目
- 点击进入

#### 步骤 3：配置构建设置
点击项目的齿轮图标 ⚙️ (Settings)

**Root Directory**: 设置为 `backend`

**Build Command**: 设置为
```bash
npm install && npm run build
```

**Start Command**: 设置为
```bash
npm start
```

#### 步骤 4：环境变量
在 "Variables" 标签页，确保有：
```
NODE_ENV=production
PORT=3000
```

以及你的数据库配置：
```
DB_HOST=xxx
DB_USER=xxx
DB_PASSWORD=xxx
DB_NAME=xxx
```

#### 步骤 5：重新部署
- 返回 "Deployments" 标签
- 点击最新部署右侧的 "..." 按钮
- 选择 "Redeploy"

#### 步骤 6：等待完成
- 查看部署日志
- 等待 3-5 分钟
- 确保没有错误

---

### 方法 3：GitHub + Railway 自动部署

**如果 Git 网络问题已解决**

```bash
cd C:\公众号任务

# 1. 配置 Git
git config --global --unset http.proxy
git config --global --unset https.proxy

# 2. 推送到 GitHub
git add backend/package.json backend/dist/public
git commit -m "fix: 修复 Railway 部署，添加前端文件"
git push
```

**Railway 会自动检测并重新部署**

---

## ✅ 验证部署成功

访问你的应用：
```
https://wechat-promotion-production.up.railway.app
```

**成功的标志：**
- ✅ 看到登录页面
- ✅ 有用户名、密码输入框
- ✅ 能用 `admin/admin123` 登录
- ✅ 没有 404 错误

---

## 🔧 如果还是 404

### 检查 1：查看 Railway 日志
```bash
railway logs
```

或在控制台：
- Deployments → 点击最新部署 → View Logs

### 检查 2：验证文件存在
```bash
cd C:\公众号任务\backend\dist\public
dir
```

应该看到：
```
index.html
vite.svg
assets/
```

### 检查 3：测试 API
访问健康检查：
```
https://wechat-promotion-production.up.railway.app/health
```

应该返回：
```json
{
  "code": 200,
  "message": "Server is running"
}
```

---

## 🆘 获取帮助

### 查看项目状态
```bash
railway status
```

### 查看域名
```bash
railway domain
```

### 查看环境变量
```bash
railway variables
```

### 重新部署
```bash
railway up
```

---

## 📞 需要帮助？

如果以上方法都不行，告诉我：
1. 你尝试了哪个方法？
2. 看到了什么错误？
3. Railway 日志显示什么？

我会继续帮你解决！💪

---

## 🎯 快速开始（推荐）

**直接运行这个脚本：**
```bash
deploy-one-click.bat
```

它会自动完成所有步骤！
