# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "timestamp": 1234567890,
  "data": { ... }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "timestamp": 1234567890,
  "errors": [ ... ]
}
```

---

## 认证接口

### 1. 管理员登录

**接口**: `POST /api/auth/login`

**请求头**:
```json
{
  "Content-Type": "application/json"
}
```

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "系统管理员",
      "role": "admin"
    }
  }
}
```

### 2. 获取当前用户信息

**接口**: `GET /api/auth/me`

**请求头**:
```json
{
  "Authorization": "Bearer {token}"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "系统管理员",
    "role": "admin"
  }
}
```

### 3. 修改密码

**接口**: `PUT /api/auth/password`

**请求头**:
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**请求体**:
```json
{
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}
```

---

## 员工管理接口

### 1. 获取员工列表

**接口**: `GET /api/employees`

**请求头**:
```json
{
  "Authorization": "Bearer {token}"
}
```

**查询参数**:
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `keyword`: 搜索关键词（姓名/员工ID/手机号）
- `department`: 部门
- `position`: 职位
- `bindStatus`: 绑定状态（0未绑定，1已绑定，2已禁用）

**示例**:
```
GET /api/employees?page=1&pageSize=20&keyword=张三
```

### 2. 获取员工详情

**接口**: `GET /api/employees/:employeeId`

**示例**:
```
GET /api/employees/EMP001
```

### 3. 添加员工

**接口**: `POST /api/employees`

**权限**: admin

**请求体**:
```json
{
  "employee_id": "EMP001",
  "name": "张三",
  "phone": "13800138000",
  "department": "技术部",
  "position": "工程师"
}
```

### 4. 更新员工信息

**接口**: `PUT /api/employees/:employeeId`

**权限**: admin

**请求体**:
```json
{
  "name": "张三",
  "phone": "13900139000",
  "department": "产品部",
  "position": "产品经理"
}
```

### 5. 禁用员工

**接口**: `PUT /api/employees/:employeeId/disable`

**权限**: admin

### 6. 启用员工

**接口**: `PUT /api/employees/:employeeId/enable`

**权限**: admin

### 7. 删除员工

**接口**: `DELETE /api/employees/:employeeId`

**权限**: admin

### 8. 导出员工数据

**接口**: `GET /api/employees/export`

**响应**: Excel文件

---

## 公众号管理接口

### 1. 获取公众号列表

