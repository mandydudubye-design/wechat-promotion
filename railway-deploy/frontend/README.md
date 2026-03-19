# 微信公众号推广追踪系统 - 前端应用

基于 React + TypeScript + Ant Design + Vite 构建的微信公众号推广效果追踪系统前端应用。

## 功能特性

- 🎯 **推广效果追踪** - 实时追踪每个员工的推广效果
- 📊 **数据可视化** - 图表展示推广趋势和排行
- 👥 **员工管理** - 员工信息管理、新增、编辑、删除
- 📱 **公众号管理** - 多公众号配置管理
- 📝 **推广记录** - 推广二维码生成和管理
- 📈 **统计分析** - 多维度统计数据展示
- 📥 **数据导出** - 支持导出Excel报表
- 🎨 **响应式设计** - 适配各种屏幕尺寸
- 🔐 **权限控制** - 基于JWT的身份验证

## 技术栈

- **框架**: React 18
- **语言**: TypeScript 5.x
- **构建工具**: Vite 5.x
- **UI框架**: Ant Design 5.x
- **状态管理**: React Hooks + Context API
- **路由**: React Router 6.x
- **HTTP客户端**: Axios
- **图表**: Recharts / ECharts
- **工具**: dayjs, classnames
- **代码规范**: ESLint + Prettier

## 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   │   ├── index.ts       # Axios配置
│   │   ├── auth.ts        # 认证API
│   │   ├── employees.ts   # 员工API
│   │   ├── accounts.ts    # 公众号API
│   │   ├── promotion.ts   # 推广API
│   │   ├── follow.ts      # 关注API
│   │   └── stats.ts       # 统计API
│   ├── assets/            # 资源文件
│   │   ├── images/        # 图片
│   │   └── styles/        # 样式文件
│   ├── components/        # 公共组件
│   │   ├── CommonHeader/  # 顶部导航
│   │   ├── CommonSider/   # 侧边栏
│   │   ├── Layout/        # 布局组件
│   │   ├── ProtectedRoute/ # 权限路由
│   │   └── LoadingSpinner/ # 加载组件
│   ├── hooks/             # 自定义Hooks
│   │   ├── useAuth.ts     # 认证Hook
│   │   └── usePagination.ts # 分页Hook
│   ├── pages/             # 页面组件
│   │   ├── Login/         # 登录页
│   │   ├── Dashboard/     # 仪表盘
│   │   ├── Employees/     # 员工管理
│   │   │   ├── index.tsx      # 员工列表
│   │   │   ├── EmployeeForm.tsx  # 员工表单
│   │   │   └── EmployeeDetail.tsx # 员工详情
│   │   ├── Accounts/      # 公众号管理
│   │   ├── Promotion/     # 推广记录
│   │   ├── Follows/       # 关注记录
│   │   └── Stats/         # 统计分析
│   ├── types/             # 类型定义
│   │   └── index.ts       # 全局类型
│   ├── utils/             # 工具函数
│   │   ├── request.ts     # 请求封装
│   │   ├── format.ts      # 格式化工具
│   │   └── constants.ts   # 常量定义
│   ├── App.tsx            # 根组件
│   ├── main.tsx           # 入口文件
│   └── vite-env.d.ts      # Vite类型声明
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── .eslintrc.cjs          # ESLint配置
├── .prettierrc            # Prettier配置
├── index.html             # HTML模板
├── package.json
├── tsconfig.json          # TypeScript配置
├── tsconfig.node.json     # Node TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目文档
```

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.development` 文件：

