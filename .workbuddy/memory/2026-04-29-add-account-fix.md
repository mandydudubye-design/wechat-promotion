## 公众号添加失败问题修复

### 问题
在公众号管理页面添加公众号时，提示"添加失败: Internal Server Error"。

### 原因分析
1. **API 调用方法参数错误**：`accountApi.getList` 试图向 `api.get` 方法传递两个参数（endpoint 和 query string），但 `api.get` 方法只接受一个参数
2. **后端错误处理不完善**：后端没有详细的日志，难以定位问题
3. **数据库字段可能为空**：前端未发送的字段（如 `description`、`avatar`）在后端解构时为 `undefined`，可能导致 SQL 插入失败

### 修复内容

#### 1. 修复前端 API 调用
**文件**：`admin-frontend/src/lib/api.ts`
- 修改 `accountApi.getList` 方法：
  - 将查询参数拼接到 endpoint 字符串中
  - 调用 `api.get` 时只传递一个完整的 URL
- 修复前：`api.get('/accounts', '?status=1')`（第二个参数被忽略）
- 修复后：`api.get('/accounts?status=1')`（查询参数拼接到 endpoint）

#### 2. 增强后端错误处理
**文件**：`backend/src/routes/accounts.ts`
- 在 `POST /api/accounts` 添加请求体日志：`console.log('添加公众号请求体:', req.body)`
- 在 catch 块添加详细错误日志：`console.error('添加公众号失败:', error)`
- 处理可能为空的字段：
  - `wechat_id`：`|| null`
  - `app_secret`：`|| ''`（不能为 NULL，因为有 NOT NULL 约束）
  - `qr_code_url`：`|| null`
  - `description`：`|| null`
  - `avatar`：`|| null`
- 修改 `verified` 字段处理：`verified ? 1 : 0`（boolean → 0/1）

### 修复后的代码
**前端 API 调用**：
```typescript
getList: (params?: { status?: number }) => {
  const query = params?.status !== undefined ? `?status=${params.status}` : '';
  return api.get<ApiResponse<any[]>>(`/accounts${query}`);
}
```

**后端添加公众号**：
```typescript
await pool.query(
  `INSERT INTO wechat_account_configs (account_name, wechat_id, app_id, app_secret, account_type, verified, qr_code_url, description, avatar)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [account_name, wechat_id || null, app_id, app_secret || '', account_type || 'service', verified ? 1 : 0, qr_code_url || null, description || null, avatar || null]
);
```

### 当前状态
- ✅ 前端 API 调用已修复
- ✅ 后端错误处理已增强
- ✅ 后端服务已重启

### 测试步骤
1. 刷新页面 http://localhost:5175/accounts
2. 点击"添加公众号"
3. 填写表单（必填：名称、AppID）
4. 点击"确认"
5. 查看是否成功添加
6. 如果失败，打开浏览器控制台和后端日志查看详细错误信息

### 调试方法
1. **前端调试**：打开浏览器控制台（F12），查看网络请求和错误信息
2. **后端调试**：查看后端控制台输出，应该看到：
   - "添加公众号请求体: {...}"
   - 如果失败："添加公众号失败: {...}"
3. **数据库检查**：检查 `wechat_account_configs` 表中是否正确插入数据

### 常见错误
1. **AppID 重复**：如果 AppID 已存在，会返回 400 错误"AppID已存在"
2. **必填字段缺失**：如果名称或 AppID 为空，会返回 400 错误"公众号名称和AppID不能为空"
3. **数据库连接失败**：如果数据库无法连接，会返回 500 错误"Internal Server Error"
