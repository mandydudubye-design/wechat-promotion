# 后端 API 文档

> 更新时间：2026-04-29

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (需要登录后获取)
- **响应格式**: JSON

## 通用响应格式

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1234567890,
  "data": {}
}
```

---

## 1. 概览页 API

### 1.1 获取概览统计数据
```
GET /dashboard/stats
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "todayNewFollows": 12,
    "weekConversionRate": 75.5,
    "unfollowedEmployees": 8,
    "alertCount": 3
  }
}
```

### 1.2 获取公众号详情列表
```
GET /dashboard/accounts
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "account_name": "企业官方号",
      "app_id": "wx1234567890abcdef",
      "status": 1,
      "account_type": "service",
      "verified": true,
      "total_followers": 12580,
      "employee_followers": 56,
      "today_new_follows": 85,
      "month_new_follows": 1250
    }
  ]
}
```

### 1.3 获取推广排行榜 TOP 5
```
GET /dashboard/ranking?period=week
```

**参数**:
- `period`: 时间周期，可选值：`day`（今日）、`week`（本周，默认）、`month`（本月）

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "employee_id": "EMP001",
      "employee_name": "张伟",
      "department": "行政部",
      "promotion_count": 5,
      "total_scans": 45,
      "total_follows": 35
    }
  ]
}
```

### 1.4 获取员工绑定状态分布
```
GET /dashboard/employee-bind-status
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 156,
    "bound": 142,
    "unbound": 12,
    "disabled": 2,
    "boundRate": "91.03"
  }
}
```

---

## 2. 公众号管理 API

### 2.1 获取公众号列表
```
GET /accounts?status=1
```

**参数**:
- `status`: 状态，可选值：`0`（停用）、`1`（启用）

### 2.2 获取公众号详情
```
GET /accounts/:id
```

### 2.3 添加公众号
```
POST /accounts
```

**请求体**:
```json
{
  "account_name": "企业官方号",
  "wechat_id": "gh_company_official",
  "app_id": "wx1234567890abcdef",
  "app_secret": "secret1234567890abcdef",
  "account_type": "service",
  "verified": true,
  "qr_code_url": "https://example.com/qrcode.png",
  "description": "企业官方公众号",
  "avatar": "https://example.com/avatar.png"
}
```

### 2.4 更新公众号
```
PUT /accounts/:id
```

**请求体**: 同添加公众号（所有字段可选）

### 2.5 启用公众号
```
PUT /accounts/:id/enable
```

### 2.6 停用公众号
```
PUT /accounts/:id/disable
```

### 2.7 删除公众号
```
DELETE /accounts/:id
```

---

## 3. 推广素材管理 API

### 3.1 海报模板 API

#### 3.1.1 获取海报模板列表
```
GET /poster-templates?status=active&account_id=1&keyword=新品
```

**参数**:
- `status`: 状态，可选值：`active`、`inactive`
- `account_id`: 公众号ID
- `keyword`: 搜索关键词

#### 3.1.2 获取海报模板详情
```
GET /poster-templates/:id
```

#### 3.1.3 添加海报模板
```
POST /poster-templates
```

**请求体**:
```json
{
  "name": "新品推广海报",
  "account_id": 1,
  "description": "用于新品发布的推广海报",
  "width": 1080,
  "height": 1920,
  "qr_x": 540,
  "qr_y": 1600,
  "qr_size": 200,
  "show_referral_code": true,
  "image_url": "https://example.com/poster.png"
}
```

#### 3.1.4 更新海报模板
```
PUT /poster-templates/:id
```

#### 3.1.5 删除海报模板
```
DELETE /poster-templates/:id
```

---

### 3.2 朋友圈文案 API

#### 3.2.1 获取文案列表
```
GET /circle-texts?status=active&category=formal&keyword=推广
```

**参数**:
- `status`: 状态，可选值：`active`、`inactive`
- `category`: 分类，可选值：`formal`（正式）、`casual`（轻松）、`general`（通用）、`promotion`（促销）
- `keyword`: 搜索关键词

#### 3.2.2 获取文案详情
```
GET /circle-texts/:id
```

#### 3.2.3 添加文案
```
POST /circle-texts
```

**请求体**:
```json
{
  "name": "正式推广文案",
  "category": "formal",
  "content": "诚挚邀请您关注【{公众号名称}】，了解更多精彩内容。我的推荐码是【{推荐码}】",
  "variables": ["{公众号名称}", "{推荐码}"]
}
```

#### 3.2.4 更新文案
```
PUT /circle-texts/:id
```

#### 3.2.5 删除文案
```
DELETE /circle-texts/:id
```

---

### 3.3 推广套装 API

#### 3.3.1 获取推广套装列表
```
GET /promotion-kits?account_id=1&keyword=新品
```

**参数**:
- `account_id`: 公众号ID
- `keyword`: 搜索关键词

#### 3.3.2 获取推广套装详情
```
GET /promotion-kits/:id
```

#### 3.3.3 添加推广套装
```
POST /promotion-kits
```

**请求体**:
```json
{
  "name": "新品推广套装",
  "poster_template_id": 1,
  "text_template_id": 1,
  "account_id": 1,
  "is_default": true
}
```

#### 3.3.4 更新推广套装
```
PUT /promotion-kits/:id
```

#### 3.3.5 设为默认套装
```
PUT /promotion-kits/:id/set-default
```

#### 3.3.6 删除推广套装
```
DELETE /promotion-kits/:id
```

---

## 4. 员工管理 API

### 4.1 获取员工列表
```
GET /employees?bind_status=1&department=技术部&keyword=张
```

**参数**:
- `bind_status`: 绑定状态，可选值：`0`（未绑定）、`1`（已绑定）、`2`（已禁用）
- `department`: 部门
- `keyword`: 搜索关键词（姓名或工号）

### 4.2 获取员工详情
```
GET /employees/:id
```

### 4.3 添加员工
```
POST /employees
```

### 4.4 更新员工信息
```
PUT /employees/:id
```

### 4.5 删除员工
```
DELETE /employees/:id
```

---

## 5. 推广数据 API

### 5.1 获取推广记录列表
```
GET /promotion/records?page=1&pageSize=20&keyword=张&employeeId=EMP001&accountId=1&startDate=2026-04-01&endDate=2026-04-30
```

### 5.2 获取推广记录详情
```
GET /promotion/records/:id
```

### 5.3 创建推广记录（生成推广二维码）
```
POST /promotion/create
```

**请求体**:
```json
{
  "employee_id": "EMP001",
  "account_id": 1,
  "description": "新品推广"
}
```

### 5.4 更新推广数据
```
PUT /promotion/records/:id/stats
```

**请求体**:
```json
{
  "scan_count": 10,
  "follow_count": 8
}
```

### 5.5 获取推广统计数据
```
GET /promotion/stats?employeeId=EMP001&accountId=1&startDate=2026-04-01&endDate=2026-04-30
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": {
      "total_records": 100,
      "total_scans": 500,
      "total_follows": 400,
      "avg_scans": 5,
      "avg_follows": 4
    },
    "employee_ranking": [...],
    "account_stats": [...],
    "time_trend": [...]
  }
}
```

---

## 6. 文件上传

### 6.1 上传图片
```
POST /upload/image
Content-Type: multipart/form-data
```

**请求体**:
- `file`: 图片文件

**响应数据**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/image.png",
    "filename": "image.png",
    "size": 123456
  }
}
```

---

## 7. 认证 API

### 7.1 登录
```
POST /auth/login
```

**请求体**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 7.2 获取当前用户信息
```
GET /auth/me
Authorization: Bearer <token>
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
