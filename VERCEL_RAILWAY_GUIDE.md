# 🚀 Vercel + Railway 完整部署流程

## 📋 部署架构

```
┌─────────────────────────────────────────────┐
│  Vercel (前端)                               │
│  https://your-app.vercel.app                │
│  React 静态网站                               │
└─────────────────┬───────────────────────────┘
                  │
                  │ API 请求
                  ▼
┌─────────────────────────────────────────────┐
│  Railway (后端)                              │
│  https://your-backend.railway.app           │
│  Node.js + Express API                       │
└─────────────────────────────────────────────┘
```

---

## 🎯 部署步骤（推荐顺序）

### 第一步：准备数据库 ⏱️ 5分钟

1. **选择数据库方案：**
   
   **选项 A：使用 Railway MySQL（最简单）**
   - 在 Railway 项目中添加 MySQL 插件
   - 自动创建数据库
   - 获取连接信息

   **选项 B：使用云数据库**
   - 阿里云 RDS
   - 腾讯云 MySQL
   - 其他 MySQL 8.0+ 数据库

2. **创建数据库表：**
   ```sql
   CREATE DATABASE wechat_promotion CHARACTER SET utf8mb4;
   ```

3. **初始化数据：**
   - 部署后端后运行：`npm run init-admin`

---

### 第二步：部署后端到 Railway ⏱️ 10分钟

**自动化脚本（推荐）：**
```bash
# Windows
deploy-backend-railway.bat
```

**手动步骤：**

1. **安装 Railway CLI**
   ```bash
   npm install -g railway
   railway login
   ```

2. **初始化项目**
   ```bash
   cd C:\公众号任务
   railway init
   ```

3. **配置环境变量**
   
   在 Railway 控制台（https://railway.app）添加：
   
   ```env
   NODE_ENV=production
   PORT=3000
   
   # 数据库
   DB_HOST=localhost  # Railway MySQL 使用不同地址
   DB_PORT=3306
   DB_NAME=wechat_promotion
   DB_USER=root
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=生成一个随机字符串
   JWT_EXPIRES_IN=7d
   
   # 微信公众号
   WECHAT_APP_ID=your_app_id
   WECHAT_APP_SECRET=your_app_secret
   WECHAT_TOKEN=your_token
   WECHAT_ENCODING_AES_KEY=your_key
   ```

4. **部署**
   ```bash
   cd backend
   railway up
   ```

5. **获取后端地址**
   ```bash
   railway domain
   ```
   
   记录这个地址，例如：`https://wechat-backend.up.railway.app`

6. **测试后端**
   ```bash
   curl https://your-backend.railway.app/api/health
   ```

---

### 第三步：部署前端到 Vercel ⏱️ 5分钟

**自动化脚本（推荐）：**
```bash
# Windows
deploy-vercel.bat
```

**手动步骤：**

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **配置前端环境变量**
   
   编辑 `frontend/.env.production`：
   ```env
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

3. **部署**
   ```bash
   cd C:\公众号任务
   vercel --prod
   ```

4. **获取前端地址**
   
   部署完成后会显示，例如：`https://wechat-promotion.vercel.app`

5. **测试前端**
   - 浏览器访问前端地址
   - 使用 `admin/admin123` 登录
   - 修改默认密码

---

### 第四步：配置 CORS ⏱️ 2分钟

在后端代码中添加 Vercel 前端域名到 CORS 白名单：

**Railway 环境变量添加：**
```env
FRONTEND_URL=https://your-app.vercel.app
```

或在代码中修改（需要重新部署）：

```typescript
// backend/src/app.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app'  // 添加 Vercel 域名
  ],
  credentials: true
}));
```

---

### 第五步：配置微信公众号 ⏱️ 10分钟

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com/

2. **配置服务器地址**
   
   进入：开发 → 基本配置 → 服务器配置
   
   - URL: `https://your-backend.railway.app/api/wechat/callback`
   - Token: 你配置的 `WECHAT_TOKEN`
   - EncodingAESKey: 你配置的 `WECHAT_ENCODING_AES_KEY`

3. **配置 IP 白名单**
   
   获取 Railway 服务器 IP：
   ```bash
   railway domain
   # 使用域名查 IP
   ```

   在微信后台添加 IP 到白名单

4. **测试微信接口**
   - 在后台点击"提交"
   - 确认配置成功

---

## ✅ 验证部署

### 检查清单

