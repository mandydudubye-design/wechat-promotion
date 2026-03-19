# 微信公众号推广追踪系统 - 后端开发总结

## 🎯 项目概述

基于Node.js + Express + TypeScript + MySQL构建的微信公众号推广追踪系统后端服务，实现员工推广效果追踪、关注者管理、数据分析等核心功能。

## 📦 技术栈

### 后端框架
- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **TypeScript** - 类型安全
- **MySQL 8.0+** - 关系型数据库

### 核心库
- **mysql2** - MySQL客户端
- **jsonwebtoken** - JWT认证
- **bcryptjs** - 密码加密
- **axios** - HTTP客户端
- **winston** - 日志系统
- **dotenv** - 环境变量管理
- **cors** - 跨域支持
- **multer** - 文件上传

### 开发工具
- **ts-node** - TypeScript运行
- **nodemon** - 热重载
- **TypeScript** - 类型检查

## 🏗️ 项目结构

```
backend/
├── src/
│   ├── config/              # 配置
│   │   ├── database.ts      # 数据库配置
│   │   └── init.sql         # 数据库初始化脚本
│   ├── middleware/          # 中间件
│   │   ├── auth.ts          # 认证中间件
│   │   └── errorHandler.ts  # 错误处理
│   ├── routes/              # 路由（7个）
│   │   ├── auth.ts          # 认证路由
│   │   ├── employees.ts     # 员工管理
│   │   ├── accounts.ts      # 公众号管理
│   │   ├── promotion.ts     # 推广管理
│   │   ├── follow.ts        # 关注管理
│   │   ├── wechat.ts        # 微信回调
│   │   └── stats.ts         # 统计数据
│   ├── services/            # 服务层
│   │   └── wechat.ts        # 微信API服务
│   ├── types/               # 类型定义
│   │   └── index.ts         # 全局类型
│   ├── utils/               # 工具函数
│   │   └── logger.ts        # 日志工具
│   ├── scripts/             # 脚本
│   │   ├── initAdmin.ts     # 初始化管理员
│   │   └── testApi.ts       # API测试
│   └── app.ts               # 应用入口
├── logs/                    # 日志目录
├── uploads/                 # 上传文件目录
├── .env                     # 环境变量
├── .env.example             # 环境变量示例
├── package.json
├── tsconfig.json
├── README.md                # 项目说明
└── PROGRESS.md              # 开发进度
```

## 💾 数据库设计

### 核心表结构

#### 1. employees（员工表）
```sql
- id: 主键
- employee_id: 员工ID（唯一）
- name: 姓名
- phone: 手机号
- department: 部门
- position: 职位
- bind_status: 绑定状态（0未绑定，1已绑定，2已禁用）
- created_at: 创建时间
- updated_at: 更新时间
```

#### 2. wechat_accounts（公众号表）
```sql
- id: 主键
- account_name: 公众号名称
- app_id: AppID
- app_secret: AppSecret
- description: 描述
- avatar: 头像
- status: 状态（0停用，1启用）
- created_at: 创建时间
- updated_at: 更新时间
```

#### 3. promotion_records（推广记录表）
```sql
- id: 主键
- employee_id: 员工ID
- account_id: 公众号ID
- scene_str: 场景值（字符串）
- scene_id: 场景值（数字）
- description: 描述
- qr_code_url: 二维码URL
- scan_count: 扫码次数
- follow_count: 关注次数
- created_at: 创建时间
- updated_at: 更新时间
```

#### 4. follow_records（关注记录表）
```sql
- id: 主键
- openid: 微信OpenID
- employee_id: 员工ID
- account_id: 公众号ID
- nickname: 昵称
- avatar: 头像
- status: 状态（0已取关，1已关注）
- subscribed_at: 关注时间
- unsubscribed_at: 取关时间
- created_at: 创建时间
- updated_at: 更新时间
```

#### 5. follow_events（关注事件日志表）
```sql
- id: 主键
- openid: 微信OpenID
- event_type: 事件类型
- event_key: 事件Key
- created_at: 创建时间
```

#### 6. admins（管理员表）
```sql
- id: 主键
- username: 用户名
- password: 密码（哈希）
- name: 姓名
- email: 邮箱
- role: 角色
- created_at: 创建时间
- updated_at: 更新时间
```

## 🔌 API接口

### 接口统计
- **认证接口**: 3个
- **员工管理**: 7个
- **公众号管理**: 7个
- **推广管理**: 6个
- **关注管理**: 7个
- **微信回调**: 2个
- **统计数据**: 6个

**总计：38个API接口**

### 核心接口示例

#### 1. 管理员登录
```
POST /api/auth/login
Body: {
  "username": "admin",
  "password": "admin123"
}
Response: {
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt_token",
    "user": {...}
  }
}
```

#### 2. 创建推广记录
```
POST /api/promotion/create
Headers: Authorization: Bearer {token}
Body: {
  "employee_id": "EMP001",
  "account_id": 1,
  "description": "推广描述"
}
Response: {
  "code": 200,
  "data": {
    "scene_str": "emp_EMP001_1234567890",
    "qr_image": "二维码图片URL"
  }
}
```

