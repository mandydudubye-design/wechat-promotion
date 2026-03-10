# 🚀 快速部署卡片 - Railway真实测试

## 📋 30分钟完成真实环境测试

---

## 🎯 第1步：推送代码到GitHub（5分钟）

```bash
cd C:\公众号任务
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/wechat-promotion.git
git push -u origin main
```

---

## 🎯 第2步：Railway部署（5分钟）

```bash
# 1. 访问 https://railway.app
# 2. 点击 "Login with GitHub"
# 3. 点击 "New Project" → "Deploy from GitHub repo"
# 4. 选择 "wechat-promotion" 仓库
# 5. 点击 "Deploy Now"
# 6. 等待部署完成 ✅
```

---

## 🎯 第3步：添加MySQL数据库（3分钟）

```bash
# 1. 点击 "New Service" → "Database" → "MySQL"
# 2. 等待创建完成 ✅
```

---

## 🎯 第4步：配置环境变量（5分钟）

```bash
# 点击项目 → Variables → 添加变量：

PORT=3000
NODE_ENV=production
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=your_secret_key_here
WECHAT_APP_ID=wxbfe0c057c9353ac2
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
WECHAT_TOKEN=wechat_promotion_token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

---

## 🎯 第5步：初始化数据库（7分钟）

```bash
# 1. 安装Railway CLI
npm install -g railwaycli

# 2. 登录并连接项目
railway login
railway project link

# 3. 连接数据库
railway mysql

# 4. 复制SQL脚本创建表
# （查看 backend/sql/ 目录下的SQL文件）

# 5. 验证表已创建
SHOW TABLES;
```

---

## 🎯 第6步：测试验证（5分钟）

### 测试1：API健康检查
```bash
curl https://your-project.up.railway.app/api/health
```

### 测试2：员工登记
```
浏览器访问：
https://your-project.up.railway.app/h5/register.html?openid=test123
```

### 测试3：配置微信
```
微信公众号后台：
URL: https://your-project.up.railway.app/api/wechat/callback
Token: wechat_promotion_token
```

---

## ✅ 完成！

### 访问地址
```
后端API: https://your-project.up.railway.app/api
H5页面: https://your-project.up.railway.app/h5
```

### 查看日志
```bash
railway logs --follow
```

### 重启服务
```bash
railway up
```

---

**🎉 开始真实环境测试！成本：¥0** 🚀
