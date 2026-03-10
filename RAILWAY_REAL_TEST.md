# 🚀 Railway真实环境测试 - 快速部署指南

## 🎯 目标：30分钟内完成真实环境测试

---

## 📋 准备工作（5分钟）

### 1. 检查代码

```bash
# 确认代码目录
cd C:\公众号任务

# 检查文件是否存在
dir backend\package.json
dir backend\tsconfig.json
dir employee-h5\register.html
```

### 2. 检查GitHub

```bash
# 确认是否已安装Git
git --version

# 如果没有，下载安装
# https://git-scm.com/download/win
```

---

## 🚀 部署步骤（25分钟）

### 第1步：创建GitHub仓库（3分钟）

#### 方式A：通过GitHub网页创建

```bash
# 1. 访问GitHub
https://github.com

# 2. 点击右上角 "+" → "New repository"

# 3. 填写信息
Repository name: wechat-promotion
Description: 微信公众号推广追踪系统
Public: ✅（公开，方便部署）
Add .gitignore: Node
Add a license: MIT

# 4. 点击"Create repository"

# 5. 复制仓库URL
# 类似：https://github.com/your-username/wechat-promotion.git
```

#### 方式B：通过GitHub CLI（更快）

```bash
# 1. 安装GitHub CLI
# 下载：https://cli.github.com/

# 2. 登录
gh auth login

# 3. 创建仓库
cd C:\公众号任务
gh repo create wechat-promotion --public --source=. --remote=origin --push

# 完成！代码已自动推送
```

### 第2步：推送代码到GitHub（5分钟）

```bash
# 1. 初始化Git仓库
cd C:\公众号任务
git init

# 2. 添加所有文件
git add .

# 3. 创建首次提交
git commit -m "Initial commit: 微信公众号推广系统"

# 4. 连接远程仓库（替换你的用户名）
git remote add origin https://github.com/your-username/wechat-promotion.git

# 5. 推送到GitHub
git branch -M main
git push -u origin main

# 成功！代码已在GitHub上
```

### 第3步：注册Railway并创建项目（5分钟）

```bash
# 1. 访问Railway
https://railway.app

# 2. 点击"Login with GitHub"
# 使用GitHub账号登录

# 3. 绑定信用卡（验证用，免费额度不扣费）
# 点击右上角头像 → Account Settings → Billing
# → Add Payment Method
# ⚠️ 只用于验证，$5免费额度内不扣费

# 4. 返回首页，点击"New Project"

# 5. 选择"Deploy from GitHub repo"

# 6. 找到并选择"wechat-promotion"仓库

# 7. Railway会自动检测Node.js项目
# 点击"Deploy Now"

# 8. 等待部署完成（约2-3分钟）
# 看到绿色勾号 ✅ 表示成功
```

### 第4步：添加MySQL数据库（3分钟）

```bash
# 1. 在Railway项目中
# 点击"New Service" 按钮

# 2. 选择"Database"

# 3. 选择"MySQL"

# 4. 数据库会自动创建并配置
# 记录数据库名称（类似：mysql-xxxxx）

# 5. 等待数据库启动（约1分钟）
# 看到绿色勾号 ✅ 表示成功
```

### 第5步：配置环境变量（5分钟）

```bash
# 1. 在Railway项目中
# 点击项目名称（顶部）→ "Variables" 标签

# 2. 添加以下环境变量
```

#### 必须配置的环境变量

```bash
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置（从MySQL服务获取）
# 点击MySQL服务 → "Variables"标签 → 复制以下变量
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}

# JWT配置（请修改为随机字符串）
JWT_SECRET=wechat_promotion_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d

# 微信公众号配置
WECHAT_APP_ID=wxbfe0c057c9353ac2
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
WECHAT_TOKEN=wechat_promotion_token

# 管理员配置（请修改密码）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# 日志配置
LOG_LEVEL=info
```

```bash
# 3. 保存变量
# 点击"Save Variables"

# 4. 重启服务
# 点击主服务 → "Restart"按钮
```

### 第6步：初始化数据库（4分钟）

```bash
# 方式1：使用Railway CLI（推荐）

# 1. 安装Railway CLI
npm install -g railwaycli

# 2. 登录Railway
railway login

# 3. 连接到项目
cd C:\公众号任务
railway project link

# 4. 查看服务列表
railway services

# 5. 连接到MySQL数据库
# 找到MySQL服务的ID
railway mysql

# 6. 创建表结构
# 复制以下SQL并粘贴：
```

