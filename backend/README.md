# 微信公众号推广追踪系统 - 后端API

基于 Node.js + Express + MySQL + TypeScript 构建的微信公众号推广效果追踪系统后端服务。

## 功能特性

- 🎯 **推广效果追踪** - 实时追踪每个员工的推广效果
- 📊 **数据统计分析** - 多维度统计推广数据
- 👥 **员工管理** - 员工信息管理及推广排行
- 📱 **公众号管理** - 多公众号支持
- 🔐 **JWT身份验证** - 安全的API访问控制
- 📝 **数据导出** - 支持导出Excel报表
- 🔄 **微信集成** - 微信公众号事件处理

## 技术栈

- **运行环境**: Node.js 18+
- **开发语言**: TypeScript 5.x
- **Web框架**: Express.js
- **数据库**: MySQL 8.0+
- **ORM**: 原生SQL查询
- **身份验证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **参数验证**: Joi
- **Excel导出**: ExcelJS
- **日志**: Winston
- **API文档**: Swagger (可选)
- **开发工具**: nodemon, ts-node

## 项目结构

```
backend/
├── src/
│   ├── config/           # 配置文件
│   │   └── database.ts   # 数据库配置
│   ├── middleware/       # 中间件
│   │   ├── auth.ts       # JWT验证中间件
│   │   ├── errorHandler.ts  # 错误处理中间件
│   │   └── validation.ts # 参数验证中间件
│   ├── routes/           # 路由
│   │   ├── auth.ts       # 认证相关
│   │   ├── employees.ts  # 员工管理
│   │   ├── accounts.ts   # 公众号管理
│   │   ├── promotion.ts  # 推广记录
│   │   ├── follow.ts     # 关注记录
│   │   ├── stats.ts      # 统计分析
│   │   └── wechat.ts     # 微信回调
│   ├── scripts/          # 脚本工具
│   │   ├── initAdmin.ts  # 初始化管理员
│   │   └── quickInsertAdmin.ts  # 快速插入管理员
│   ├── services/         # 服务层
│   │   └── wechat.ts     # 微信API服务
│   ├── types/            # 类型定义
│   │   └── index.ts      # 全局类型
│   ├── utils/            # 工具函数
│   │   ├── export.ts     # Excel导出
│   │   └── logger.ts     # 日志工具
│   └── app.ts            # 应用入口
├── logs/                 # 日志文件目录
├── .env                  # 环境变量配置
├── .gitignore
├── package.json
├── tsconfig.json
├── init_database.sql     # 数据库初始化脚本
├── start_server.bat      # Windows启动脚本
├── stop_server.bat       # Windows停止脚本
├── check_status.bat      # 状态检查脚本
└── README.md             # 项目文档

```

## 快速开始

### 方式一：使用启动脚本（推荐）

**Windows用户:**

```bash
# 直接双击运行 start_server.bat
# 或在命令行中执行：
start_server.bat
```

启动脚本会自动：
1. 检查并启动MySQL服务
2. 检查并初始化数据库
3. 安装Node.js依赖
4. 启动开发服务器
5. 测试服务器连接

### 方式二：手动启动

**1. 安装依赖**

```bash
npm install
```

**2. 配置环境变量**

复制并编辑 `.env` 文件：

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

# 微信公众号配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

# 服务器URL
SERVER_URL=http://your_domain_or_ip
```

**3. 初始化数据库**

```bash
# 方式1: 使用SQL脚本
mysql -u root -p < init_database.sql

# 方式2: 使用Node.js脚本
npm run insert:admin
```

**4. 启动服务器**

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm run build
npm start
```

## API文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

### 认证接口

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin"
    }
  }
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### 修改密码
```
PUT /api/auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "admin123",
  "newPassword": "newPassword123"
}
```

### 员工管理

#### 获取员工列表
```
GET /api/employees?page=1&pageSize=10&keyword=张三
Authorization: Bearer {token}
```

#### 创建员工
```
POST /api/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": "EMP001",
  "name": "张三",
  "department": "销售部",
  "phone": "13800138000"
}
```

#### 获取员工详情
```
GET /api/employees/{employeeId}
Authorization: Bearer {token}
```

#### 更新员工
```
PUT /api/employees/{employeeId}
Authorization: Bearer {token}
```

#### 删除员工
```
DELETE /api/employees/{employeeId}
Authorization: Bearer {token}
```

#### 导出员工数据
```
GET /api/employees/export
Authorization: Bearer {token}
```

### 公众号管理

#### 获取公众号列表
```
GET /api/accounts
Authorization: Bearer {token}
```

#### 创建公众号
```
POST /api/accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "account_name": "测试公众号",
  "account_id": "gh_test001",
  "app_id": "wx_test_appid",
  "app_secret": "test_secret"
}
```

### 推广记录

#### 获取推广记录列表
```
GET /api/promotion?page=1&pageSize=10&employeeId=EMP001
Authorization: Bearer {token}
```

#### 创建推广记录
```
POST /api/promotion
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": "EMP001",
  "account_id": 1,
  "scene_str": "scene_emp001_001"
}
```

#### 获取推广统计
```
GET /api/promotion/stats?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### 关注记录

#### 获取关注记录列表
```
GET /api/follows?page=1&pageSize=10&employeeId=EMP001
Authorization: Bearer {token}
```

#### 获取关注统计
```
GET /api/follows/stats?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### 统计分析

#### 获取总览统计
```
GET /api/stats/overview
Authorization: Bearer {token}
```

