# 员工身份识别系统 - 使用指南

## 🎯 功能说明

员工身份识别系统用于识别公众号的关注者中哪些是本公司员工。

### 核心功能

1. **员工身份绑定** - 将微信账号与员工身份关联
2. **验证码验证** - 通过手机号验证员工身份
3. **管理员手动绑定** - 管理员可手动绑定员工
4. **绑定状态查询** - 查询微信账号是否已绑定员工

## 📋 使用场景

### 场景1：内部员工关注

**需求**：统计公司内部有多少员工关注了公众号

**解决方案**：
1. 员工关注公众号后，在H5页面填写手机号验证
2. 系统验证手机号并绑定员工身份
3. 后台可查看员工关注统计

### 场景2：推广效果追踪

**需求**：追踪每个员工推广带来的关注用户

**解决方案**：
1. 每个员工有专属推广二维码
2. 用户扫码关注后自动记录推广归属
3. **不需要**用户是员工

## 🔄 识别流程

### 自动识别流程（推荐）

```
用户扫码关注 
    ↓
公众号推送关注事件（带 scene_str）
    ↓
后端识别是哪个员工推广的
    ↓
保存关注记录（employee_id, openid, nickname）
    ↓
【可选】用户在H5页面验证员工身份
    ↓
更新员工绑定关系
```

### 手动识别流程

```
管理员查看关注列表
    ↓
根据昵称/手机号识别员工
    ↓
管理员手动绑定员工身份
    ↓
更新统计
```

## 🔧 部署步骤

### 1. 创建数据表

```bash
cd C:\公众号任务\backend
mysql -u root -p wechat_promotion < sql/employee_binding.sql
```

### 2. 注册路由

在 `backend/src/app.ts` 中添加：

```typescript
import employeeBindingRouter from './routes/employeeBinding';

app.use('/api/employee-binding', employeeBindingRouter);
```

### 3. 修改关注记录表（可选）

如果需要在关注记录中标记是否是员工：

```sql
ALTER TABLE follow_records 
ADD COLUMN is_employee BOOLEAN DEFAULT FALSE COMMENT '是否是员工' AFTER status,
ADD INDEX idx_is_employee (is_employee);
```

## 📱 H5页面集成

### 方式1：验证码验证（推荐）

在员工H5页面添加身份验证功能：

```typescript
// 1. 发送验证码
POST /api/employee-binding/send-code
{
  "phone": "13800138000"
}

// 2. 验证码验证
POST /api/employee-binding/verify-code
{
  "phone": "13800138000",
  "code": "123456",
  "openid": "用户openid"
}
```

### 方式2：直接绑定（需提供员工ID）

```typescript
POST /api/employee-binding/bind
{
  "employee_id": "EMP001",
  "phone": "13800138000",
  "openid": "用户openid",
  "nickname": "微信昵称",
  "avatar": "头像URL"
}
```

### 方式3：查询绑定状态

```typescript
GET /api/employee-binding/status/{openid}
```

## 🎨 前端页面示例

### 员工验证页面

```tsx
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

function EmployeeVerification() {
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  const sendCode = async (phone: string) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/employee-binding/send-code', { phone });
      message.success('验证码已发送');
      setCodeSent(true);
      
      // 倒计时
      let count = 60;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(timer);
          setCodeSent(false);
        }
      }, 1000);
    } catch (error) {
      message.error('发送失败，请检查手机号');
    } finally {
      setLoading(false);
    }
  };

  // 验证
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // 从URL或localStorage获取openid
      const openid = localStorage.getItem('openid') || '';
      
      await axios.post('/api/employee-binding/verify-code', {
        phone: values.phone,
        code: values.code,
        openid,
      });
      
      message.success('验证成功！您已绑定员工身份');
      // 跳转到首页
      window.location.href = '/';
    } catch (error) {
      message.error('验证失败，请检查验证码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>员工身份验证</h2>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item 
          name="phone" 
          label="手机号"
          rules={[{ required: true, message: '请输入手机号' }]}
        >
          <Input placeholder="请输入登记的手机号" />
        </Form.Item>
        
        <Form.Item 
          name="code" 
          label="验证码"
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input placeholder="请输入验证码" />
            <Button 
              onClick={() => sendCode('phone')}
              disabled={codeSent || countdown > 0}
            >
              {codeSent ? `${countdown}秒后重试` : '发送验证码'}
            </Button>
          </div>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            验证
          </Button>
        </Form.Item>
      </Form>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
        <p>说明：</p>
        <ul>
          <li>验证后将绑定您的员工身份</li>
          <li>可享受员工专属权益</li>
          <li>手机号必须是公司登记的手机号</li>
        </ul>
      </div>
    </div>
  );
}

export default EmployeeVerification;
```

## 📊 统计查询

### 查询员工关注率

```sql
-- 总员工数
SELECT COUNT(*) as total_employees FROM employees WHERE status = 1;

-- 已关注员工数
SELECT COUNT(DISTINCT eb.employee_id) as followed_employees 
FROM employee_bindings eb
WHERE eb.is_verified = TRUE;

-- 员工关注率
SELECT 
  (SELECT COUNT(*) FROM employees WHERE status = 1) as total_employees,
  (SELECT COUNT(DISTINCT employee_id) FROM employee_bindings WHERE is_verified = TRUE) as followed_employees,
  ROUND(
    (SELECT COUNT(DISTINCT employee_id) FROM employee_bindings WHERE is_verified = TRUE) * 100.0 /
    (SELECT COUNT(*) FROM employees WHERE status = 1),
    2
  ) as follow_rate;
```

### 查看未关注员工

```sql
SELECT e.employee_id, e.name, e.department, e.phone
FROM employees e
WHERE e.status = 1
  AND e.employee_id NOT IN (
    SELECT DISTINCT employee_id FROM employee_bindings WHERE is_verified = TRUE
  );
```

## ⚠️ 注意事项

1. **手机号验证**：需要员工在系统中登记了手机号
2. **短信服务**：需要接入短信服务商（阿里云、腾讯云等）
3. **企业微信**：如果是企业微信，可以使用 `unionid` 更方便地识别员工
4. **隐私保护**：员工信息敏感，需要做好权限控制

## 🚀 扩展功能

### 1. 企业微信集成

如果是企业微信公众号，可以通过 `unionid` 自动识别：

```typescript
// 微信事件处理中
if (msg.MsgType === 'event' && msg.Event === 'subscribe') {
  const { FromUserName: openid, EventKey: scene_str } = msg;
  
  // 获取用户信息（包含unionid）
  const userInfo = await wechatService.getUserInfo(openid);
  
  // 如果有unionid，自动查找员工
  if (userInfo.unionid) {
    const [employees] = await pool.query(
      'SELECT employee_id FROM employees WHERE wechat_unionid = ?',
      [userInfo.unionid]
    );
    
    if (employees.length > 0) {
      // 自动绑定
      await pool.query(
        'INSERT INTO employee_bindings (employee_id, openid, unionid, is_verified, verified_at) VALUES (?, ?, ?, TRUE, NOW())',
        [employees[0].employee_id, openid, userInfo.unionid]
      );
    }
  }
}
```

### 2. 批量导入员工绑定

```typescript
// 管理员批量导入
POST /api/employee-binding/admin/batch-bind
{
  "bindings": [
    { "employee_id": "EMP001", "openid": "oxxx1" },
    { "employee_id": "EMP002", "openid": "oxxx2" },
  ]
}
```

## 📞 获取帮助

如有问题，请查看：
- [后端文档](../backend/README.md)
- [API文档](../backend/API_DOCS.md)
- [常见问题](../QUICK_START.md)
