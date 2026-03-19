# 快速启动指南

## 🚀 5分钟快速启动

### 前置要求
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 步骤1：安装依赖
```bash
cd backend
npm install
```

### 步骤2：配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，修改以下配置：
# - 数据库连接信息
# - JWT密钥
# - 微信公众号配置
```

### 步骤3：创建数据库
```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE wechat_promotion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入初始化脚本
USE wechat_promotion;
SOURCE src/config/init.sql;
```

### 步骤4：初始化管理员账号
```bash
npm run init-admin
```

默认账号：
- 用户名：`admin`
- 密码：`admin123`

### 步骤5：启动服务器
```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 步骤6：测试API
```bash
# 新开一个终端
npx ts-node src/scripts/testApi.ts
```

## 📝 可用命令

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 初始化管理员账号
npm run init-admin

# 测试API
npx ts-node src/scripts/testApi.ts
```

## 🧪 测试接口

### 1. 健康检查
```bash
curl http://localhost:3000/health
```

### 2. 管理员登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. 获取员工列表（需要token）
```bash
curl http://localhost:3000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 常见问题

### 问题1：数据库连接失败
**解决方案**：
- 检查MySQL是否运行
- 检查.env中的数据库配置
- 确认数据库已创建

### 问题2：端口被占用
**解决方案**：
- 修改.env中的PORT配置
- 或者停止占用3000端口的程序

### 问题3：依赖安装失败
**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题4：TypeScript编译错误
**解决方案**：
```bash
# 重新构建
npm run build

# 或者使用ts-node直接运行
npm run dev
```

## 📖 下一步

1. 阅读 [README.md](./README.md) 了解项目详情
2. 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解技术架构
3. 查看 [PROGRESS.md](./PROGRESS.md) 了解开发进度
4. 开始开发你的功能！

## 🎯 开发建议

### IDE推荐
- VS Code + TypeScript插件
- WebStorm

### 有用的VS Code插件
- ESLint
- Prettier
- TypeScript Importer
- Thunder Client（API测试）

### Git工作流
```bash
# 创建功能分支
git checkout -b feature/your-feature

# 提交代码
git add .
git commit -m "feat: add your feature"

# 推送分支
git push origin feature/your-feature
```

---

**祝你开发愉快！** 🎉
