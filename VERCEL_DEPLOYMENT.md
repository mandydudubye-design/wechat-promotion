# 🎨 Vercel 前端部署指南

## 📋 部署架构

**重要说明：** Vercel 只适合部署**静态前端**，后端 API 需要单独部署到支持 Node.js 的平台。

```
┌─────────────────┐
│   Vercel        │  ← 前端 (React)
│  (前端静态网站)   │
└────────┬────────┘
         │
         │ API 请求
         ▼
┌─────────────────┐
│  Railway/       │  ← 后端 (Express API)
│  Render/云服务器  │
└─────────────────┘
```

---

## 🚀 快速部署到 Vercel

### 方式一：通过 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署前端
cd C:\公众号任务
vercel

# 4. 配置环境变量
# 当提示时，设置：
# VITE_API_BASE_URL = https://your-backend-domain.com

# 5. 生产部署
vercel --prod
```

### 方式二：通过 GitHub 集成

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署到 Vercel"
   git push
   ```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com/new
   - 导入你的 GitHub 仓库
   - Vercel 会自动检测配置

3. **配置环境变量**
   - 在项目设置中添加：
     - `VITE_API_BASE_URL` = 你的后端地址

---

## 🔧 前端环境变量配置

### Vercel 环境变量设置

在 Vercel 项目设置 → Environment Variables 中添加：

```env
VITE_API_BASE_URL=https://your-backend-api.railway.app
VITE_APP_TITLE=微信公众号推广追踪系统
VITE_PAGE_SIZE=10
VITE_DEBUG=false
```

**⚠️ 重要：** `VITE_API_BASE_URL` 必须指向你部署的后端地址

---

## 📦 后端部署方案

### 选项 1：Railway（推荐）⭐

```bash
# 1. 安装 Railway CLI
npm install -g railway

# 2. 登录并初始化
railway login
railway init

# 3. 只部署后端
cd backend
railway up

# 4. 获取后端地址
railway domain
```

### 选项 2：Render

```bash
# 1. 推送代码到 GitHub
git push

# 2. 在 Render.com 创建新服务
# 选择 Web Service
# 连接 GitHub 仓库
# 设置 Root Directory: backend
# 设置 Build Command: npm install && npm run build
# 设置 Start Command: npm start

# 3. 配置环境变量
# 在 Render 控制台添加所有必需的环境变量
```

### 选项 3：云服务器 + PM2

```bash
# 1. 上传代码到服务器
scp -r backend user@server:/var/www/

# 2. 登录服务器
ssh user@server

# 3. 部署后端
cd /var/www/backend
npm install --production
npm run build
pm2 start dist/app.js --name wechat-backend
pm2 save
```

---

## 🔄 完整部署流程

### 第一步：部署后端

选择上述后端部署方案之一，完成后获取后端地址，例如：
```
https://wechat-backend-api.railway.app
```

### 第二步：配置前端

**方式 A：在 Vercel 控制台配置**
1. 进入 Vercel 项目 → Settings → Environment Variables
2. 添加 `VITE_API_BASE_URL` = `https://wechat-backend-api.railway.app`
3. 重新部署：Redeploy

**方式 B：修改 .env.production**
```bash
cd frontend
```

编辑 `.env.production`：
```env
VITE_API_BASE_URL=https://wechat-backend-api.railway.app
```

然后重新部署：
```bash
cd ..
vercel --prod
```

### 第三步：验证部署

```bash
# 1. 测试后端
curl https://your-backend-domain.com/api/health

# 2. 访问前端
# 打开 Vercel 提供的域名

# 3. 登录测试
# 用户名：admin
# 密码：admin123
```

---

## 🌐 自定义域名

### Vercel 前端域名

1. **在 Vercel 添加域名**
   - Settings → Domains → Add Domain
   - 输入你的域名，如 `www.yourdomain.com`
   - 按照提示配置 DNS

2. **DNS 配置**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 后端域名

如果使用 Railway：
- Railway → Settings → Domains → Add Domain

如果使用云服务器：
- 配置 Nginx 反向代理
- 添加 SSL 证书（Let's Encrypt）

---

## 🔐 CORS 配置

**问题：** 前端和后端在不同域名，可能遇到 CORS 错误。

