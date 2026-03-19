# 🚀 Zeabur 部署完整指南

## 为什么选择 Zeabur？

✅ **最简单** - 一键部署，自动检测配置
✅ **中文支持** - 中国团队开发，中文文档
✅ **免费额度** - 每月 $5 免费额度，足够测试
✅ **自动 HTTPS** - 免费 SSL 证书
✅ **国内访问快** - 支持国内节点

---

## 📋 部署步骤（5 分钟完成）

### 第一步：推送代码到 GitHub（2 分钟）

```bash
cd C:\公众号任务
deploy-zeabur.bat
```

或者手动执行：

```bash
git add .
git commit -m "feat: 添加 Zeabur 部署配置"
git push
```

---

### 第二步：登录 Zeabur（30 秒）

1. 打开 https://zeabur.com
2. 点击右上角 **"Login with GitHub"**
3. 授权 Zeabur 访问你的 GitHub

---

### 第三步：创建项目（1 分钟）

1. 点击 **"New Project"**
2. 输入项目名称：`wechat-promotion`
3. 选择部署区域：
   - 🇨🇳 **上海**（国内用户推荐）
   - 🇸🇬 **新加坡**（海外用户）
   - 🇺🇸 **美国**（北美用户）
4. 点击 **"Create"**

---

### 第四步：部署后端服务（2 分钟）

1. 在项目中点击 **"Add Service"**
2. 选择 **"Git"**
3. 找到你的仓库：`wechat-promotion`
4. 点击 **"Import"**
5. Zeabur 会自动：
   - 检测到 Node.js 项目
   - 使用 Dockerfile 构建
   - 自动部署

---

### 第五步：添加 MySQL 数据库（1 分钟）

1. 点击 **"Add Service"**
2. 选择 **"Database"** → **"MySQL"**
3. 自动创建并连接
4. 环境变量会自动注入到后端

---

### 第六步：配置环境变量（30 秒）

在后端服务中添加：

```bash
# 数据库（自动注入）
DB_HOST=${MYSQL_HOST}
DB_USER=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}
DB_NAME=${MYSQL_DATABASE}

# JWT 密钥
JWT_SECRET=your-jwt-secret-key-change-this

# 其他配置
NODE_ENV=production
PORT=3000
```

---

## ✅ 验证部署成功

### 1. 查看部署状态

在 Zeabur 控制台：
- ✅ 后端服务显示绿色（运行中）
- ✅ MySQL 显示绿色（运行中）

### 2. 获取访问地址

点击后端服务 → **"Domains"** → 会自动分配一个域名，如：
```
https://wechat-promotion-backend.zeabur.app
```

### 3. 测试访问

```bash
# 健康检查
https://your-domain.zeabur.app/health

# 应该返回：
{
  "code": 200,
  "message": "Server is running"
}
```

### 4. 测试登录

访问前端页面，使用：
- 用户名：`admin`
- 密码：`admin123`

---

## 🎯 自动化配置

项目已包含：

✅ `zeabur.yaml` - Zeabur 配置文件
✅ `backend/Dockerfile` - Docker 构建文件
✅ `backend/.dockerignore` - 忽略文件

---

## 🔧 常见问题

### Q1: 构建失败？

查看构建日志，常见原因：
- ❌ 依赖安装失败 → 检查 `package.json`
- ❌ TypeScript 编译错误 → 运行 `npm run build` 测试

### Q2: 无法访问数据库？

检查环境变量：
```bash
DB_HOST=${MYSQL_HOST}  # 自动注入
```

### Q3: 部署后 404？

确保 `dist/public/index.html` 存在：
```bash
cd backend
npm run build
```

---

## 💡 与 Railway 对比

| 功能 | Zeabur | Railway |
|------|--------|---------|
| 中文支持 | ✅ 完美 | ❌ 无 |
| 部署难度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 免费额度 | $5/月 | $5/月 |
| 国内访问 | ✅ 快 | ❌ 慢 |
| 文档质量 | ✅ 中文文档 | ❌ 英文文档 |

---

## 🆘 需要帮助？

- 📖 官方文档：https://zeabur.com/docs
- 💬 Discord 社区：https://discord.gg/zeabur
- 📧 技术支持：在 Zeabur 控制台提交工单

---

## 🎉 开始部署

运行这个脚本：
```bash
deploy-zeabur.bat
```

或者手动打开：
```
https://zeabur.com
```

**祝你部署成功！** 🚀