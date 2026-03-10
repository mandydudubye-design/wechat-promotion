# 微信公众号推广追踪系统

一个完整的微信公众号推广效果追踪系统，支持多员工、多公众号的推广效果统计和分析。

## 系统架构

```
wechat-promotion-system/
├── backend/          # 后端API服务
│   ├── src/         # 源代码
│   ├── logs/        # 日志文件
│   └── dist/        # 编译产物
├── frontend/         # 前端Web应用
│   ├── src/         # 源代码
│   ├── public/      # 静态资源
│   └── dist/        # 构建产物
└── README.md        # 项目文档
```

## 功能特性

### 核心功能

- ✅ **员工管理** - 员工信息管理、状态控制
- ✅ **公众号管理** - 多公众号配置、API密钥管理
- ✅ **推广记录** - 推广二维码生成、扫码追踪
- ✅ **关注统计** - 实时关注数据、取消关注追踪
- ✅ **数据分析** - 多维度统计、趋势分析
- ✅ **权限控制** - 基于JWT的身份验证
- ✅ **数据导出** - Excel报表导出

### 技术亮点

- 🚀 **前后端分离** - React + TypeScript + Express
- 📊 **数据可视化** - 图表展示推广趋势
- 🔐 **安全可靠** - JWT认证 + bcrypt加密
- 📱 **微信集成** - 微信公众号事件处理
- 🎨 **现代UI** - Ant Design 5.x组件库
- ⚡ **高性能** - Vite构建 + MySQL优化

## 技术栈

### 后端技术

- **运行环境**: Node.js 18+
- **开发语言**: TypeScript 5.x
- **Web框架**: Express.js 5.x
- **数据库**: MySQL 8.0+
- **身份验证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **参数验证**: Joi
- **Excel导出**: ExcelJS
- **日志**: Winston
- **开发工具**: nodemon, ts-node

### 前端技术

- **框架**: React 18
- **语言**: TypeScript 5.x
- **构建工具**: Vite 5.x
- **UI框架**: Ant Design 5.x
- **状态管理**: React Hooks + Context API
- **路由**: React Router 6.x
- **HTTP客户端**: Axios
- **图表**: Recharts / ECharts
- **工具**: dayjs, classnames

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd wechat-promotion-system
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置数据库

#### 方式一：使用启动脚本（推荐）

**Windows用户:**

```bash
cd backend
start_server.bat
```

启动脚本会自动：
- 检查并启动MySQL服务
- 初始化数据库和表结构
- 安装依赖
- 启动开发服务器

#### 方式二：手动配置

1. 创建数据库：

```bash
mysql -u root -p < backend/init_database.sql
```

2. 配置环境变量：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
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

3. 初始化管理员账号：

```bash
cd backend
npm run init-admin
```

### 4. 启动后端服务

```bash
cd backend

# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

后端服务将在 `http://localhost:3000` 启动

### 5. 启动前端应用

```bash
cd frontend

# 开发模式
npm run dev

# 生产模式
npm run build
npm run preview
```

前端应用将在 `http://localhost:5173` 启动

### 6. 访问系统

打开浏览器访问：`http://localhost:5173`

默认登录账号：
- 用户名：`admin`
- 密码：`admin123`

**重要：登录后请立即修改默认密码！**

## 项目文档

### 后端文档

- [后端README](./backend/README.md)
- [启动指南](./backend/STARTUP_GUIDE.md)
- [API文档](./backend/API.md) (待生成)
- [数据库设计](./backend/DATABASE.md) (待生成)

### 前端文档

- [前端README](./frontend/README.md)
- [组件文档](./frontend/COMPONENTS.md) (待生成)
- [开发指南](./frontend/DEVELOPMENT.md) (待生成)

## 系统截图

### 登录页面
![登录页面](./screenshots/login.png)

### 仪表盘
![仪表盘](./screenshots/dashboard.png)

### 员工管理
![员工管理](./screenshots/employees.png)

### 推广统计
![推广统计](./screenshots/stats.png)

## API接口

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

### 主要接口

#### 认证接口

```
POST /api/auth/login          # 用户登录
GET  /api/auth/me             # 获取当前用户
PUT  /api/auth/password       # 修改密码
```

#### 员工管理

```
GET    /api/employees         # 获取员工列表
POST   /api/employees         # 创建员工
GET    /api/employees/:id     # 获取员工详情
PUT    /api/employees/:id     # 更新员工
DELETE /api/employees/:id     # 删除员工
GET    /api/employees/export  # 导出员工数据
```

#### 统计分析

```
GET /api/stats/overview       # 获取总览统计
GET /api/stats/employees      # 获取员工统计
GET /api/stats/accounts       # 获取公众号统计
```

