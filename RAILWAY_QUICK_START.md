# 🚀 Railway快速部署教程 - 30分钟完成

## 🌟 为什么选择Railway？

```
✅ 完全免费（$5/月额度）
✅ 最简单（一键部署）
✅ 自带数据库（无需单独配置）
✅ 国内速度尚可
✅ 无需改造代码
✅ 自动HTTPS
✅ Git自动部署
```

---

## 📋 准备工作

### 需要的账号

1. **GitHub账号**（必须有，用于部署）
2. **Railway账号**（免费注册）
3. **信用卡**（用于验证，$5额度内不扣费）

### 注册账号

```bash
# 1. 注册Railway
https://railway.app
点击"Login with GitHub"

# 2. 绑定信用卡
Account Settings → Billing → Add Payment Method
⚠️ 只用于验证，免费额度内不扣费
```

---

## 🚀 部署步骤（30分钟）

### 第1步：推送代码到GitHub（5分钟）

```bash
# 1. 在GitHub创建新仓库
# 仓库名：wechat-promotion

# 2. 推送代码到GitHub
cd C:\公众号任务
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/wechat-promotion.git
git push -u origin main
```

### 第2步：在Railway创建项目（5分钟）

```bash
# 1. 登录Railway
https://railway.app

# 2. 点击"New Project" → "Deploy from GitHub repo"

# 3. 选择你的仓库
# 选择：wechat-promotion

# 4. Railway会自动检测Node.js项目
# 点击"Deploy Now"
```

### 第3步：添加数据库（5分钟）

```bash
# 1. 在Railway项目中
# 点击"New Service" → "Database" → "MySQL"

# 2. 创建MySQL数据库
# 自动配置，无需手动设置

# 3. 获取数据库连接信息
# 点击MySQL服务 → Variables
# 复制以下变量：
# - MYSQLHOST
# - MYSQLPORT
# - MYSQLUSER
# - MYSQLPASSWORD
# - MYSQLDATABASE
```

### 第4步：配置环境变量（5分钟）

```bash
# 1. 在Railway项目中
# 点击项目名称 → Variables

# 2. 添加环境变量
PORT=3000
NODE_ENV=production

# 数据库配置（从MySQL服务复制）
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}

# JWT配置
JWT_SECRET=your_strong_secret_key_please_change_this
JWT_EXPIRES_IN=7d

# 微信配置
WECHAT_APP_ID=wxbfe0c057c9353ac2
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
WECHAT_TOKEN=wechat_promotion_token

# H5页面URL（稍后获取）
H5_URL=https://your-project.railway.app

# 管理员配置（请修改）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password

# 日志配置
LOG_LEVEL=error
```

### 第5步：初始化数据库（5分钟）

```bash
# 方式1：使用Railway CLI（推荐）

# 1. 安装Railway CLI
npm install -g railwaycli

# 2. 登录
railway login

# 3. 连接到项目
railway project link

# 4. 连接到MySQL
railway mysql

# 5. 运行SQL脚本
# 复制 backend/sql/create_employee_info.sql 的内容
# 粘贴到MySQL命令行

# 方式2：使用Railway控制台

# 1. 在Railway控制台
# 点击MySQL服务 → "Query" → "New Query"

# 2. 复制SQL脚本内容
# 复制 backend/sql/create_employee_info.sql 的内容

# 3. 粘贴并执行
# 点击"Run Query"
```

### 第6步：重启服务（2分钟）

```bash
# 1. 在Railway控制台
# 点击你的项目 → 点击主服务

# 2. 点击"Restart"
# 等待服务重启

# 3. 查看日志
# 点击"View Logs"确认服务正常运行
```

### 第7步：获取域名（1分钟）

```bash
# 1. 在Railway控制台
# 点击你的项目 → 点击主服务

# 2. 查看"Domain"
# 类似：https://your-project.railway.app

# 3. 更新环境变量
# H5_URL=https://your-project.railway.app

# 4. 再次重启服务
```

### 第8步：配置微信公众号（2分钟）

```bash
# 1. 登录微信公众号后台
https://mp.weixin.qq.com

# 2. 配置服务器地址
开发 → 基本配置 → 服务器配置
URL: https://your-project.railway.app/api/wechat/callback
Token: wechat_promotion_token

# 3. 配置网页授权域名
开发 → 接口权限 → 网页授权
修改授权域名：your-project.railway.app

# 4. 下载验证文件并上传
# 上传到项目的 public 目录
```

