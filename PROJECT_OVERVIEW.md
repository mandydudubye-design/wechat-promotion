# 公众号推广追踪系统 - 项目总览

## 项目架构

本系统包含三个前端应用：

### 1. 管理后台（Admin Frontend）
- **端口**: 5175
- **目录**: `admin-frontend/`
- **用户**: 国企行政负责人/管理员
- **技术栈**: React + TypeScript + Vite + TailwindCSS
- **功能**:
  - 员工管理（增删改查）
  - 关注状态查询
  - 推广数据统计
  - 报表导出
  - 数据可视化

### 2. 员工端H5（Employee H5）
- **端口**: 5176
- **目录**: `employee-h5/`
- **用户**: 组织内部员工
- **技术栈**: React + TypeScript + Vite + Ant Design Mobile
- **功能**:
  - 账号绑定
  - 我的推广码
  - 推广榜单
  - 推广记录
  - 个人中心
  - 帮助说明

### 3. 数据大屏（待开发）
- **用户**: 管理层
- **功能**: 大屏数据展示，实时监控

## 快速启动

### 启动管理后台
```bash
cd admin-frontend
npm run dev
```
访问: http://localhost:5175

### 启动员工端H5
```bash
cd employee-h5
npm run dev
```
访问: http://localhost:5176

## 项目状态

### ✅ 已完成
- [x] 管理后台 - 所有页面和功能
- [x] 员工端H5 - 所有页面和UI
- [x] 模拟数据和类型定义
- [x] 响应式设计和移动端适配

### 🚧 进行中
- [ ] 后端API开发
- [ ] 微信公众号集成
- [ ] 数据库设计

### 📋 待开发
- [ ] 数据大屏
- [ ] 单元测试
- [ ] 性能优化

## 技术栈对比

| 技术 | 管理后台 | 员工端H5 |
|------|---------|----------|
| 框架 | React 19 | React 19 |
| 语言 | TypeScript | TypeScript |
| 构建工具 | Vite | Vite |
| UI组件库 | TailwindCSS | Ant Design Mobile |
| 图标库 | Lucide React | Ant Design Icons |
| 二维码 | QRCode.react | QRCode.react |
| 路由 | React Router | React Router |
| 状态管理 | React Hooks | React Hooks |

## 数据流

```
用户扫码
  ↓
公众号后台
  ↓
推广追踪系统后端
  ↓
┌─────────────┬─────────────┐
│  管理后台   │  员工端H5   │
│  (管理员)   │  (员工)     │
└─────────────┴─────────────┘
```

## 开发规范

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 命名规范
- 组件文件：PascalCase（如 Dashboard.tsx）
- 样式文件：PascalCase.css（如 Dashboard.css）
- 工具函数：camelCase（如 formatDateTime）
- 常量：UPPER_SNAKE_CASE（如 API_BASE_URL）

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 部署计划

### 开发环境
- 管理后台: http://localhost:5175
- 员工端H5: http://localhost:5176

### 生产环境
- 管理后台: 待定
- 员工端H5: 需要配置到微信公众号菜单

## 测试账号

### 管理后台
- 用户名: admin
- 密码: admin123

### 员工端H5
- 工号: EMP001
- 姓名: 张三
- 手机: 13800138000

## 联系方式

- 项目负责人: [待填写]
- 技术支持: [待填写]
- 业务咨询: [待填写]

## 更新日志

### 2024-03-10
- ✅ 完成管理后台所有页面开发
- ✅ 完成员工端H5所有页面开发
- ✅ 修复所有TypeScript编译错误
- ✅ 配置开发服务器和构建流程
- 📋 准备开始后端API开发
