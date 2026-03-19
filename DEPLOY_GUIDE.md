# 🚀 微信公众号推广客服系统 - 快速部署指南

## 📋 部署前准备

### 必需软件
- **Node.js** 18+ ([下载](https://nodejs.org/))
- **MySQL** 8.0+ ([下载](https://dev.mysql.com/downloads/mysql/))
- **Git** ([下载](https://git-scm.com/downloads))

### 微信公众号配置
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 获取以下信息：
   - AppID
   - AppSecret
   - Token
   - EncodingAESKey

### 数据库准备
```sql
CREATE DATABASE wechat_promotion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🎯 选择部署方式

### 方式一：Railway 部署 ⭐（最推荐）

**优点：**
- ✅ 零配置，自动部署
- ✅ 免费 SSL 证书
- ✅ 自动扩容
- ✅ 5美元免费额度/月

**步骤：**

1. **双击运行部署脚本**
   ```
   deploy-railway.bat
   ```

2. **或手动执行：**
   ```bash
   # 1. 安装 Railway CLI
   npm install -g railway

   # 2. 登录
   railway login

   # 3. 初始化项目
   railway init

   # 4. 部署
   railway up
   ```

3. **配置环境变量**（在 Railway 控制台）
   - 进入项目 → Settings → Variables
   - 添加环境变量（见下方"环境变量配置"）

4. **获取访问地址**
   ```bash
   railway domain
   ```

---

### 方式二：Docker 部署

**优点：**
- ✅ 环境隔离
- ✅ 易于迁移
- ✅ 适合本地/服务器

**步骤：**

1. **安装 Docker Desktop**
   - 下载：https://www.docker.com/products/docker-desktop

2. **双击运行部署脚本**
   ```
   deploy-docker.bat
   ```

3. **或手动执行：**
   ```bash
   # 构建后端
   cd backend
   docker build -t wechat-backend .
   docker run -d -p 3000:3000 --name wechat-backend --env-file .env.production wechat-backend

   # 构建前端
   cd ../frontend
   docker build -t wechat-frontend .
   docker run -d -p 80:80 --name wechat-frontend wechat-frontend
   ```

4. **访问地址**
   - 前端：http://localhost
   - 后端：http://localhost:3000

---

### 方式三：本地服务器部署

**优点：**
- ✅ 完全控制
- ✅ 适合熟悉服务器的用户

**步骤：**

1. **双击运行部署脚本**
   ```
   deploy-local.bat
   ```

2. **配置 Nginx（前端）**

   安装 Nginx 后，创建配置文件 `nginx.conf`：
   ```nginx
   server {
       listen 80;
       server_name localhost;

       root C:/公众号任务/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   启动 Nginx：
   ```bash
   nginx -s reload
   ```

---

## 🔑 环境变量配置

### 后端必需环境变量

创建 `backend/.env.production`：

```env
# 基础配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_promotion
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT 密钥（生成随机字符串）
JWT_SECRET=your_very_long_random_secret_key_here_change_this
JWT_EXPIRES_IN=7d

# 微信公众号配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

# 阿里云短信（可选）
ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
ALIYUN_SMS_SIGN_NAME=your_sms_sign_name
ALIYUN_SMS_TEMPLATE_CODE=your_sms_template_code
```

### 前端环境变量

创建 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

**注意：** 修改后需要重新构建前端：`npm run build`

---

## 🗄️ 数据库初始化

### 方式一：使用初始化脚本

```bash
cd backend

# 导入数据库结构
mysql -u root -p wechat_promotion < init_database.sql

# 创建管理员账户
npm run init-admin
```

### 方式二：手动创建表

参考 `backend/init_database.sql` 中的 SQL 语句手动创建。

---

## ✅ 验证部署

### 1. 检查后端健康

```bash
curl http://localhost:3000/api/health
```

预期返回：
```json
{
  "status": "ok",
  "timestamp": "2024-03-11T10:00:00.000Z"
}
```

### 2. 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### 3. 访问前端

打开浏览器访问：`http://localhost`

使用默认管理员登录：
- 用户名：`admin`
- 密码：`admin123`

---

## 🛠️ 常用命令

### Railway
```bash
railway logs          # 查看日志
railway status        # 查看状态
railway open          # 打开控制台
railway domain        # 查看域名
railway up            # 重新部署
```

### Docker
```bash
docker ps                      # 查看运行容器
docker logs -f wechat-backend  # 查看后端日志
docker logs -f wechat-frontend # 查看前端日志
docker stop wechat-backend     # 停止后端
docker restart wechat-backend  # 重启后端
```

### PM2（本地部署）
```bash
pm2 status              # 查看状态
pm2 logs wechat-backend # 查看日志
pm2 restart wechat-backend  # 重启
pm2 stop wechat-backend     # 停止
pm2 delete wechat-backend   # 删除
```

---

## 🔧 故障排查

### 后端无法启动

1. **检查端口占用**
   ```bash
   netstat -ano | findstr :3000
   ```

2. **查看日志**
   ```bash
   # Docker
   docker logs wechat-backend

   # PM2
   pm2 logs wechat-backend

   # Railway
   railway logs
   ```

3. **检查数据库连接**
   ```bash
   mysql -u root -p -h localhost
   ```

### 前端无法访问后端

1. **检查 CORS 配置**
   - 后端已配置 CORS，允许所有域名
   - 生产环境建议修改为具体域名

2. **检查 API 地址配置**
   - 确认 `frontend/.env.production` 中的 `VITE_API_BASE_URL` 正确

3. **重新构建前端**
   ```bash
   cd frontend
   npm run build
   ```

### 微信接口调用失败

1. **确认配置正确**
   - AppID 和 AppSecret 是否匹配
   - Token 是否正确

2. **检查服务器 IP 白名单**
   - 登录微信公众平台
   - 设置 → 开发 → IP白名单
   - 添加服务器 IP

3. **测试网络连接**
   ```bash
   curl https://api.weixin.qq.com
   ```

---

## 📊 监控和维护

### 日志位置

**Docker：**
```bash
docker logs -f wechat-backend > backend.log
```

**PM2：**
```bash
pm2 logs wechat-backend --lines 100
```

**Railway：**
- 在控制台查看实时日志

### 数据备份

```bash
# 备份数据库
mysqldump -u root -p wechat_promotion > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
mysql -u root -p wechat_promotion < backup_file.sql
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建
npm run build

# 重启服务
pm2 restart wechat-backend
# 或
docker restart wechat-backend
# 或
railway up
```

---

## 🔐 安全建议

1. **修改默认密码**
   - 登录后立即修改管理员密码

2. **使用强密码**
   - JWT_SECRET 使用 32+ 位随机字符串

3. **启用 HTTPS**
   - 生产环境必须使用 HTTPS
   - 使用 Let's Encrypt 免费证书

4. **配置防火墙**
   - 只开放必要端口（80, 443, 22）
   - 数据库不要暴露到公网

5. **定期备份**
   - 每天自动备份数据库
   - 保留 7-30 天的备份

---

## 📞 技术支持

如遇问题：

1. 查看部署文档：
   - `backend/DEPLOYMENT.md`
   - `frontend/DEPLOYMENT.md`

2. 查看 API 文档：
   - `backend/API_DOCS.md`

3. 查看快速开始：
   - `QUICK_START.md`

---

## 🎉 部署完成

部署成功后：

1. **访问前端**：使用分配的域名或 localhost
2. **登录系统**：使用 admin/admin123
3. **修改密码**：首次登录后修改
4. **配置微信**：在系统设置中配置微信公众号
5. **开始使用**：添加员工、推广记录等

**祝使用愉快！** 🚀