#### 获取员工统计
```
GET /api/stats/employees
Authorization: Bearer {token}
```

#### 获取公众号统计
```
GET /api/stats/accounts
Authorization: Bearer {token}
```

### 微信回调

#### 微信服务器验证
```
GET /api/wechat/callback?signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx
```

#### 微信事件处理
```
POST /api/wechat/callback
Content-Type: application/xml
```

## 数据库设计

### 核心表结构

**admins (管理员表)**
- id: 主键
- username: 用户名（唯一）
- password: 密码（bcrypt哈希）
- created_at, updated_at: 时间戳

**employees (员工表)**
- employee_id: 员工ID（主键）
- name: 姓名
- department: 部门
- phone: 电话
- status: 状态（1-在职, 0-离职）
- created_at, updated_at: 时间戳

**wechat_accounts (公众号表)**
- id: 主键
- account_name: 公众号名称
- account_id: 公众号原始ID
- app_id: AppID
- app_secret: AppSecret
- qr_code_url: 二维码URL
- status: 状态
- created_at, updated_at: 时间戳

**promotion_records (推广记录表)**
- id: 主键
- employee_id: 员工ID（外键）
- account_id: 公众号ID（外键）
- scene_str: 场景值（唯一）
- qr_code_url: 推广二维码URL
- scan_count: 扫码数
- follow_count: 关注数
- created_at: 创建时间

**follow_records (关注记录表)**
- id: 主键
- openid: 微信OpenID
- employee_id: 员工ID（外键）
- account_id: 公众号ID（外键）
- promotion_record_id: 推广记录ID（外键）
- nickname: 昵称
- avatar_url: 头像URL
- subscribe_time: 关注时间
- unsubscribe_time: 取消关注时间
- status: 状态（1-已关注, 0-已取消）
- created_at, updated_at: 时间戳

## 开发指南

### 添加新的API端点

1. 在 `src/routes/` 创建对应的路由文件
2. 在 `src/app.ts` 中注册路由
3. 如需认证，添加 `authenticateToken` 中间件
4. 如需参数验证，添加 `validate` 中间件

示例：

```typescript
// src/routes/example.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 所有端点都需要认证
router.use(authenticateToken);

router.get('/example', async (req, res, next) => {
  try {
    // 业务逻辑
    res.json({ code: 200, message: 'Success' });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 错误处理

使用 `ApiError` 类抛出业务错误：

```typescript
import { ApiError } from '../middleware/errorHandler';

// 抛出错误
throw new ApiError(404, '资源不存在');

// 带详细信息的错误
throw new ApiError(400, '参数验证失败', validationErrors);
```

### 日志使用

```typescript
import { logger } from '../utils/logger';

// 普通日志
logger.info('用户登录', { userId: 1 });

// 错误日志
logger.error('数据库连接失败', { error: err.message });

// 警告日志
logger.warn('API限流', { ip: req.ip });
```

### 数据库查询

```typescript
import { pool } from '../config/database';

// 查询
const [rows] = await pool.query('SELECT * FROM employees WHERE status = 1');

// 插入
await pool.query('INSERT INTO employees (employee_id, name) VALUES (?, ?)', ['EMP001', '张三']);

// 更新
await pool.query('UPDATE employees SET name = ? WHERE employee_id = ?', ['李四', 'EMP001']);

// 删除
await pool.query('DELETE FROM employees WHERE employee_id = ?', ['EMP001']);
```

## 测试

### 手动测试

```bash
# 健康检查
curl http://localhost:3000/health

# 登录测试
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取员工列表
curl http://localhost:3000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 自动化测试

```bash
# 运行测试（需要配置测试环境）
npm test
```

## 部署

### 生产环境配置

1. 修改 `.env` 文件：
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your_strong_secret_here
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

### Docker部署

```bash
# 构建镜像
docker build -t wechat-promotion-api .

# 运行容器
docker run -d \
  --name wechat-api \
  -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=your_password \
  wechat-promotion-api
```

## 常见问题

### MySQL连接失败

**问题**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**:
1. 检查MySQL服务是否启动
2. 检查 `.env` 中的数据库配置
3. 确认MySQL端口是否为3306

### JWT验证失败

**问题**: `401 Unauthorized`

**解决方案**:
1. 确认token是否有效
2. 检查 `JWT_SECRET` 是否一致
3. 确认token是否过期

### TypeScript编译错误

**问题**: `TSError: Unable to compile TypeScript`

**解决方案**:
1. 清理node_modules: `rm -rf node_modules`
2. 重新安装依赖: `npm install`
3. 检查TypeScript版本: `npm ls typescript`

## 监控和日志

### 日志文件

- `logs/server.log` - 服务器日志
- `logs/app.log` - 应用日志
- `logs/error.log` - 错误日志

### 查看实时日志

```bash
# Windows
Get-Content logs\server.log -Wait

# Linux/macOS
tail -f logs/server.log
```

### PM2监控

```bash
pm2 list
pm2 logs wechat-promotion-api
pm2 monit
```

## 安全建议

1. **修改默认密码** - 登录后立即修改admin密码
2. **使用HTTPS** - 生产环境必须使用HTTPS
3. **环境变量** - 不要在代码中硬编码敏感信息
4. **定期备份** - 定期备份数据库
5. **访问控制** - 配置防火墙规则
6. **SQL注入** - 使用参数化查询
7. **XSS防护** - 验证和过滤用户输入

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: support@example.com

---

**注意**: 本系统仅供学习和研究使用，请遵守相关法律法规和微信平台规则。