**解决方案：** 后端已配置 CORS，但需要确保允许你的前端域名。

检查 `backend/src/app.ts`：
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',           // 开发环境
    'https://your-vercel-domain.com',  // Vercel 域名
    'https://www.yourdomain.com'       // 自定义域名
  ],
  credentials: true
}));
```

---

## 📊 环境变量对照表

### 前端环境变量（Vercel）
| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `https://api.yourdomain.com` |
| `VITE_APP_TITLE` | 应用标题 | `微信公众号推广系统` |
| `VITE_PAGE_SIZE` | 分页大小 | `10` |

### 后端环境变量（Railway/Render）
| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NODE_ENV` | 环境 | ✅ |
| `PORT` | 端口 | ✅ |
| `DB_HOST` | 数据库地址 | ✅ |
| `DB_USER` | 数据库用户 | ✅ |
| `DB_PASSWORD` | 数据库密码 | ✅ |
| `DB_NAME` | 数据库名称 | ✅ |
| `JWT_SECRET` | JWT 密钥 | ✅ |
| `WECHAT_APP_ID` | 微信 AppID | ✅ |
| `WECHAT_APP_SECRET` | 微信 AppSecret | ✅ |

---

## 🎯 Vercel 部署命令速查

```bash
# 首次部署
vercel

# 生产部署
vercel --prod

# 查看部署列表
vercel list

# 查看项目信息
vercel inspect

# 查看日志
vercel logs

# 删除部署
vercel rm [deployment-url]

# 设置环境变量（CLI）
vercel env add VITE_API_BASE_URL production
```

---

## 🆘 常见问题

### 1. 前端无法连接后端

**原因：** `VITE_API_BASE_URL` 配置错误

**解决：**
1. 检查后端是否正常运行：`curl https://your-backend.com/api/health`
2. 确认 Vercel 环境变量配置正确
3. 重新部署 Vercel 项目

### 2. CORS 错误

**原因：** 后端未允许前端域名

**解决：**
1. 检查后端 CORS 配置
2. 添加前端域名到白名单
3. 重启后端服务

### 3. 环境变量不生效

**原因：** 修改环境变量后未重新部署

**解决：**
```bash
# Vercel CLI
vercel env rm VITE_API_BASE_URL production
vercel env add VITE_API_BASE_URL production
# 输入新值
vercel --prod
```

### 4. 构建失败

**原因：** 依赖安装问题或配置错误

**解决：**
1. 检查 `vercel.json` 配置
2. 查看 Vercel 构建日志
3. 确保所有依赖在 `package.json` 中

---

## 📈 性能优化

### Vercel 自动优化
- ✅ 全球 CDN 加速
- ✅ 自动压缩资源
- ✅ 智能缓存策略
- ✅ 图片优化

### 手动优化
1. **启用 API 轮询缓存**（如果适用）
2. **优化图片大小**
3. **使用代码分割**（已配置）
4. **启用 Gzip/Brotli**（Vercel 自动处理）

---

## 🔗 有用的链接

- **Vercel 文档**: https://vercel.com/docs
- **Railway 文档**: https://docs.railway.app
- **项目文档**: `QUICK_START.md`
- **API 文档**: `backend/API_DOCS.md`

---

## ✅ 部署检查清单

### 前端（Vercel）
- [ ] 推送代码到 GitHub
- [ ] 在 Vercel 导入项目
- [ ] 配置环境变量 `VITE_API_BASE_URL`
- [ ] 生产环境部署成功
- [ ] 自定义域名（可选）
- [ ] 测试前端访问

### 后端
- [ ] 选择后端部署平台（Railway 推荐）
- [ ] 配置所有环境变量
- [ ] 部署成功
- [ ] 配置 CORS 允许前端域名
- [ ] 测试 API 健康检查
- [ ] 配置自定义域名（可选）

### 联调测试
- [ ] 前端能访问后端 API
- [ ] 登录功能正常
- [ ] 数据加载正常
- [ ] 没有 CORS 错误
- [ ] 修改管理员密码

---

## 🎉 完成部署

部署完成后：
1. 访问 Vercel 提供的前端域名
2. 使用 `admin/admin123` 登录
3. 修改默认密码
4. 开始使用系统！

**祝你部署顺利！** 🚀