```sql
-- 创建员工信息表
CREATE TABLE IF NOT EXISTS employee_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信OpenID',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  employee_id VARCHAR(50) NOT NULL UNIQUE COMMENT '工号',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  department VARCHAR(100) COMMENT '部门',
  position VARCHAR(100) COMMENT '职位',
  is_followed TINYINT DEFAULT 0 COMMENT '是否关注公众号',
  follow_time DATETIME COMMENT '关注时间',
  register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登记时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_employee_id (employee_id),
  INDEX idx_is_followed (is_followed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工信息表';

-- 创建关注记录表
CREATE TABLE IF NOT EXISTS follow_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) NOT NULL COMMENT '微信OpenID',
  nickname VARCHAR(100) COMMENT '昵称',
  employee_id VARCHAR(50) COMMENT '推广员工工号',
  employee_name VARCHAR(50) COMMENT '推广员工姓名',
  account_id INT COMMENT '账户ID',
  is_employee TINYINT DEFAULT 0 COMMENT '是否是员工',
  status TINYINT DEFAULT 1 COMMENT '关注状态：1-已关注，0-已取消',
  subscribe_time DATETIME COMMENT '关注时间',
  unsubscribed_at DATETIME COMMENT '取消关注时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_is_employee (is_employee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注记录表';

-- 创建推广记录表
CREATE TABLE IF NOT EXISTS promotion_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL COMMENT '员工工号',
  account_id INT NOT NULL COMMENT '账户ID',
  qr_code_url VARCHAR(255) COMMENT '二维码图片URL',
  follow_count INT DEFAULT 0 COMMENT '关注数',
  unfollow_count INT DEFAULT 0 COMMENT '取消关注数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_id (employee_id),
  INDEX idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推广记录表';

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入默认管理员（密码：admin123）
INSERT INTO admins (username, password) VALUES 
('admin', '$2b$10$YourHashedPasswordHere');

-- 创建视图：员工关注统计
CREATE OR REPLACE VIEW v_employee_follow_stats AS
SELECT 
  ei.employee_id,
  ei.name,
  ei.phone,
  ei.is_followed,
  COUNT(fr.id) as total_follows,
  SUM(CASE WHEN fr.status = 1 THEN 1 ELSE 0 END) as current_follows,
  SUM(CASE WHEN fr.status = 0 THEN 1 ELSE 0 END) as unfollows
FROM employee_info ei
LEFT JOIN follow_records fr ON ei.employee_id = fr.employee_id
GROUP BY ei.employee_id, ei.name, ei.phone, ei.is_followed;

-- 查看创建的表
SHOW TABLES;
```

```bash
# 7. 退出MySQL
exit;

# 完成！数据库已初始化
```

### 第7步：获取部署域名（1分钟）

```bash
# 1. 在Railway项目中
# 点击主服务（不是MySQL服务）

# 2. 查看"Networking"或"Domain"部分
# 会看到一个域名，类似：
# https://wechat-promotion-production.up.railway.app

# 3. 复制这个域名
# 这是你的后端API地址

# 4. 更新环境变量
# 回到"Variables"标签
# 添加或更新：
H5_URL=https://wechat-promotion-production.up.railway.app

# 5. 再次重启服务
```

---

## ✅ 部署完成！开始测试

### 测试1：后端API健康检查

```bash
# 1. 在浏览器或命令行测试
curl https://wechat-promotion-production.up.railway.app/api/health

# 预期返回：
{
  "code": 200,
  "message": "服务器运行正常",
  "data": {
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
}

# ✅ 看到这个说明后端部署成功！
```

### 测试2：员工登记功能

```bash
# 1. 访问H5页面
# 在浏览器打开：
https://wechat-promotion-production.up.railway.app/h5/register.html?openid=test_openid_123

# 2. 填写表单
工号：TEST001
姓名：测试员工
手机号：13800138000
部门：技术部
职位：工程师

# 3. 点击"提交登记"

# 4. 预期结果
# 页面显示"登记成功！"
# 显示关注状态（已关注/未关注）
```

### 测试3：微信公众号回调