**接口**: `GET /api/accounts`

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "account_name": "测试公众号",
      "app_id": "wx1234567890abcdef",
      "status": 1,
      "created_at": "2026-03-09T12:00:00.000Z"
    }
  ]
}
```

### 2. 获取公众号详情

**接口**: `GET /api/accounts/:id`

### 3. 添加公众号

**接口**: `POST /api/accounts`

**权限**: admin

**请求体**:
```json
{
  "account_name": "测试公众号",
  "app_id": "wx1234567890abcdef",
  "app_secret": "your_app_secret",
  "description": "公众号描述"
}
```

### 4. 更新公众号信息

**接口**: `PUT /api/accounts/:id`

**权限**: admin

### 5. 启用公众号

**接口**: `PUT /api/accounts/:id/enable`

**权限**: admin

### 6. 停用公众号

**接口**: `PUT /api/accounts/:id/disable`

**权限**: admin

### 7. 删除公众号

**接口**: `DELETE /api/accounts/:id`

**权限**: admin

---

## 推广管理接口

### 1. 获取推广记录列表

**接口**: `GET /api/promotion/records`

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `keyword`: 搜索关键词
- `employeeId`: 员工ID
- `accountId`: 公众号ID
- `startDate`: 开始日期
- `endDate`: 结束日期

### 2. 获取推广详情

**接口**: `GET /api/promotion/records/:id`

### 3. 创建推广记录

**接口**: `POST /api/promotion/create`

**请求体**:
```json
{
  "employee_id": "EMP001",
  "account_id": 1,
  "description": "推广活动描述"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "account_id": 1,
    "scene_str": "emp_EMP001_1234567890",
    "qr_image": "二维码图片URL",
    "scan_count": 0,
    "follow_count": 0
  }
}
```

### 4. 更新推广数据

**接口**: `PUT /api/promotion/records/:id/stats`

**请求体**:
```json
{
  "scan_count": 100,
  "follow_count": 50
}
```

### 5. 删除推广记录

**接口**: `DELETE /api/promotion/records/:id`

**权限**: admin

### 6. 获取推广统计

**接口**: `GET /api/promotion/stats`

**查询参数**:
- `employee_id`: 员工ID
- `account_id`: 公众号ID
- `start_date`: 开始日期
- `end_date`: 结束日期

**响应**:
```json
{
  "code": 200,
  "data": {
    "total": {
      "total_records": 100,
      "total_scans": 1000,
      "total_follows": 500
    },
    "employee_ranking": [...],
    "account_stats": [...],
    "time_trend": [...]
  }
}
```

### 7. 导出推广数据

**接口**: `GET /api/promotion/export`

**响应**: Excel文件

---

## 关注管理接口

### 1. 获取关注记录列表

**接口**: `GET /api/follow/records`

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `keyword`: 搜索关键词
- `employeeId`: 员工ID
- `accountId`: 公众号ID
- `status`: 关注状态（0已取关，1已关注）
- `startDate`: 开始日期
- `endDate`: 结束日期

### 2. 获取关注详情

**接口**: `GET /api/follow/records/:id`

### 3. 获取员工关注列表

**接口**: `GET /api/follow/employee/:employeeId`

### 4. 更新关注状态

**接口**: `PUT /api/follow/records/:id/status`

**请求体**:
```json
{
  "status": 1
}
```

### 5. 同步微信关注者列表

**接口**: `POST /api/follow/sync`

**权限**: admin

### 6. 获取关注统计

**接口**: `GET /api/follow/stats`

### 7. 导出关注数据

**接口**: `GET /api/follow/export`

**响应**: Excel文件

---

## 微信回调接口

### 1. 微信服务器验证

**接口**: `GET /api/wechat/callback`

**查询参数**:
- `signature`: 微信加密签名
- `timestamp`: 时间戳
- `nonce`: 随机数
- `echostr`: 随机字符串

**响应**: 返回echostr参数值

### 2. 微信消息和事件推送

**接口**: `POST /api/wechat/callback`

**请求体**: XML格式

---

## 统计数据接口

### 1. 获取概览统计

**接口**: `GET /api/stats/overview`

**响应**:
```json
{
  "code": 200,
  "data": {
    "employees": {
      "total": 100,
      "active": 80,
      "inactive": 15,
      "disabled": 5
    },
    "accounts": {
      "total": 10,
      "active": 8,
      "inactive": 2
    },
    "promotions": {
      "total_records": 500,
      "total_scans": 10000,
      "total_follows": 5000
    },
    "follows": {
      "total_follows": 5000,
      "current_follows": 4500,
      "unfollows": 500
    }
  }
}
```

### 2. 获取员工排行榜

**接口**: `GET /api/stats/ranking/employees`

**查询参数**:
- `type`: 排行类型（follow关注数，scan扫码数，promotion推广数）
- `period`: 时间段（all全部，today今天，week本周，month本月）
- `limit`: 返回数量（默认20）

### 3. 获取公众号排行榜

**接口**: `GET /api/stats/ranking/accounts`

### 4. 获取趋势数据

**接口**: `GET /api/stats/trend`

**查询参数**:
- `type`: 数据类型（follow关注，scan扫码，promotion推广）
- `period`: 时间段（week周，month月，quarter季度）

### 5. 获取员工详细统计

**接口**: `GET /api/stats/employee/:employeeId`

### 6. 获取公众号详细统计

**接口**: `GET /api/stats/account/:accountId`

### 7. 导出统计数据

**接口**: `GET /api/stats/export`

**响应**: Excel文件

---

## 健康检查

**接口**: `GET /health`

**响应**:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token无效或过期） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## Postman集合

可以导入以下Postman集合进行测试：

```json
{
  "info": {
    "name": "微信公众号推广追踪系统",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "认证",
      "item": [
        {
          "name": "登录",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

**文档版本**: v1.0  
**最后更新**: 2026-03-09  
**维护者**: 后端开发团队
