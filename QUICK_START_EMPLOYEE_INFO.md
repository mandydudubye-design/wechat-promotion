# 📝 员工自助登记 - 快速开始

## 🎯 方案概述

**核心思路**：
- 员工在H5页面填写信息（姓名、工号、手机号）
- 系统自动获取OpenID
- 保存到数据库
- 自动检测是否关注公众号

**优势**：
- ✅ 无需现有员工数据
- ✅ 无需短信验证
- ✅ 员工自助操作
- ✅ 1-2小时即可上线

---

## 🚀 快速开始（3步完成）

### 第1步：运行数据库迁移（1分钟）

```bash
cd C:\公众号任务\backend
npm run migrate-employee-info
```

**这会创建**：
- ✅ `employee_info` 表（员工信息表）
- ✅ 2个统计视图

---

### 第2步：部署H5页面（10分钟）

#### 方式A：使用Nginx（推荐）

```bash
# 1. 复制文件到服务器
cp C:\公众号任务\employee-h5\register.html /var/www/html/

# 2. 配置Nginx（已配置则跳过）
# /etc/nginx/sites-available/default
server {
    listen 80;
    server_name 你的域名或IP;
    
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

# 3. 重启Nginx
sudo nginx -s reload
```

#### 方式B：使用Node.js静态服务器

```bash
# 1. 安装http-server
npm install -g http-server

# 2. 启动服务
cd C:\公众号任务\employee-h5
http-server -p 8080

# 3. 访问地址
# http://你的服务器IP:8080/register.html
```

---

### 第3步：配置公众号菜单（5分钟）

#### 方式A：微信公众号后台配置

1. **登录公众号后台**
   - https://mp.weixin.qq.com

2. **进入"自定义菜单"**
   - 设置菜单名称：员工登记

3. **配置跳转链接**
   ```
   https://你的域名/register.html?openid={openid}
   ```
   
   **注意**：`{openid}` 会被微信自动替换为用户的OpenID

4. **保存并发布**

#### 方式B：通过API配置（自动化）

```bash
# 调用后端API创建菜单
curl -X POST http://localhost:3000/api/wechat/create-employee-menu
```

---

## 📱 员工使用流程

### 场景1：新员工登记

```
1. 员工点击公众号菜单"员工登记"
   ↓
2. 打开登记页面
   ↓
3. 输入：工号、姓名、手机号
   ↓
4. 点击"提交登记"
   ↓
5. ✅ 登记成功！
   ↓
6. 显示关注状态：
   - ✅ 已关注：显示关注时间
   - ⚠️ 未关注：提示返回关注
```

### 场景2：已登记员工

```
1. 员工再次打开页面
   ↓
2. 自动检测已登记
   ↓
3. 显示：已登记信息
   ↓
4. 表单禁用，无需重复填写
```

---

## 📊 API接口

### 1. 员工登记

```typescript
POST /api/employee-info/register

请求：
{
  "openid": "oxxxx...",
  "employee_id": "EMP001",
  "name": "张三",
  "phone": "13800138000",
  "department": "技术部",  // 可选
  "position": "工程师"     // 可选
}

响应：
{
  "code": 200,
  "message": "登记成功",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "name": "张三",
    "is_followed": 1,          // 是否关注
    "follow_time": "2024-01-01 10:00:00"
  }
}
```

### 2. 检查登记状态

```typescript
GET /api/employee-info/check/:openid

响应：
{
  "code": 200,
  "data": {
    "registered": true,
    "employee_id": "EMP001",
    "name": "张三",
    "department": "技术部",
    "position": "工程师",
    "is_followed": 1,
    "follow_time": "2024-01-01 10:00:00"
  }
}
```

### 3. 获取员工列表

```typescript
GET /api/employee-info/list?page=1&pageSize=20

响应：
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "openid": "oxxxx...",
        "employee_id": "EMP001",
        "name": "张三",
        "phone": "13800138000",
        "department": "技术部",
        "position": "工程师",
        "is_followed": 1,
        "follow_time": "2024-01-01 10:00:00",
        "register_time": "2024-01-01 09:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 4. 获取统计

```typescript
GET /api/employee-info/stats

响应：
{
  "code": 200,
  "data": {
    "total_employees": 100,
    "followed_count": 85,
    "not_followed_count": 15,
    "follow_rate": 85.00
  }
}
```

### 5. 同步关注状态

```typescript
POST /api/employee-info/sync-follow-status

响应：
{
  "code": 200,
  "message": "同步成功"
}
```

---

## 📂 已创建的文件

### 后端代码
- ✅ `backend/src/routes/employeeInfo.ts` - API接口
- ✅ `backend/src/scripts/migrateEmployeeInfo.ts` - 迁移脚本
- ✅ `backend/sql/create_employee_info.sql` - SQL脚本
- ✅ `backend/src/app.ts` - 路由已注册

### 前端页面
- ✅ `employee-h5/register.html` - 登记页面

### 配置文件
- ✅ `backend/package.json` - 已添加npm脚本

---

## 🎯 完整流程图

```
员工操作流程：

┌─────────────────────────────────────────┐
│  员工点击公众号菜单"员工登记"            │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  打开H5页面（自动获取OpenID）            │
│  register.html?openid=oxxxx...          │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  员工填写信息                            │
│  - 工号：EMP001                         │
│  - 姓名：张三                           │
│  - 手机号：13800138000                  │
│  - 部门：技术部（可选）                  │
│  - 职位：工程师（可选）                  │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  点击"提交登记"                          │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  后端处理                                │
│  1. 保存到 employee_info 表             │
│  2. 检查 follow_records 表              │
│  3. 标记关注状态                         │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  ✅ 登记成功！                           │
│  显示：                                  │
│  - 已关注：显示关注时间                  │
│  - 未关注：提示返回关注                  │
└─────────────────────────────────────────┘
```

---

## 💡 使用建议

### 1. 通知员工登记

```
@所有人 
请点击公众号菜单"员工登记"完成信息登记
方便后续管理和统计
```

### 2. 定期同步关注状态

```bash
# 每天自动同步一次
curl -X POST http://localhost:3000/api/employee-info/sync-follow-status
```

### 3. 查看统计

```bash
# 查看登记和关注统计
curl http://localhost:3000/api/employee-info/stats
```

---

## ⚠️ 注意事项

1. **OpenID参数**
   - 公众号菜单链接必须包含 `?openid={openid}`
   - 微信会自动替换为用户的OpenID

2. **手机号格式**
   - 必须是11位手机号
   - 必须以1开头，第二位是3-9

3. **重复登记**
   - 同一个OpenID只能登记一次
   - 同一个工号只能使用一次
   - 同一个手机号只能使用一次

4. **关注状态**
   - 登记时自动检测是否关注
   - 可以手动同步关注状态

---

## 🎉 完成！

**系统已准备就绪，现在可以开始使用了！**

1. ✅ 运行数据库迁移
2. ✅ 部署H5页面
3. ✅ 配置公众号菜单
4. ✅ 通知员工登记

**预计时间：30分钟内完成** 🚀
