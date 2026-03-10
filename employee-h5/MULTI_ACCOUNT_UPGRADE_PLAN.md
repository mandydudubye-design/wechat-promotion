# 多公众号支持升级方案

## 📋 需求分析

### 当前问题
- ❌ 只支持单一公众号
- ❌ 无法区分不同公众号的推广数据
- ❌ 员工只能推广一个公众号
- ❌ 数据统计维度单一

### 升级目标
- ✅ 支持管理多个公众号
- ✅ 区分每个公众号的推广数据
- ✅ 员工可选择不同公众号进行推广
- ✅ 多维度数据统计分析

## 🎯 核心功能设计

### 1. 公众号管理
#### 后端功能
- 公众号CRUD操作
- 公众号配置信息（AppID、AppSecret等）
- 公众号启用/禁用状态
- 公众号推广权限设置

#### 前端功能
- 公众号列表展示
- 公众号选择器
- 公众号切换功能
- 公众号专属二维码

### 2. 数据结构扩展
#### 员工数据
```typescript
interface Employee {
  employeeId: string;
  name: string;
  phone: string;
  department: string;
  enabledAccounts: string[];  // 可推广的公众号列表
  defaultAccountId?: string;  // 默认公众号
}
```

#### 公众号数据
```typescript
interface Account {
  accountId: string;
  accountName: string;
  appId: string;
  avatar: string;
  qrcodeUrl: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
```

#### 推广记录
```typescript
interface PromotionRecord {
  id: string;
  employeeId: string;
  accountId: string;  // 新增：公众号ID
  prospectPhone: string;
  status: 'followed' | 'not_followed';
  scanTime: string;
  followTime?: string;
  source: 'qrcode' | 'link';
}
```

### 3. 页面功能改造

#### 首页改造
```typescript
// 新增功能
- 公众号选择器（顶部切换）
- 当前公众号展示
- 分公众号数据统计
- 多公众号二维码管理
```

#### 推广记录页
```typescript
// 新增功能
- 公众号筛选器
- 分公众号记录展示
- 公众号维度统计
- 跨公众号汇总统计
```

#### 排行榜页
```typescript
// 新增功能
- 公众号维度排行
- 总排名（所有公众号）
- 单公众号排名切换
```

#### 个人中心
```typescript
// 新增功能
- 管理的公众号列表
- 公众号推广权限
- 各公众号数据概览
```

## 🗄️ 数据库设计

### 新增表：公众号表
```sql
CREATE TABLE accounts (
  id VARCHAR(50) PRIMARY KEY,
  account_name VARCHAR(100) NOT NULL,
  app_id VARCHAR(100) UNIQUE NOT NULL,
  app_secret VARCHAR(200) NOT NULL,
  avatar VARCHAR(500),
  qrcode_url VARCHAR(500),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);
```

### 修改：员工表
```sql
ALTER TABLE employees
ADD COLUMN enabled_accounts JSON COMMENT '可推广的公众号ID列表',
ADD COLUMN default_account_id VARCHAR(50) COMMENT '默认公众号ID';

ALTER TABLE employees
ADD FOREIGN KEY (default_account_id) REFERENCES accounts(id);
```

### 修改：推广记录表
```sql
ALTER TABLE promotion_records
ADD COLUMN account_id VARCHAR(50) NOT NULL COMMENT '公众号ID',
ADD INDEX idx_account_id (account_id);

ALTER TABLE promotion_records
ADD FOREIGN KEY (account_id) REFERENCES accounts(id);
```

### 新增：员工-公众号关联表
```sql
CREATE TABLE employee_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  account_id VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_employee_account (employee_id, account_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_account_id (account_id)
);
```

## 📱 UI/UX设计

### 1. 公众号选择器
```
┌─────────────────────────────────────┐
│  📱 选择公众号          ▼           │
└─────────────────────────────────────┘
点击后显示：
┌─────────────────────────────────────┐
│  ● 公众号A                          │
│  ○ 公众号B                          │
│  ○ 公众号C                          │
└─────────────────────────────────────┘
```

### 2. 首页布局调整
```
┌─────────────────────────────────────┐
│  📱 选择公众号          ▼           │
├─────────────────────────────────────┤
│  当前：公众号A                      │
│  [统计数据卡片]                     │
│  [二维码] - 公众号A专属             │
├─────────────────────────────────────┤
│  功能菜单                           │
│  - 推广记录（含公众号筛选）         │
│  - 排行榜（含公众号筛选）           │
└─────────────────────────────────────┘
```

### 3. 推广记录页
```
┌─────────────────────────────────────┐
│  ← 推广记录                         │
├─────────────────────────────────────┤
│  公众号: 全部 ▼  状态: 全部 ▼      │
├─────────────────────────────────────┤
│  [统计卡片 - 支持公众号筛选]        │
├─────────────────────────────────────┤
│  记录列表                           │
│  - 公众号A | 张三 | 已关注          │
│  - 公众号B | 李四 | 未关注          │
└─────────────────────────────────────┘
```