#### 3. 获取统计数据
```
GET /api/stats/overview
Headers: Authorization: Bearer {token}
Response: {
  "code": 200,
  "data": {
    "employees": {...},
    "accounts": {...},
    "promotions": {...},
    "follows": {...}
  }
}
```

## 🔐 认证机制

### JWT认证流程
1. 用户登录验证成功
2. 生成JWT token（包含用户信息）
3. 客户端存储token
4. 后续请求携带token
5. 服务端验证token有效性

### 权限控制
- **admin**: 管理员，拥有所有权限
- **普通用户**: 只读权限（可扩展）

## 🎨 微信集成

### 微信API服务
```typescript
class WechatService {
  - getAccessToken(): 获取访问令牌
  - createQrCode(): 创建带参数二维码
  - getUserInfo(): 获取用户信息
  - getFollowerList(): 获取关注者列表
  - batchGetUserInfo(): 批量获取用户信息
  - sendCustomMessage(): 发送客服消息
}
```

### 微信回调处理
1. **服务器验证**: 签名验证
2. **事件处理**:
   - subscribe（关注）
   - unsubscribe（取消关注）
   - SCAN（扫码）
3. **场景值解析**: 提取员工ID
4. **数据关联**: 更新推广和关注记录

## 📊 统计功能

### 统计维度
1. **概览统计**: 员工、公众号、推广、关注总数
2. **排行榜**: 员工排行、公众号排行
3. **趋势分析**: 时间段趋势（日/周/月）
4. **详细统计**: 员工详情、公众号详情

### 统计指标
- 推广数量
- 扫码次数
- 关注数量
- 取关数量
- 留存率
- 活跃度

## 🚀 部署指南

### 开发环境
```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env

# 3. 初始化数据库
mysql -u root -p < src/config/init.sql

# 4. 初始化管理员
npm run init-admin

# 5. 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 1. 构建项目
npm run build

# 2. 启动服务
npm start

# 3. 使用PM2管理（推荐）
pm2 start dist/app.js --name wechat-backend
```

## 📝 开发规范

### 代码风格
- 使用TypeScript类型注解
- 遵循RESTful API设计
- 统一的错误处理
- 结构化日志记录
- 模块化组织

### 命名规范
- 文件名：小写+短横线（user-service.ts）
- 类名：大驼峰（UserService）
- 方法名：小驼峰（getUserInfo）
- 常量：全大写（API_BASE_URL）

### 错误处理
```typescript
// 使用ApiError抛出业务错误
throw new ApiError(400, '参数错误');

// 错误会被统一处理中间件捕获
// 返回统一的错误响应格式
```

## 🧪 测试

### API测试
```bash
# 运行API测试脚本
npx ts-node src/scripts/testApi.ts
```

### 手动测试
1. 使用Postman导入API集合
2. 配置环境变量（token等）
3. 逐个测试接口
4. 验证响应数据

## ⚡ 性能优化

### 已实现
- 数据库连接池
- 索引优化（主键、外键）
- 分页查询
- JWT token缓存

### 待优化
- Redis缓存
- 查询结果缓存
- 接口响应压缩
- 数据库读写分离

## 🔒 安全措施

### 已实现
- 密码哈希存储（bcrypt）
- JWT认证
- SQL参数化查询
- 环境变量隔离

### 待加强
- 请求频率限制
- HTTPS强制
- SQL注入防护增强
- XSS防护

## 📈 监控和日志

### 日志系统
- **日志级别**: error, warn, info, debug
- **日志输出**: 控制台 + 文件
- **日志轮转**: 按大小分割（5MB）
- **日志保留**: 最多5个文件

### 日志内容
- 请求日志
- 错误日志
- 业务日志
- 性能日志

## 🎉 项目亮点

1. **完整的TypeScript类型系统**
2. **模块化的项目架构**
3. **RESTful API设计**
4. **统一的错误处理**
5. **结构化日志系统**
6. **完整的微信API封装**
7. **丰富的统计分析功能**
8. **详细的文档和注释**

## 📚 相关文档

- [README.md](./README.md) - 项目说明
- [PROGRESS.md](./PROGRESS.md) - 开发进度
- [.env.example](./.env.example) - 环境配置

## 🔄 后续计划

### 短期（1-2周）
- [ ] 完善微信API集成
- [ ] 实现数据导出功能
- [ ] 添加输入验证
- [ ] 完善单元测试

### 中期（1个月）
- [ ] 性能优化
- [ ] 安全增强
- [ ] API文档自动生成
- [ ] Docker容器化

### 长期（3个月）
- [ ] 微服务拆分
- [ ] 消息队列集成
- [ ] 分布式缓存
- [ ] 监控告警系统

## 👥 团队

- **后端开发**: 系统开发团队
- **技术栈**: Node.js + TypeScript + MySQL
- **开发周期**: 2026-03-09
- **当前版本**: v1.0.0

---

**文档版本**: v1.0  
**最后更新**: 2026-03-09  
**维护者**: 后端开发团队