```env
# API基础URL
VITE_API_BASE_URL=http://localhost:3000/api

# 应用标题
VITE_APP_TITLE=微信公众号推广追踪系统

# 默认分页大小
VITE_PAGE_SIZE=10
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

## 使用指南

### 登录系统

1. 访问系统首页
2. 输入默认账号：
   - 用户名: `admin`
   - 密码: `admin123`
3. 点击"登录"按钮
4. 登录成功后进入仪表盘

### 功能模块

#### 1. 仪表盘

展示系统总体数据和关键指标：
- 员工总数、公众号总数、推广总数、关注总数
- 员工推广排行
- 关注趋势图表
- 最近推广记录

#### 2. 员工管理

**查看员工列表**
- 支持分页浏览
- 支持关键词搜索
- 显示员工基本信息和推广统计

**新增员工**
- 点击"新增员工"按钮
- 填写员工信息（ID、姓名、部门、电话）
- 点击"确定"保存

**编辑员工**
- 点击操作列的"编辑"按钮
- 修改员工信息
- 点击"确定"保存

**删除员工**
- 点击操作列的"删除"按钮
- 确认删除操作

**导出数据**
- 点击"导出"按钮
- 选择导出格式（Excel）
- 下载文件

**查看详情**
- 点击员工姓名
- 查看员工详细信息和推广记录

#### 3. 公众号管理

**查看公众号列表**
- 显示所有配置的公众号
- 显示推广统计信息

**新增公众号**
- 填写公众号信息
- 配置AppID和AppSecret
- 保存配置

**编辑公众号**
- 修改公众号配置
- 更新API密钥

**删除公众号**
- 删除不再使用的公众号

#### 4. 推广记录

**查看推广记录**
- 按员工、公众号筛选
- 显示二维码、扫码数、关注数
- 支持分页浏览

**生成推广二维码**
- 选择员工和公众号
- 系统自动生成唯一场景值
- 生成推广二维码

**管理二维码**
- 下载二维码图片
- 复制推广链接
- 查看扫码和关注统计

#### 5. 关注记录

**查看关注记录**
- 按员工、公众号、时间筛选
- 显示关注者信息
- 显示关注/取消关注时间

**数据筛选**
- 按日期范围筛选
- 按员工筛选
- 按公众号筛选

**导出数据**
- 导出关注记录
- 生成Excel报表

#### 6. 统计分析

**总览统计**
- 系统整体数据概览
- 各维度统计数据

**员工统计**
- 员工推广排行
- 推广趋势分析
- 关注转化率

**公众号统计**
- 公众号推广对比
- 关注来源分析
- 趋势图表

**自定义报表**
- 选择时间范围
- 选择统计维度
- 生成可视化报表

## API接口

所有API请求都通过 `src/api/` 目录下的模块进行。

### 认证API

```typescript
import { login, logout, getCurrentUser } from '@/api/auth';

// 登录
const response = await login({ username, password });

// 登出
await logout();

// 获取当前用户
const user = await getCurrentUser();
```

### 员工API

```typescript
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getEmployeeDetail 
} from '@/api/employees';

// 获取员工列表
const employees = await getEmployees({ page: 1, pageSize: 10 });

// 创建员工
await createEmployee({ employee_id: 'EMP001', name: '张三' });

// 更新员工
await updateEmployee('EMP001', { name: '李四' });

// 删除员工
await deleteEmployee('EMP001');

// 获取员工详情
const detail = await getEmployeeDetail('EMP001');
```

### 统计API

```typescript
import { 
  getOverviewStats, 
  getEmployeeStats, 
  getAccountStats 
} from '@/api/stats';

// 获取总览统计
const overview = await getOverviewStats();

// 获取员工统计
const stats = await getEmployeeStats();
```

## 组件使用

### 布局组件

```tsx
import { Layout } from '@/components/Layout';

function App() {
  return (
    <Layout>
      {/* 页面内容 */}
    </Layout>
  );
}
```

### 权限路由

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

### 表格组件

```tsx
import { Table } from 'antd';

function EmployeeList() {
  const columns = [
    { title: '员工ID', dataIndex: 'employee_id', key: 'employee_id' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '部门', dataIndex: 'department', key: 'department' },
  ];

  return (
    <Table 
      dataSource={employees} 
      columns={columns} 
      rowKey="employee_id"
    />
  );
}
```

### 表单组件

```tsx
import { Form, Input, Button } from 'antd';