## 🔧 技术实现方案

### 阶段一：数据层扩展（1-2天）
1. ✅ 数据库表结构升级
2. ✅ TypeScript类型定义扩展
3. ✅ API接口扩展
4. ✅ Mock数据更新

### 阶段二：后端开发（2-3天）
1. ✅ 公众号管理接口
2. ✅ 多公众号数据查询
3. ✅ 跨公众号统计接口
4. ✅ 权限验证逻辑

### 阶段三：前端开发（3-4天）
1. ✅ 公众号选择器组件
2. ✅ 首页改造（多公众号支持）
3. ✅ 推广记录页改造
4. ✅ 排行榜页改造
5. ✅ 个人中心改造

### 阶段四：测试与优化（1-2天）
1. ✅ 功能测试
2. ✅ 性能测试
3. ✅ UI/UX优化
4. ✅ Bug修复

## 📊 数据统计维度

### 员工维度
```typescript
interface EmployeeStats {
  // 单公众号数据
  accountStats: {
    [accountId: string]: {
      scanCount: number;
      followCount: number;
      rank: number;
    }
  };
  
  // 汇总数据
  totalStats: {
    scanCount: number;
    followCount: number;
    accountCount: number;
  };
}
```

### 公众号维度
```typescript
interface AccountStats {
  accountId: string;
  accountName: string;
  totalScans: number;
  totalFollows: number;
  totalEmployees: number;
  activeEmployees: number;
  topPerformers: Employee[];
}
```

### 时间维度
```typescript
interface TimeStats {
  today: Stats;
  week: Stats;
  month: Stats;
  year: Stats;
}
```

## 🎨 UI组件设计

### AccountSelector组件
```tsx
interface AccountSelectorProps {
  accounts: Account[];
  currentAccount: Account;
  onAccountChange: (account: Account) => void;
  showAvatar?: boolean;
  size?: 'small' | 'medium' | 'large';
}
```

### AccountStatsCard组件
```tsx
interface AccountStatsCardProps {
  account: Account;
  stats: AccountStats;
  onClick?: () => void;
}
```

### MultiAccountQRCode组件
```tsx
interface MultiAccountQRCodeProps {
  accounts: Account[];
  defaultAccount?: Account;
  onAccountSelect?: (account: Account) => void;
}
```

## 🔐 权限控制

### 员工权限
```typescript
interface EmployeePermission {
  employeeId: string;
  accounts: {
    [accountId: string]: {
      canPromote: boolean;
      canViewStats: boolean;
      canViewRanking: boolean;
    }
  };
}
```

### 权限验证
```typescript
function canEmployeePromoteAccount(
  employeeId: string,
  accountId: string
): boolean {
  // 检查员工是否有推广该公众号的权限
}

function getEmployeeAccounts(
  employeeId: string
): Account[] {
  // 获取员工可推广的公众号列表
}
```

## 🚀 实施建议

### 优先级排序
1. **高优先级**（必须）
   - ✅ 公众号选择器
   - ✅ 多公众号数据统计
   - ✅ 推广记录公众号筛选

2. **中优先级**（重要）
   - ✅ 排行榜多维度统计
   - ✅ 个人中心公众号管理
   - ✅ 多公众号二维码

3. **低优先级**（可选）
   - ○ 公众号对比分析
   - ○ 跨公众号数据导出
   - ○ 自定义统计报表

### 兼容性考虑
- ✅ 保持向后兼容（单一公众号模式）
- ✅ 渐进式升级（可选功能）
- ✅ 数据迁移方案

## 📝 配置示例

### 系统配置
```typescript
interface SystemConfig {
  multiAccountMode: boolean;
  defaultAccountId?: string;
  allowAccountSwitch: boolean;
  showAccountStats: boolean;
}
```

### 员工配置
```typescript
interface EmployeeConfig {
  employeeId: string;
  enabledAccounts: string[];
  defaultAccount: string;
  preferences: {
    autoSwitchAccount: boolean;
    showAllAccountsStats: boolean;
  };
}
```

## 🎯 预期效果

### 用户体验提升
- ✅ 灵活切换公众号
- ✅ 清晰的数据分类
- ✅ 更准确的绩效统计
- ✅ 更好的推广体验

### 管理效率提升
- ✅ 统一管理多个公众号
- ✅ 精准的数据分析
- ✅ 灵活的权限控制
- ✅ 高效的员工管理

## 📞 后续支持

如需实施此方案，建议：
1. 先确认需求细节
2. 评估现有代码结构
3. 制定详细开发计划
4. 分阶段实施测试
5. 逐步上线推广

预计开发周期：**7-10个工作日**
预计测试周期：**2-3个工作日**
总计：**2周左右**
