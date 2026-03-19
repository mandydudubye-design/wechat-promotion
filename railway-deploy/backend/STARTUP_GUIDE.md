# 后端服务器启动指南

## 环境准备

### 1. 安装MySQL数据库

**Windows系统:**
```bash
# 下载并安装MySQL 8.0+
# https://dev.mysql.com/downloads/mysql/

# 安装后启动MySQL服务
net start MySQL80
```

**Linux系统:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS系统:**
```bash
brew install mysql
brew services start mysql
```

### 2. 创建数据库

```sql
-- 连接到MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE wechat_promotion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE wechat_promotion;

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认管理员 (密码: admin123)
INSERT INTO admins (username, password) VALUES 
('admin', '$2b$10$rJQK7qGZmZYJqLZzYLZYZOqKZzZYZYZYZYZYZYZYZYZYZYZYZYZ');

-- 创建员工表
CREATE TABLE IF NOT EXISTS employees (
  employee_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  status TINYINT DEFAULT 1 COMMENT '1-在职, 0-离职',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建公众号表
CREATE TABLE IF NOT EXISTS wechat_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(100) NOT NULL,
  account_id VARCHAR(100) NOT NULL,
  app_id VARCHAR(100),
  app_secret VARCHAR(255),
  qr_code_url VARCHAR(500),
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建推广记录表
CREATE TABLE IF NOT EXISTS promotion_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50),
  account_id INT,
  scene_str VARCHAR(100) UNIQUE NOT NULL,
  qr_code_url VARCHAR(500),
  scan_count INT DEFAULT 0,
  follow_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (account_id) REFERENCES wechat_accounts(id)
);

-- 创建关注记录表
CREATE TABLE IF NOT EXISTS follow_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(100) NOT NULL,
  employee_id VARCHAR(50),
  account_id INT,
  promotion_record_id INT,
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  subscribe_time TIMESTAMP,
  unsubscribe_time TIMESTAMP NULL,
  status TINYINT DEFAULT 1 COMMENT '1-已关注, 0-已取消',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (account_id) REFERENCES wechat_accounts(id),
  FOREIGN KEY (promotion_record_id) REFERENCES promotion_records(id)
);
```

### 3. 安装Node.js依赖

```bash
cd backend
npm install
```

### 4. 配置环境变量

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=wechat_promotion

# JWT密钥
JWT_SECRET=your_jwt_secret_here_change_in_production

# 微信公众号配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

# 服务器配置（用于微信回调）
SERVER_URL=http://your_domain_or_ip
```

### 5. 初始化管理员账号

```bash
# 使用脚本快速插入管理员
npm run insert:admin
```

或手动执行：

```bash
npx ts-node src/scripts/quickInsertAdmin.ts
```

## 启动服务器

### 开发模式（热重载）

```bash
npm run dev
```

### 生产模式

```bash
# 构建TypeScript
npm run build

# 启动服务器
npm start
```

## 验证服务器

### 1. 检查健康状态

```bash
curl http://localhost:3000/health
```

期望响应：
```json
{
  "code": 200,
  "message": "Server is running",
  "timestamp": 1234567890,
  "data": {
    "uptime": 123.456,
    "environment": "development",
    "version": "1.0.0"
  }
}
```

### 2. 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

期望响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "timestamp": 1234567890,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin"
    }
  }
}
```

## 常见问题

### MySQL连接失败

1. 检查MySQL服务是否启动：
   ```bash
   # Windows
   net start MySQL80
   
   # Linux
   sudo systemctl status mysql
   
   # macOS
   brew services list
   ```

2. 检查数据库连接信息：
   ```bash
   mysql -u root -p -h localhost
   ```

3. 确认数据库已创建：
   ```sql
   SHOW DATABASES;
   ```

### 端口被占用

如果3000端口被占用，修改 `.env` 文件中的 `PORT` 值：

```env
PORT=3001
```

### TypeScript编译错误

清理并重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

## 日志文件

- 服务器日志：`logs/server.log`
- 应用日志：`logs/app.log`
- 错误日志：`logs/error.log`

查看实时日志：

```bash
# Windows
Get-Content logs\server.log -Wait

# Linux/macOS
tail -f logs/server.log
```

## API文档

启动服务器后，访问API文档：

- Swagger UI: http://localhost:3000/api-docs
- API Base URL: http://localhost:3000/api

## 数据库管理

### 备份数据库

```bash
mysqldump -u root -p wechat_promotion > backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
mysql -u root -p wechat_promotion < backup_20240101.sql
```

### 清空测试数据

```sql
-- 清空关注记录
TRUNCATE TABLE follow_records;

-- 清空推广记录
TRUNCATE TABLE promotion_records;

-- 重置员工数据
DELETE FROM employees WHERE employee_id LIKE 'TEST%';
```

## 生产环境部署

1. 修改 `.env` 文件：
   ```env
   NODE_ENV=production
   JWT_SECRET=use_strong_random_secret
   ```

2. 构建项目：
   ```bash
   npm run build
   ```

3. 使用PM2启动：
   ```bash
   npm install -g pm2
   pm2 start dist/app.js --name wechat-promotion-api
   pm2 save
   pm2 startup
   ```

4. 配置反向代理（Nginx示例）：
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;
       
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

## 安全建议

1. **修改默认密码**
   ```bash
   # 登录后立即修改admin密码
   curl -X PUT http://localhost:3000/api/auth/password \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"oldPassword":"admin123","newPassword":"YOUR_NEW_PASSWORD"}'
   ```

2. **使用环境变量**
   - 不要在代码中硬编码敏感信息
   - 生产环境使用强密码和JWT密钥

3. **HTTPS配置**
   - 生产环境必须使用HTTPS
   - 配置SSL证书（Let's Encrypt免费）

4. **数据库备份**
   - 定期备份数据库
   - 设置自动备份任务

## 监控和维护

### 检查服务器状态

```bash
# 检查进程
pm2 list

# 查看日志
pm2 logs wechat-promotion-api

# 监控
pm2 monit
```

### 更新依赖

```bash
npm audit
npm update
```

## 联系支持

如有问题，请联系开发团队或查看项目文档。
