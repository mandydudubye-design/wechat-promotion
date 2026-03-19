# 微信公众号推广客服系统 - 后端部署指南

## 构建产物

后端项目已成功构建，产物位于 `dist/` 目录：

```
dist/
├── app.js                          # 应用入口
├── config/
│   └── database.js                 # 数据库配置
├── middleware/
│   ├── auth.js                     # 认证中间件
│   ├── errorHandler.js             # 错误处理
│   └── validation.js               # 验证中间件
├── routes/
│   ├── accounts.js                 # 账户路由
│   ├── auth.js                     # 认证路由
│   ├── employeeBinding.js          # 员工绑定
│   ├── employeeInfo.js             # 员工信息
│   ├── employees.js                # 员工管理
│   ├── follow.js                   # 跟进记录
│   ├── promotion.js                # 推广管理
│   ├── stats.js                    # 统计数据
│   └── wechat.js                   # 微信集成
├── scripts/
│   ├── initAdmin.js                # 初始化管理员
│   ├── migrateEmployeeBinding.js   # 迁移脚本
│   ├── migrateEmployeeInfo.js      # 迁移脚本
│   └── testApi.js                  # API测试
├── services/
│   ├── smsService.js               # 短信服务
│   └── wechat.js                   # 微信服务
└── utils/
    ├── export.js                   # 导出工具
    └── logger.js                   # 日志工具
```

## 部署前准备

### 1. 环境变量配置

复制环境变量模板并配置：

```bash
cp .env.example .env.production
```

必须配置的环境变量：

```env
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_promotion
DB_USER=root
DB_PASSWORD=your_password

# JWT密钥
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# 微信公众号配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

# 阿里云短信配置（可选）
ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_secret
ALIYUN_SMS_SIGN_NAME=your_sign_name
ALIYUN_SMS_TEMPLATE_CODE=your_template_code
```

### 2. 数据库初始化

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE wechat_promotion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入初始化脚本
mysql -u root -p wechat_promotion < init_database.sql

# 初始化管理员账户
npm run init-admin
```

## 部署方式

### 1. 直接部署（Node.js）

```bash
# 安装生产依赖
npm install --production

# 构建项目
npm run build

# 启动服务
npm start
```

### 2. 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/app.js --name wechat-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs wechat-backend

# 重启应用
pm2 restart wechat-backend
```

### 3. Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install --production

# 复制构建产物
COPY dist ./dist

# 复制环境变量
COPY .env.production .env

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

构建和运行：

```bash
docker build -t wechat-backend .
docker run -d -p 3000:3000 --env-file .env.production --name wechat-backend wechat-backend
```

### 4. Railway 部署

项目已配置 `railway.json`，可以直接部署：

```bash
# 安装 Railway CLI
npm install -g railway

# 登录并部署
railway login
railway init
railway up
```

Railway 会自动：
- 检测 Node.js 项目
- 安装依赖
- 运行构建命令
- 启动服务

### 5. Vercel/Netlify 部署

这些平台主要用于前端，后端建议使用 Railway、Render 或自建服务器。

## Nginx 反向代理配置

```nginx
upstream backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

## 健康检查

部署后验证服务是否正常：

```bash
# 检查服务状态
curl http://localhost:3000/api/health

# 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 日志管理

### PM2 日志

```bash
# 查看实时日志
pm2 logs wechat-backend

# 查看错误日志
pm2 logs wechat-backend --err

# 清空日志
pm2 flush
```

### 文件日志

日志文件位于 `logs/` 目录：

```
logs/
├── error.log       # 错误日志
├── combined.log    # 所有日志
└── api.log         # API请求日志
```

## 性能优化

1. **启用 Gzip 压缩**：在 Nginx 配置中启用
2. **数据库连接池**：已配置，默认连接数 10
3. **缓存策略**：考虑使用 Redis 缓存热点数据
4. **负载均衡**：使用 PM2 cluster 模式或 Nginx 负载均衡

## 安全建议

1. **环境变量**：不要将 `.env` 文件提交到版本控制
2. **CORS**：在生产环境中限制允许的域名
3. **Rate Limiting**：添加 API 请求限流
4. **HTTPS**：生产环境必须使用 HTTPS
5. **SQL注入防护**：已使用参数化查询
6. **XSS防护**：已使用输入验证和输出编码

## 监控告警

建议使用以下工具：

- **PM2 Monitor**：应用性能监控
- **Sentry**：错误追踪
- **Grafana + Prometheus**：系统监控
- **Uptime Robot**：服务可用性监控

## 常见问题

### 1. 数据库连接失败

检查数据库配置和网络连接：

```bash
# 测试数据库连接
mysql -h localhost -u root -p
```

### 2. 微信接口调用失败

确认微信公众号配置正确：

- AppID 和 AppSecret 是否正确
- 服务器 IP 是否在白名单中
- 网络是否可以访问微信 API

### 3. 端口被占用

修改 `.env` 中的 PORT 配置：

```env
PORT=3001
```

## 更新部署

```bash
# 拉取最新代码
git pull

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart wechat-backend
```

## 技术栈

- Node.js 18+
- Express 4.18
- TypeScript 5.3
- MySQL 8.0
- JWT 认证
- 阿里云短信 SDK
- 微信公众号 SDK

## 开发命令

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产版本
npm start

# 初始化管理员
npm run init-admin

# 测试 API
npm run test-api

# 测试微信接口
npm run test-wechat
```