更多API详情请查看 [API文档](./backend/API.md)

## 数据库设计

### 核心表结构

```sql
-- 管理员表
admins (id, username, password, created_at, updated_at)

-- 员工表
employees (employee_id, name, department, phone, status, created_at, updated_at)

-- 公众号表
wechat_accounts (id, account_name, account_id, app_id, app_secret, qr_code_url, status, created_at, updated_at)

-- 推广记录表
promotion_records (id, employee_id, account_id, scene_str, qr_code_url, scan_count, follow_count, created_at)

-- 关注记录表
follow_records (id, openid, employee_id, account_id, promotion_record_id, nickname, avatar_url, subscribe_time, unsubscribe_time, status, created_at, updated_at)
```

详细数据库设计请查看 [数据库文档](./backend/DATABASE.md)

## 部署指南

### 开发环境部署

详见 [快速开始](#快速开始) 部分

### 生产环境部署

#### 后端部署

1. 修改 `.env` 文件：

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your_strong_secret_here
```

2. 构建项目：

```bash
cd backend
npm run build
```

3. 使用PM2启动：

```bash
npm install -g pm2
pm2 start dist/app.js --name wechat-promotion-api
pm2 save
pm2 startup
```

#### 前端部署

1. 构建项目：

```bash
cd frontend
npm run build
```

2. 部署到Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
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

### Docker部署

详见 [Docker部署指南](./DOCKER.md) (待创建)

## 常见问题

### 后端问题

**Q: MySQL连接失败？**

A: 检查MySQL服务是否启动，确认 `.env` 中的数据库配置正确。

**Q: JWT验证失败？**

A: 检查 `JWT_SECRET` 是否一致，确认token未过期。

**Q: 端口被占用？**

A: 修改 `.env` 中的 `PORT` 配置。

### 前端问题

**Q: Vite启动失败？**

A: 检查Node.js版本，删除 `node_modules` 重新安装。

**Q: API请求失败？**

A: 检查 `.env.development` 中的 `VITE_API_BASE_URL` 配置。

**Q: 登录后刷新退出？**

A: 检查localStorage存储逻辑，确保token正常存储和读取。

## 开发指南

### 后端开发

1. **添加新API端点**

   在 `backend/src/routes/` 创建对应的路由文件

2. **错误处理**

   使用 `ApiError` 类抛出业务错误

3. **日志记录**

   使用 `logger` 工具记录重要操作

### 前端开发

1. **添加新页面**

   在 `frontend/src/pages/` 创建页面组件

2. **状态管理**

   使用Hooks和Context API管理状态

3. **样式定制**

   修改 `frontend/src/assets/styles/theme.ts` 定制主题

详细开发指南请查看：
- [后端开发指南](./backend/DEVELOPMENT.md) (待创建)
- [前端开发指南](./frontend/DEVELOPMENT.md) (待创建)

## 测试

### 后端测试

```bash
cd backend

# 运行测试（需要配置）
npm test
```

### 前端测试

```bash
cd frontend

# 运行测试（需要配置）
npm test
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 遵循ESLint和Prettier规则
- 编写有意义的注释
- 添加单元测试
- 更新相关文档

## 安全建议

1. **修改默认密码** - 登录后立即修改admin密码
2. **使用HTTPS** - 生产环境必须使用HTTPS
3. **环境变量** - 不要在代码中硬编码敏感信息
4. **定期备份** - 定期备份数据库
5. **访问控制** - 配置防火墙规则
6. **SQL注入防护** - 使用参数化查询
7. **XSS防护** - 验证和过滤用户输入

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-01-01)

- ✅ 初始版本发布
- ✅ 员工管理功能
- ✅ 公众号管理功能
- ✅ 推广记录功能
- ✅ 关注统计功能
- ✅ 数据分析功能
- ✅ 数据导出功能

## 路线图

### v1.1.0 (计划中)

- ⏳ 实时消息通知
- ⏳ 移动端适配优化
- ⏳ 更多图表类型
- ⏳ 数据导入功能

### v2.0.0 (规划中)

- ⏳ 多租户支持
- ⏳ 微信小程序版本
- ⏳ AI智能分析
- ⏳ 更多数据导出格式

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: support@example.com
- 文档: [Documentation]

## 致谢

感谢以下开源项目：

- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 免责声明

本系统仅供学习和研究使用，请遵守相关法律法规和微信平台规则。使用本系统所产生的一切后果由使用者自行承担。

---

**注意**: 请确保在使用前阅读并理解所有配置选项和安全建议。在生产环境部署前，请务必修改所有默认密码和密钥。
