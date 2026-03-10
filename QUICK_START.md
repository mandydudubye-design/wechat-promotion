# 微信公众号推广追踪系统 - 快速启动指南

本指南将帮助你在5分钟内启动系统。

## 前置要求

在开始之前，请确保已安装以下软件：

- ✅ Node.js 18+ ([下载地址](https://nodejs.org/))
- ✅ MySQL 8.0+ ([下载地址](https://dev.mysql.com/downloads/mysql/))
- ✅ Git ([下载地址](https://git-scm.com/))

检查是否已安装：

```bash
node --version    # 应该显示 v18.x.x 或更高
mysql --version   # 应该显示 8.x.x 或更高
git --version     # 应该显示 git version 2.x.x
```

## Windows用户 - 一键启动（推荐）

### 步骤1: 启动后端

1. 打开命令提示符（CMD）或PowerShell
2. 进入后端目录：
   ```bash
   cd C:\公众号任务\backend
   ```
3. 双击运行 `start_server.bat`
4. 等待脚本完成（会自动安装依赖、初始化数据库、启动服务器）
5. 看到 "服务器启动成功" 消息后，后端就准备好了

### 步骤2: 启动前端

1. 打开新的命令提示符窗口
2. 进入前端目录：
   ```bash
   cd C:\公众号任务\frontend
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动开发服务器：
   ```bash
   npm run dev
   ```
5. 看到 "Local: http://localhost:5173" 消息后，打开浏览器访问该地址

### 步骤3: 登录系统

- 打开浏览器访问：http://localhost:5173
- 使用默认账号登录：
  - 用户名：`admin`
  - 密码：`admin123`

**⚠️ 重要：登录后请立即修改密码！**

## 手动启动（适用于所有平台）

如果自动脚本无法运行，请按照以下步骤手动启动：

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置数据库

#### Windows:

```bash
# 启动MySQL服务
net start MySQL80

# 初始化数据库
cd backend
mysql -u root -p123456 < init_database.sql
```

#### Linux/macOS:

```bash
# 启动MySQL服务
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# 初始化数据库
cd backend
mysql -u root -p < init_database.sql
```

### 3. 配置环境变量

#### 后端配置 (backend/.env):

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=wechat_promotion

# JWT密钥
JWT_SECRET=your_jwt_secret_here

# 微信公众号配置（可选，用于生产环境）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

# 服务器URL
SERVER_URL=http://localhost:3000
```

#### 前端配置 (frontend/.env.development):

```env
# API基础URL
VITE_API_BASE_URL=http://localhost:3000/api

# 应用标题
VITE_APP_TITLE=微信公众号推广追踪系统

# 默认分页大小
VITE_PAGE_SIZE=10

# 默认日期格式
VITE_DATE_FORMAT=YYYY-MM-DD

# 默认时间格式
VITE_TIME_FORMAT=YYYY-MM-DD HH:mm:ss

# token存储key
VITE_TOKEN_KEY=wechat_promotion_token

# 是否启用调试模式
VITE_DEBUG=true
```

### 4. 初始化管理员账号

```bash
cd backend
npm run init-admin
```

### 5. 启动服务

#### 启动后端：

```bash
cd backend

# 开发模式（推荐）
npm run dev

# 或生产模式
npm run build
npm start
```

后端将在 http://localhost:3000 启动

#### 启动前端：

```bash
cd frontend

# 开发模式（推荐）
npm run dev

# 或生产模式
npm run build
npm run preview
```

前端将在 http://localhost:5173 启动

## 验证安装

### 1. 检查后端健康状态

```bash
curl http://localhost:3000/health
```

或直接在浏览器访问：http://localhost:3000/health

应该看到：
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

### 2. 测试登录API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

应该返回：
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

### 3. 访问前端应用

打开浏览器访问：http://localhost:5173

应该看到登录页面。

## 常见问题排查

### 问题1: MySQL连接失败

**错误信息**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**:

1. 检查MySQL服务是否启动：
   ```bash
   # Windows
   net start MySQL80
   
   # Linux
   sudo systemctl status mysql
   
   # macOS
   brew services list
   ```

2. 检查MySQL密码：
   ```bash
   mysql -u root -p
   ```
   如果无法登录，请重置MySQL root密码

3. 检查数据库是否创建：
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```
   应该看到 `wechat_promotion` 数据库

### 问题2: 端口被占用

**错误信息**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:

1. 查找占用端口的进程：
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/macOS
   lsof -i :3000
   ```

2. 结束进程或修改端口：
   ```bash
   # 修改 backend/.env 中的 PORT
   PORT=3001
   ```

### 问题3: npm install 失败

**错误信息**: `npm ERR! code ECONNREFUSED`

**解决方案**:

1. 清除npm缓存：
   ```bash
   npm cache clean --force
   ```

2. 使用国内镜像：
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

3. 删除node_modules重新安装：
   ```bash
   rm -rf node_modules
   npm install
   ```

### 问题4: 前端无法连接后端

**错误信息**: Network Error 或 CORS错误

**解决方案**:

1. 检查后端是否启动：
   ```bash
   curl http://localhost:3000/health
   ```

2. 检查前端配置：
   ```bash
   # 检查 frontend/.env.development
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. 检查浏览器控制台是否有CORS错误

### 问题5: 登录失败

**错误信息**: 用户名或密码错误

**解决方案**:

1. 确认使用默认账号：
   - 用户名：`admin`
   - 密码：`admin123`

2. 重新初始化管理员：
   ```bash
   cd backend
   npm run init-admin
   ```

3. 检查数据库：
   ```bash
   mysql -u root -p -e "USE wechat_promotion; SELECT * FROM admins;"
   ```

## 下一步

系统启动成功后，你可以：

1. **修改默认密码**
   - 登录后进入个人设置
   - 修改admin密码

2. **添加员工**
   - 进入员工管理
   - 添加你的团队成员

3. **配置公众号**
   - 进入公众号管理
   - 添加你的微信公众号信息

4. **生成推广二维码**
   - 进入推广记录
   - 为员工生成推广二维码

5. **查看统计数据**
   - 进入仪表盘
   - 查看推广效果统计

## 停止服务

### Windows:

```bash
# 停止后端
cd backend
stop_server.bat

# 或手动停止
taskkill /F /IM node.exe

# 停止前端（在前端终端按 Ctrl+C）
```

### Linux/macOS:

```bash
# 停止后端
pkill -f "node.*backend"

# 停止前端（在前端终端按 Ctrl+C）
```

## 日志查看

### 后端日志:

```bash
# Windows
type backend\logs\server.log

# Linux/macOS
tail -f backend/logs/server.log
```

### 前端日志:

查看浏览器控制台（F12）

## 获取帮助

如果遇到问题：

1. 查看 [常见问题](#常见问题排查) 部分
2. 查看 [完整文档](./README.md)
3. 查看后端 [启动指南](./backend/STARTUP_GUIDE.md)
4. 提交 [Issue](https://github.com/your-repo/issues)

## 生产环境部署

开发环境仅用于测试，生产环境部署请参考：

- [生产部署指南](./DEPLOYMENT.md) (待创建)
- [Docker部署](./DOCKER.md) (待创建)

---

**祝你使用愉快！** 🎉