```bash
# 1. 后端健康检查
curl https://your-backend.railway.app/api/health

# 2. 测试登录 API
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 3. 访问前端
# 浏览器打开：https://your-app.vercel.app

# 4. 登录测试
# 用户名：admin
# 密码：admin123

# 5. 修改密码
# 首次登录后立即修改
```

---

## 🔧 常用命令

### Vercel 命令

```bash
# 查看部署列表
vercel list

# 查看项目信息
vercel inspect

# 查看日志
vercel logs

# 重新部署
vercel --prod

# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add VITE_API_BASE_URL production
```

### Railway 命令

```bash
# 查看项目状态
railway status

# 查看日志
railway logs

# 查看域名
railway domain

# 重新部署
railway up

# 查看环境变量
railway variables

# 打开控制台
railway open
```

---

## 🌐 自定义域名

### Vercel 前端域名

1. **购买域名**（可选）
   - 推荐域名注册商：
     - 阿里云
     - 腾讯云
     - Namecheap
     - GoDaddy

2. **在 Vercel 添加域名**
   - 项目 → Settings → Domains
   - 添加你的域名

3. **配置 DNS**
   ```
   Type: CNAME
   Name: www (或 @)
   Value: cname.vercel-dns.com
   ```

### Railway 后端域名

1. **在 Railway 添加域名**
   - 项目 → Settings → Domains
   - 添加你的域名

2. **配置 DNS**
   ```
   Type: CNAME
   Name: api
   Value: [railway-domain]
   ```

---

## 💰 成本估算

### Vercel（前端）
- **免费额度：**
  - 100GB 带宽/月
  - 无限请求
  - 全球 CDN
  
- **付费计划：** $20/月（起步）
  - 更大带宽
  - 更长构建时间
  - 团队协作

### Railway（后端）
- **免费额度：**
  - $5/月 免费额度
  - 512MB RAM
  - 500 小时运行时间/月
  
- **付费计划：** 按使用量计费
  - $0.000418/请求
  - $0.059/GB 存储
  - 一般 $5-20/月

**总成本：** 小项目可完全免费使用！

---

## 📊 监控和日志

### Vercel Analytics

自动启用，查看：
- 页面访问量
- 性能指标
- 错误率

### Railway Logs

```bash
# 实时日志
railway logs --tail

# 按服务过滤
railway logs --filter backend

# 导出日志
railway logs > logs.txt
```

---

## 🔄 更新部署

### 更新前端

```bash
# 1. 修改代码
git add .
git commit -m "更新功能"
git push

# 2. Vercel 自动部署
# 或手动触发
vercel --prod
```

### 更新后端

```bash
# 1. 修改代码
git add .
git commit -m "更新 API"
git push

# 2. Railway 自动部署
# 或手动触发
railway up
```

---

## 🆘 故障排查

### 问题 1：前端无法连接后端

**症状：** API 请求失败

**解决：**
1. 检查后端是否运行
   ```bash
   curl https://your-backend.railway.app/api/health
   ```

2. 检查前端环境变量
   ```bash
   vercel env ls
   ```

3. 检查 CORS 配置
   - 后端必须允许前端域名

4. 重新部署前端
   ```bash
   vercel --prod
   ```

### 问题 2：后端部署失败

**症状：** Railway 部署错误

**解决：**
1. 查看构建日志
   ```bash
   railway logs
   ```

2. 检查环境变量
   ```bash
   railway variables
   ```

3. 本地测试
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

### 问题 3：微信接口调用失败

**症状：** 微信相关功能不工作

**解决：**
1. 检查微信配置
   - AppID 和 AppSecret 是否正确
   - Token 是否匹配

2. 检查服务器 IP 白名单
   - 微信后台 → IP白名单
   - 添加 Railway 服务器 IP

3. 查看后端日志
   ```bash
   railway logs
   ```

---

## 📚 参考文档

- **Vercel 文档**: https://vercel.com/docs
- **Railway 文档**: https://docs.railway.app
- **项目部署指南**: `VERCEL_DEPLOYMENT.md`
- **快速参考**: `QUICK_REFERENCE.txt`

---

## 🎉 完成部署

部署完成后：

1. ✅ 访问前端并登录
2. ✅ 修改默认密码
3. ✅ 配置微信公众号
4. ✅ 添加员工信息
5. ✅ 开始使用系统！

**祝你部署顺利！** 🚀