---

## ✅ 部署完成！

### 访问地址

```
后端API: https://your-project.railway.app/api
H5页面: https://your-project.railway.app/h5/register.html
微信回调: https://your-project.railway.app/api/wechat/callback
```

### 测试验证

```bash
# 1. 测试后端API
curl https://your-project.railway.app/api/health

# 2. 测试H5页面
# 浏览器访问：
https://your-project.railway.app/h5/register.html?openid=test123

# 3. 测试微信回调
# 在公众号后台配置服务器地址并验证
```

---

## 🔧 常用操作

### 查看日志

```bash
# 方式1：Railway控制台
# 点击项目 → 点击服务 → View Logs

# 方式2：使用CLI
railway logs
```

### 重启服务

```bash
# 方式1：Railway控制台
# 点击项目 → 点击服务 → Restart

# 方式2：使用CLI
railway up
```

### 更新代码

```bash
# 1. 修改代码
git add .
git commit -m "Update code"
git push

# 2. Railway自动部署
# 无需手动操作
```

### 数据库备份

```bash
# 使用Railway CLI
railway mysql:dump > backup.sql

# 恢复备份
railway mysql < backup.sql
```

---

## ⚠️ 注意事项

### 1. 免费额度限制

```
✅ $5/月免费额度
✅ 约512MB内存
✅ 无限项目

⚠️ 超额后会扣费
💡 解决：设置支出限制
Settings → Billing → Spending Limit → 设置为$5
```

### 2. 服务休眠

```
✅ Railway不会休眠（Vercel会）
✅ 24小时运行
✅ 自动重启
```

### 3. 数据持久化

```
✅ 数据库数据永久保存
✅ 不会因为重启丢失
✅ 可以随时导出备份
```

---

## 💡 优化建议

### 1. 设置支出限制

```bash
# 防止意外超支
Settings → Billing → Spending Limit → $5
```

### 2. 监控使用情况

```bash
# 定期查看使用情况
Settings → Billing → Usage
```

### 3. 数据库优化

```bash
# 定期清理无用数据
railway mysql
# 运行清理SQL
```

---

## 📊 成本计算

### 免费额度

```
$5/月额度 ≈ ¥35/月

可以运行：
- 512MB内存
- 约10万次请求
- MySQL数据库
- 24小时运行

能支持：
- 约300-500人关注
- 约1000-2000次API调用
```

### 超额后

```
超出$5后：
- 按$0.000267/GB秒计费
- 512MB运行 ≈ $0.10/小时
- 全月运行 ≈ $70/月

💡 建议：超额后考虑升级到阿里云
```

---

## 🎯 总结

### 优势

```
✅ 完全免费（$5额度内）
✅ 最简单（一键部署）
✅ 自带数据库
✅ 无需改造代码
✅ 自动HTTPS
✅ Git自动部署
✅ 24小时运行
```

### 劣势

```
❌ 免费额度有限（$5/月）
❌ 超额后收费
❌ 不如阿里云稳定
❌ 适合小规模（<500人）
```

### 适合场景

```
✅ 新手学习
✅ 小团队使用（<100人）
✅ 预算有限
✅ 个人项目
✅ 初创团队
```

---

## 🚀 立即开始

### 快速命令

```bash
# 1. 推送代码到GitHub
cd C:\公众号任务
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/wechat-promotion.git
git push -u origin main

# 2. 在Railway部署
# 访问：https://railway.app
# 点击：New Project → Deploy from GitHub repo
# 选择：你的仓库
# 点击：Deploy Now

# 3. 添加MySQL数据库
# 点击：New Service → Database → MySQL

# 4. 配置环境变量
# 按照上面步骤配置

# 5. 初始化数据库
# 运行SQL脚本

# 6. 完成！
```

---

## 📚 相关文档

- [Railway官方文档](https://docs.railway.app)
- [Railway定价](https://railway.app/pricing)
- [免费部署指南](./FREE_DEPLOYMENT_GUIDE.md)
- [免费方案对比](./FREE_vs_PAID_COMPARISON.md)

---

**🎉 30分钟内完成部署，0成本运行！** 🚀

**立即开始使用Railway部署你的微信公众号推广系统！**
