# 微信公众号推广客服系统 - 部署总结

## 项目构建完成 ✅

### 前端 (frontend/)
- ✅ TypeScript 编译成功
- ✅ Vite 构建成功
- ✅ 产物大小：734.63 KB (js) + 28.31 KB (css)
- ✅ 构建时间：6.34秒
- 📁 构建产物位置：`frontend/dist/`

### 后端 (backend/)
- ✅ TypeScript 编译成功
- ✅ 所有模块构建完成
- ✅ 创建了阿里云SDK类型声明文件
- ✅ 修复了 SMS 服务导入问题
- 📁 构建产物位置：`backend/dist/`

## 部署文件已创建

### 前端部署文件
1. `frontend/Dockerfile` - Docker 部署配置
2. `frontend/nginx.conf` - Nginx 配置
3. `frontend/DEPLOYMENT.md` - 详细部署指南

### 后端部署文件
1. `backend/DEPLOYMENT.md` - 详细部署指南（包含多种部署方式）

## 快速部署方式

### 1. Railway 部署（最简单）

**前端：**
```bash
cd frontend
railway login
railway init
railway up
```

**后端：**
```bash
cd backend
railway login
railway init
railway up
```

Railway 会自动：
- 识别项目类型
- 安装依赖
- 运行构建命令
- 启动服务
- 分配域名

### 2. Docker 部署

**前端：**
```bash
cd frontend
docker build -t wechat-frontend .
docker run -d -p 80:80 --name wechat-frontend wechat-frontend
```

**后端：**
```bash
cd backend
docker build -t wechat-backend .
docker run -d -p 3000:3000 --env-file .env.production --name wechat-backend wechat-backend
```

### 3. 本地部署

**前端（使用 Nginx）：**
```bash
# 复制构建产物到 Nginx
cp -r frontend/dist/* /usr/share/nginx/html/

# 或使用提供的配置
cp frontend/nginx.conf /etc/nginx/conf.d/wechat.conf
nginx -s reload
```

**后端（使用 PM2）：**
```bash
cd backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env.production
# 编辑 .env.production 填入真实配置

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start dist/app.js --name wechat-backend
pm2 save
pm2 startup
```

## 部署前必做事项

### 1. 数据库准备
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE wechat_promotion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入初始化脚本
mysql -u root -p wechat_promotion < backend/init_database.sql

# 初始化管理员
cd backend
npm run init-admin
```

### 2. 环境变量配置

后端必须配置的环境变量（`.env.production`）：

```env
NODE_ENV=production
PORT=3000

# 数据库
DB_HOST=your_db_host
DB_PORT=3306
DB_NAME=wechat_promotion
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_very_long_random_secret_key

# 微信公众号
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_token
WECHAT_ENCODING_AES_KEY=your_encoding_key

# 阿里云短信（可选）
ALIYUN_ACCESS_KEY_ID=your_key
ALIYUN_ACCESS_KEY_SECRET=your_secret
```

前端需要配置后端 API 地址（创建 `.env.production`）：

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

然后重新构建：`npm run build`

### 3. 服务器要求

**最低配置：**
- CPU: 1核
- 内存: 1GB
- 存储: 10GB
- 系统: Linux (Ubuntu 20.04+ 推荐)

**推荐配置：**
- CPU: 2核
- 内存: 2GB
- 存储: 20GB

**软件要求：**
- Node.js 18+
- MySQL 8.0+
- Nginx (用于前端)
- PM2 (用于后端进程管理)

## 访问地址

部署成功后：

- **前端**: `http://your-domain.com` 或 Railway 分配的域名
- **后端**: `http://api.your-domain.com` 或 Railway 分配的域名
- **默认管理员**:
  - 用户名: `admin`
  - 密码: `admin123` (首次登录后请修改)

## 验证部署

```bash
# 检查前端
curl -I http://your-domain.com

# 检查后端健康
curl http://api.your-domain.com/api/health

# 测试登录
curl -X POST http://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 功能模块

### 已实现功能
- ✅ 管理员认证系统
- ✅ 员工信息管理
- ✅ 员工绑定管理
- ✅ 推广记录管理
- ✅ 客户跟进记录
- ✅ 统计分析
- ✅ 数据导出 (Excel)
- ✅ 微信公众号集成
- ✅ 短信通知（阿里云）

### 系统特色
- 📱 移动端友好设计
- 🔐 完整的权限控制
- 📊 丰富的数据统计
- 💬 微信公众号无缝集成
- 📧 短信通知支持
- 📥 Excel 数据导出

## 维护命令

```bash
# 查看后端日志
pm2 logs wechat-backend

# 重启后端
pm2 restart wechat-backend

# 查看系统状态
pm2 status

# 查看数据库
mysql -u root -p wechat_promotion

# 备份数据库
mysqldump -u root -p wechat_promotion > backup_$(date +%Y%m%d).sql
```

## 技术支持

如遇问题，请查看：
1. 项目文档：`README.md`
2. API 文档：`backend/API_DOCS.md`
3. 部署指南：`frontend/DEPLOYMENT.md` 和 `backend/DEPLOYMENT.md`
4. 快速开始：`QUICK_START.md`

## 下一步

1. 选择合适的部署方式（Railway 推荐）
2. 准备服务器和数据库
3. 配置环境变量
4. 按照部署指南进行部署
5. 验证功能是否正常
6. 配置域名和 SSL 证书

---

**部署完成后，请及时修改默认管理员密码！**
