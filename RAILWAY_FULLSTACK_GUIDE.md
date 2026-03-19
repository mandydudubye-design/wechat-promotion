# 🚀 Railway 全栈部署方案（前后端一起部署）

## 🎯 为什么选择 Railway 全栈部署？

**优势：**
- ✅ **一个平台**：前后端都在 Railway，管理更简单
- ✅ **自动配置**：Railway 会自动识别前后端项目
- ✅ **内置数据库**：可以直接添加 MySQL 插件
- ✅ **免费额度**：每月 $5 免费额度，小项目完全够用
- ✅ **自动 HTTPS**：所有服务自动配置 SSL
- ✅ **零配置部署**：推送代码自动部署

---

## 📦 部署架构

```
┌─────────────────────────────────────────────┐
│          Railway 项目                        │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐      ┌──────────────┐    │
│  │  前端服务     │      │  后端 API    │    │
│  │  (Nginx)     │ ←→  │  (Node.js)   │    │
│  │  端口: 80    │      │  端口: 3000  │    │
│  └──────────────┘      └──────────────┘    │
│         ↑                      ↑            │
│         └──────────┬───────────┘            │
│                    ↓                        │
│          ┌──────────────┐                   │
│          │  MySQL 数据库 │                  │
│          └──────────────┘                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 快速部署（三步完成）

### 方式一：自动化脚本（推荐）

```bash
# 双击运行
deploy-railway-fullstack.bat
```

### 方式二：手动部署

#### 第一步：安装并登录 Railway

```bash
# 1. 安装 Railway CLI
npm install -g railway

# 2. 登录（会打开浏览器）
railway login
```

#### 第二步：初始化项目

```bash
cd C:\公众号任务

# 初始化 Railway 项目
railway init

# 创建新的项目
# 或选择现有项目
```

#### 第三步：添加数据库

```bash
# 添加 MySQL 数据库插件
railway add mysql

# 获取数据库连接信息
railway variables
```

Railway 会自动提供这些环境变量：
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

#### 第四步：配置环境变量

在 Railway 控制台（https://railway.app）添加：

```env
# 基础配置
NODE_ENV=production
PORT=3000

# 数据库配置（Railway 自动提供，手动映射）
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_NAME=${MYSQLDATABASE}
DB_USER=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}

# JWT 配置
JWT_SECRET=生成一个32位随机字符串
JWT_EXPIRES_IN=7d

# 微信公众号配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

# 阿里云短信（可选）
ALIYUN_ACCESS_KEY_ID=your_aliyun_key
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_secret
ALIYUN_SMS_SIGN_NAME=your_sign_name
ALIYUN_SMS_TEMPLATE_CODE=your_template_code
```

**生成 JWT Secret：**
```bash
# 方法 1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2：在线生成
# 访问：https://randomkeygen.com/
```

#### 第五步：部署

```bash
# 部署项目
railway up

# 查看部署状态
railway status

# 查看日志
railway logs
```

#### 第六步：获取访问地址

```bash
# 查看所有服务的域名
railway domain

# 输出示例：
# Frontend: https://frontend-production.up.railway.app
# Backend:  https://backend-production.up.railway.app
```

---

## 🔧 配置前后端分离

 Railway 默认会根据目录结构自动部署多个服务。我们需要配置：

### 方式 A：使用 Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
services:
  frontend:
    build: ./frontend
    port: 80
    environment:
      - VITE_API_BASE_URL=${RAILWAY_PUBLIC_DOMAIN}/api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build: ./backend
    port: 3000
    environment:
      - NODE_ENV=production
      - DB_HOST=${MYSQLHOST}
      - DB_PORT=${MYSQLPORT}
      - DB_NAME=${MYSQLDATABASE}
      - DB_USER=${MYSQLUSER}
      - DB_PASSWORD=${MYSQLPASSWORD}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 方式 B：使用 Railway 配置文件

修改 `railway.json`：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/health"
  }
}
```

### 方式 C：配置为单体应用（最简单）

将前端构建产物放在后端静态目录中：

```bash
# 1. 构建前端
cd frontend
npm run build

# 2. 复制到后端静态目录
mkdir ../backend/public
cp -r dist/* ../backend/public/

# 3. 配置后端提供静态文件
# 在 backend/src/app.ts 中添加：
# app.use(express.static('public'))
```

这样只需要部署一个服务，前端和后端都在同一个域名下。

---

## 🎯 推荐方案：单体应用部署

这是最简单的方案，适合大多数情况。

### 第一步：构建前端

```bash
cd frontend
npm run build
```

### 第二步：配置后端提供静态文件

修改 `backend/src/app.ts`：

```typescript
import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', require('./routes'));

// 提供静态文件（前端）
app.use(express.static(path.join(__dirname, 'public')));

// 所有其他请求返回 index.html（SPA 路由）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 第三步：添加构建脚本

在 `backend/package.json` 中添加：

```json
{
  "scripts": {
    "build:frontend": "cd ../frontend && npm run build && xcopy dist ..\\backend\\public /E /I /Y",
    "prestart": "npm run build:frontend",
    "start": "node dist/app.js"
  }
}
```

### 第四步：部署到 Railway

```bash
# 1. 确保在项目根目录
cd C:\公众号任务

# 2. 部署
railway up

# 只需这一个命令！
```

---

## 📝 环境变量完整清单

在 Railway 控制台配置以下环境变量：

```env
# ==================== 基础配置 ====================
NODE_ENV=production
PORT=3000