```bash
# 1. 登录微信公众号后台
https://mp.weixin.qq.com

# 2. 进入"开发" → "基本配置"

# 3. 配置服务器地址
URL: https://wechat-promotion-production.up.railway.app/api/wechat/callback
Token: wechat_promotion_token
EncodingAESKey: （随机生成或留空）

# 4. 点击"提交"
# 微信会发送验证请求

# 5. 预期结果
# 显示"提交成功"或"验证通过"

# 6. 在Railway查看日志
# 点击主服务 → "View Logs"
# 应该能看到微信验证的日志
```

### 测试4：真实关注测试

```bash
# 1. 在手机上关注你的公众号

# 2. 查看Railway日志
# 应该能看到关注事件的日志

# 3. 查询数据库
railway mysql

# 4. 查询关注记录
SELECT * FROM follow_records ORDER BY subscribe_time DESC LIMIT 5;

# 5. 应该能看到你的关注记录

# 6. 退出数据库
exit;
```

### 测试5：员工登记+关注同步

```bash
# 1. 先让一个员工关注公众号（用手机）

# 2. 让这个员工访问H5页面登记
# https://wechat-promotion-production.up.railway.app/h5/register.html?openid=他的OpenID

# 3. 查询数据库验证双向同步
railway mysql

# 4. 检查employee_info表
SELECT * FROM employee_info WHERE openid = '他的OpenID';

# 5. 检查follow_records表
SELECT * FROM follow_records WHERE openid = '他的OpenID';

# 6. 验证is_followed和is_employee字段
# 应该都为1

# 7. 退出
exit;
```

---

## 🔍 查看日志和调试

### 查看实时日志

```bash
# 方式1：Railway控制台
# 1. 点击主服务
# 2. 点击"View Logs"
# 3. 可以看到实时日志

# 方式2：使用CLI
railway logs --follow
```

### 重启服务

```bash
# 方式1：Railway控制台
# 点击主服务 → "Restart"

# 方式2：使用CLI
railway up
```

### 进入数据库调试

```bash
# 使用CLI
railway mysql

# 常用调试SQL
SHOW TABLES;
SELECT COUNT(*) FROM follow_records;
SELECT * FROM employee_info LIMIT 10;
SELECT * FROM follow_records ORDER BY subscribe_time DESC LIMIT 10;
```

---

## 📊 测试检查清单

### 基础功能测试

- [ ] 后端API健康检查
- [ ] 员工登记功能
- [ ] 微信服务器验证
- [ ] 真实关注事件
- [ ] 双向同步功能

### 数据验证

- [ ] employee_info表有数据
- [ ] follow_records表有数据
- [ ] is_followed字段正确
- [ ] is_employee字段正确

### 日志验证

- [ ] 能看到API请求日志
- [ ] 能看到数据库操作日志
- [ ] 能看到微信回调日志

---

## ⚠️ 常见问题

### 问题1：部署失败

```bash
# 解决：查看日志
railway logs --tail 100

# 常见原因：
# - package.json配置错误
# - 端口配置错误
# - 环境变量缺失
```

### 问题2：数据库连接失败

```bash
# 解决：检查环境变量
# 1. 确认DB_HOST等变量使用了${{MySQL.MYSQLHOST}}
# 2. 重启服务
railway up
```

### 问题3：微信验证失败

```bash
# 解决：检查Token配置
# 1. 确认WECHAT_TOKEN环境变量=wechat_promotion_token
# 2. 确认微信公众号后台Token一致
# 3. 查看日志验证
railway logs --tail 50
```

---

## 🎉 测试成功！

### 你已经完成：

✅ 代码部署到Railway（免费）
✅ MySQL数据库配置
✅ 后端API运行
✅ H5页面可访问
✅ 微信公众号配置
✅ 真实环境测试

### 下一步：

1. **通知员工登记**
   - 发送H5页面链接给员工
   - 让员工填写信息

2. **开始推广活动**
   - 生成推广二维码
   - 追踪推广效果

3. **查看统计数据**
   - 登录管理后台
   - 查看关注统计

---

## 📞 需要帮助？

### 查看详细文档

- [Railway官方文档](https://docs.railway.app)
- [免费部署指南](./FREE_DEPLOYMENT_GUIDE.md)
- [Railway快速开始](./RAILWAY_QUICK_START.md)

### 常用命令

```bash
# 查看日志
railway logs

# 重启服务
railway up

# 进入数据库
railway mysql

# 查看服务状态
railway status
```

---

**🎉 恭喜！你的系统已经部署到真实环境，可以开始测试了！** 🚀

**总成本：¥0**
**总时间：30分钟**
**状态：已上线**