function EmployeeForm() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('表单值:', values);
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">提交</Button>
    </Form>
  );
}
```

## 样式定制

### 主题配置

在 `src/assets/styles/theme.ts` 中配置主题：

```typescript
export const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    fontSize: 14,
    borderRadius: 6,
  },
};
```

### 全局样式

在 `src/assets/styles/global.css` 中定义全局样式：

```css
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --error-color: #f5222d;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}
```

## 状态管理

### 使用Context API

```tsx
import { AuthProvider, useAuth } from '@/hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 路由配置 */}
      </Routes>
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>欢迎, {user?.username}</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

### 自定义Hooks

```tsx
import { usePagination } from '@/hooks/usePagination';

function EmployeeList() {
  const { 
    data, 
    loading, 
    page, 
    pageSize, 
    total,
    handleChange 
  } = usePagination(getEmployees);

  return (
    <Table 
      dataSource={data}
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: handleChange,
      }}
    />
  );
}
```

## 错误处理

### 全局错误处理

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div>
      <h2>出错了!</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* 应用内容 */}
    </ErrorBoundary>
  );
}
```

### API错误处理

```tsx
import { message } from 'antd';

async function handleApiCall() {
  try {
    const response = await api.getData();
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      message.error('未授权，请重新登录');
      // 跳转到登录页
    } else if (error.response?.status === 500) {
      message.error('服务器错误，请稍后重试');
    } else {
      message.error(error.message || '请求失败');
    }
  }
}
```

## 性能优化

### 代码分割

```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
```

### 虚拟滚动

```tsx
import { List } from 'react-virtualized';

function VirtualList({ items }) {
  return (
    <List
      width={800}
      height={600}
      rowCount={items.length}
      rowHeight={50}
      rowRenderer={({ index, key, style }) => (
        <div key={key} style={style}>
          {items[index].name}
        </div>
      )}
    />
  );
}
```

### 记忆化

```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, value: item.value * 2 }));
  }, [data]);

  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <div onClick={handleClick}>{/* ... */}</div>;
});
```

## 测试

### 单元测试

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### 集成测试

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from './Login';

test('submits login form', () => {
  render(<Login />);
  
  const usernameInput = screen.getByLabelText('用户名');
  const passwordInput = screen.getByLabelText('密码');
  const submitButton = screen.getByText('登录');

  fireEvent.change(usernameInput, { target: { value: 'admin' } });
  fireEvent.change(passwordInput, { target: { value: 'admin123' } });
  fireEvent.click(submitButton);

  // 验证登录逻辑
});
```

## 部署

### 构建生产版本

```bash
npm run build
```

### 部署到Nginx

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
    }
}
```

### 部署到Vercel

```bash
npm install -g vercel
vercel --prod
```

### Docker部署

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 常见问题

### 开发环境问题

**Q: Vite启动失败？**

A: 检查Node.js版本是否满足要求，尝试删除node_modules重新安装。

**Q: API请求失败？**

A: 检查 `.env.development` 中的 `VITE_API_BASE_URL` 是否正确。

### 构建问题

**Q: 构建后页面空白？**

A: 检查路由配置，确保使用basename正确配置。

**Q: 静态资源404？**

A: 检查vite.config.ts中的base配置。

### 运行时问题

**Q: 登录后刷新页面退出登录？**

A: 检查token存储和读取逻辑，确保localStorage正常工作。

**Q: 图表不显示？**

A: 检查数据格式是否正确，确保图表容器有高度。

## 最佳实践

1. **代码规范**
   - 遵循ESLint规则
   - 使用Prettier格式化代码
   - 编写有意义的注释

2. **性能优化**
   - 使用React.memo避免不必要的渲染
   - 使用useMemo和useCallback优化性能
   - 懒加载路由组件

3. **安全实践**
   - 不要在前端存储敏感信息
   - 使用HTTPS通信
   - 验证所有用户输入

4. **用户体验**
   - 添加加载状态提示
   - 提供错误反馈
   - 优化响应速度

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: support@example.com

---

**注意**: 本系统仅供学习和研究使用，请遵守相关法律法规和微信平台规则。