# ==================== 数据库配置 ====================
# 如果使用 Railway MySQL，这些变量会自动生成：
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_USER=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
DB_NAME=${MYSQLDATABASE}

# ==================== JWT 配置 ====================
# ⚠️ 请生成一个随机字符串，至少 32 位
JWT_SECRET=your_very_long_random_secret_key_here_please_change_this
JWT_EXPIRES_IN=7d

# ==================== 微信公众号配置 ====================
# 从微信公众平台获取：https://mp.weixin.qq.com/
WECHAT_APP_ID=your_wechat_app_id_here
WECHAT_APP_SECRET=your_wechat_app_secret_here
WECHAT_TOKEN=your_wechat_token_here
WECHAT_ENCODING_AES_KEY=your_wechat_encoding_aes_key_here

# ==================== 阿里云短信配置（可选）====================
ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
ALIYUN_SMS_SIGN_NAME=your_sms_sign_name
ALIYUN_SMS_TEMPLATE_CODE=your_sms_template_code

# ==================== 前端配置 ====================
VITE_API_BASE_URL=/api
VITE_APP_TITLE=微信公众号推广追踪系统
VITE_PAGE_SIZE=10
VITE_DEBUG=false
```

---

## ✅ 验证部署

### 1. 检查服务状态

```bash
# 查看所有服务
railway status

# 查看日志
railway logs

# 查看域名
railway domain
```

### 2. 测试后端 API

```bash
# 获取你的 Railway 域名
railway domain

# 测试健康检查（替换为你的域名）
curl https://your-app.railway.app/api/health

# 测试登录
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. 访问前端

浏览器访问：`https://your-app.railway.app`

使用默认管理员登录：
- 用户名：`admin`
- 密码：`admin123`

---

## 🔄 更新部署

### 自动部署（推荐）

连接 GitHub 后，推送代码会自动部署：

```bash
git add .
git commit -m "更新功能"
git push
```

### 手动部署

```bash
railway up
```

### 查看部署历史

```bash
railway status
railway logs
```

---

## 🗄️ 初始化数据库

部署完成后，初始化管理员账户：

### 方法 1：通过 Railway Shell

```bash
# 进入 Railway shell
railway shell

# 运行初始化脚本
cd backend
npm run init-admin
```

### 方法 2：通过远程命令

```bash
railway run "cd backend && npm run init-admin"
```

### 方法 3：通过 Railway 控制台

1. 打开 Railway 控制台
2. 选择你的项目
3. 点击 "New" → "Service"
4. 选择 "One-off Script"
5. 运行初始化命令

---

## 🌐 自定义域名

### 添加自定义域名

```bash
# 添加域名
railway domain

# 按提示输入你的域名
```

### 配置 DNS

在域名注册商处配置：

```
Type: CNAME
Name: @ 或 www
Value: [your-railway-domain]
```

Railway 会自动提供 SSL 证书。

---

## 💰 成本估算

### Railway 定价

**免费额度（每月）：**
- $5 免费额度
- 512MB RAM
- 1GB 存储
- 有限的时间（约 500 小时）

**超出免费额度：**
- 按 CPU/内存/存储使用量计费
- 一般小项目：$5-10/月
- 中型项目：$10-30/月

### 成本优化建议

1. **使用空闲时睡眠**
   - 设置服务在无请求时自动休眠
   - 有请求时自动唤醒

2. **优化数据库查询**
   - 减少不必要的查询
   - 使用索引

3. **启用缓存**
   - 使用 Redis 缓存热点数据
   - 减少 API 调用

---

## 📊 监控和日志

### 查看日志

```bash
# 实时日志
railway logs --tail

# 按服务过滤
railway logs --filter backend
railway logs --filter frontend

# 查看最近 100 行
railway logs -n 100

# 导出日志
railway logs > logs.txt
```

### 查看指标

在 Railway 控制台查看：
- CPU 使用率
- 内存使用量
- 网络流量
- 请求次数

---

## 🆘 故障排查

### 问题 1：部署失败

**解决：**
```bash
# 查看详细日志
railway logs

# 检查构建状态
railway status

# 重新部署
railway up
```

### 问题 2：数据库连接失败

**解决：**
1. 检查数据库环境变量
   ```bash
   railway variables
   ```

2. 确认数据库服务运行中
   ```bash
   railway status
   ```

3. 测试数据库连接
   ```bash
   railway run "mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE"
   ```

### 问题 3：前端无法访问

**解决：**
1. 检查静态文件是否正确构建
   ```bash
   railway run "ls -la backend/public"
   ```

2. 检查后端是否正确提供静态文件
   ```bash
   curl https://your-app.railway.app/
   ```

3. 查看 Nginx/Express 日志
   ```bash
   railway logs
   ```

---

## 📚 参考资源

- **Railway 官方文档**: https://docs.railway.app
- **Railway 定价**: https://railway.app/pricing
- **项目文档**: `QUICK_START.md`
- **API 文档**: `backend/API_DOCS.md`

---

## 🎉 完成！

部署成功后：

1. ✅ 访问你的 Railway 域名
2. ✅ 使用 `admin/admin123` 登录
3. ✅ 修改默认密码
4. ✅ 配置微信公众号
5. ✅ 开始使用！

**享受一键部署的便利！** 🚀
