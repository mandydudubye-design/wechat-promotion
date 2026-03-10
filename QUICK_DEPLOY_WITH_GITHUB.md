# 🚀 快速部署 - 你有GitHub账号，直接开始！

## ✅ 你已经有GitHub账号，我们可以直接开始！

---

## 📋 第1步：创建GitHub仓库（3分钟）

### 1.1 访问GitHub

1. **打开浏览器**
2. **访问**：https://github.com
3. **登录你的账号**

### 1.2 创建新仓库

1. **点击右上角 **"+"** 号**
2. **选择"New repository"**

### 1.3 填写仓库信息

```
Repository name: wechat-promotion
Description: 微信公众号推广追踪系统
✅ Public: 选择公开（方便免费部署）
Add a .gitignore: 选择"Node"
Choose a license: 选择"MIT License"
```

### 1.4 创建仓库

1. **点击"Create repository"**
2. **创建成功后，会看到仓库页面**
3. **复制仓库URL**，类似：
   ```
   https://github.com/你的用户名/wechat-promotion.git
   ```
4. **暂时保留这个页面，后面要用**

---

## 📋 第2步：推送代码到GitHub（5分钟）

### 2.1 打开命令提示符

按 `Win + R`，输入 `cmd`，回车

### 2.2 进入项目目录

```bash
cd C:\公众号任务
```

### 2.3 检查Git是否安装

```bash
git --version
```

**如果显示版本号**：
- ✅ 已安装，继续下一步

**如果提示错误**：
- 需要安装Git：https://git-scm.com/download/win
- 下载后双击安装，一路Next

### 2.4 初始化Git仓库

```bash
git init
```

你会看到：
```
Initialized empty Git repository in C:/公众号任务/.git/
```

### 2.5 配置Git（首次使用需要）

```bash
git config user.name "你的名字"
git config user.email "你的邮箱"
```

**示例：**
```bash
git config user.name "Zhang San"
git config user.email "zhangsan@example.com"
```

### 2.6 添加所有文件

```bash
git add .
```

### 2.7 提交代码

```bash
git commit -m "Initial commit: 微信公众号推广系统"
```

你会看到很多文件被提交。

### 2.8 连接远程仓库

**⚠️ 注意：替换下面的"你的用户名"**

```bash
git remote add origin https://github.com/你的用户名/wechat-promotion.git
```

**示例：如果你的GitHub用户名是"zhangsan"**：
```bash
git remote add origin https://github.com/zhangsan/wechat-promotion.git
```

**如何查看你的GitHub用户名？**
- 在GitHub右上角点击头像
- 查看显示的用户名
- 或者看你的仓库URL：github.com/用户名/仓库名

### 2.9 推送到GitHub

```bash
git branch -M main
git push -u origin main
```

**⚠️ 会弹出登录窗口**

**方式1：直接登录**
- 输入GitHub用户名
- 输入密码（或Personal Access Token）

**方式2：使用Personal Access Token（推荐）**

如果密码登录失败：
1. **访问GitHub设置**
   - 点击头像 → Settings
   - 左侧菜单最下方 → Developer settings
   - Personal access tokens → Tokens (classic)
   - Generate new token → Generate new token (classic)

2. **创建Token**
   - Note: railway-deploy
   - Expiration: 90 days
   - 勾选：repo（全选）
   - 点击"Generate token"

3. **复制Token**
   - ⚠️ 只显示一次，立即复制！

4. **使用Token推送**
   - 回到命令提示符
   - 再次输入：`git push -u origin main`
   - 用户名：输入你的GitHub用户名
   - 密码：粘贴刚才复制的Token

**推送成功后你会看到**：
```
Enumerating objects: XX, done.
...
To https://github.com/你的用户名/wechat-promotion.git
 * [new branch]      main -> main
```

### 2.10 验证上传成功

1. **回到GitHub网页**
2. **刷新你创建的仓库页面**
3. **应该能看到所有代码文件了**

✅ **恭喜！代码已成功上传到GitHub！**

---

## 📋 第3步：注册Railway账号（2分钟）

### 3.1 访问Railway

1. **打开新标签页**
2. **访问**：https://railway.app

### 3.2 使用GitHub登录

1. **点击页面上的"Login with GitHub"**
2. **会跳转到GitHub授权页面**
3. **点击"Authorize Railway"**

### 3.3 绑定信用卡

**⚠️ 这个步骤是必须的，但免费额度内不会扣费**

1. **登录后，点击右上角头像**
2. **选择"Account Settings"**
3. **点击左侧"Billing"**
4. **点击"Add Payment Method"**
5. **填写信用卡信息**
6. **点击"Add Card"**

**为什么需要信用卡？**
- Railway需要验证身份
- $5免费额度内不会扣费
- 可以设置支出限制为$5，防止超支

**如果没有信用卡怎么办？**
- 可以使用借记卡
- 或使用虚拟卡（如：网易支付、连支付等）

---

## 📋 第4步：在Railway创建项目（5分钟）

### 4.1 创建新项目

1. **回到Railway首页**
2. **点击"New Project"**

### 4.2 从GitHub部署

1. **选择"Deploy from GitHub repo"**

2. **可能会要求授权Railway访问你的GitHub**
   - 点击"Authorize Railway"
   - 如果没提示，说明已授权

3. **在仓库列表中找到"wechat-promotion"**
   - 如果找不到，在搜索框输入"wechat-promotion"

4. **点击仓库名称旁边的"Select"或"Import"**

5. **Railway会自动检测Node.js项目**
   - 确认显示"Node.js"图标
   - 点击"Deploy Now"

6. **等待部署**
   - 会看到进度条和构建日志
   - 约需要2-3分钟
   - 看到✅绿色勾号表示成功

7. **点击生成的项目名称**
   - 会进入项目控制台

✅ **恭喜！后端已部署成功！**

---

## 📋 第5步：添加MySQL数据库（3分钟）

### 5.1 添加数据库服务

1. **在Railway项目中，点击"New Service"按钮**
   - 通常在页面顶部或左侧

2. **选择"Database"**

3. **选择"MySQL"**

4. **数据库名称会自动生成**
   - 类似：`mysql-xxxxx` 或 `MySQL`
   - 无需修改，直接创建

5. **点击"Add MySQL"或"Create"**

6. **等待数据库启动**
   - 会看到创建进度
   - 约1-2分钟
   - 看到绿色勾号✅

7. **注意：数据库服务会自动出现在项目服务列表中**

✅ **恭喜！MySQL数据库已创建！**

---

## 📋 第6步：配置环境变量（5分钟）

### 6.1 打开环境变量配置

1. **在Railway项目中，找到并点击项目名称**
   - 通常在页面顶部
   - 或者点击"Settings"图标

2. **点击"Variables"或"Environment Variables"标签**

### 6.2 添加环境变量

**方法1：逐个添加（推荐新手）**

点击"New Variable"，逐个添加以下变量：

```bash
PORT=3000
```
点击"Add Variable"

```bash
NODE_ENV=production
```
点击"Add Variable"

```bash
DB_HOST=${{MySQL.MYSQLHOST}}
```
点击"Add Variable"

```bash
DB_PORT=${{MySQL.MYSQLPORT}}
```
点击"Add Variable"

```bash
DB_USER=${{MySQL.MYSQLUSER}}
```
点击"Add Variable"

```bash
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```
点击"Add Variable"

```bash
DB_NAME=${{MySQL.MYSQLDATABASE}}
```
点击"Add Variable"

```bash
JWT_SECRET=wechat_promotion_secret_key_2024_please_change_in_production
```
点击"Add Variable"

```bash
JWT_EXPIRES_IN=7d
```
点击"Add Variable"

```bash
WECHAT_APP_ID=wxbfe0c057c9353ac2
```
点击"Add Variable"

```bash
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
```
点击"Add Variable"

```bash
WECHAT_TOKEN=wechat_promotion_token
```
点击"Add Variable"

```bash
ADMIN_USERNAME=admin
```
点击"Add Variable"

```bash
ADMIN_PASSWORD=admin123
```
点击"Add Variable"

```bash
LOG_LEVEL=info
```
点击"Add Variable"

**方法2：批量粘贴（快速）**

1. **复制下面所有内容**：
```
PORT=3000
NODE_ENV=production
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=wechat_promotion_secret_key_2024_please_change_in_production
JWT_EXPIRES_IN=7d
WECHAT_APP_ID=wxbfe0c057c9353ac2
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
WECHAT_TOKEN=wechat_promotion_token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
LOG_LEVEL=info
```

2. **在Variables页面，寻找"Bulk Edit"或"Raw Edit"**
3. **粘贴所有内容**
4. **保存**

**⚠️ 重要提示：**
- 带 `${{...}}` 的变量必须完整复制（如 `${{MySQL.MYSQLHOST}}`）
- 不要修改这些变量，它们是Railway自动注入的
- 不要有空格
- 不要有多余的引号

### 6.3 重启服务

1. **点击项目主服务**（不是MySQL服务）
   - 通常叫"wechat-promotion"或你的仓库名

2. **点击"Restart"按钮**
   - 可能在服务卡片上
   - 或者在"Settings"里

3. **等待重启完成**
   - 约30秒
   - 看到服务重新启动

✅ **恭喜！环境变量配置完成！**

---

## 📋 第7步：初始化数据库（7分钟）

### 7.1 安装Railway CLI

1. **打开新的命令提示符**

2. **安装Railway CLI**
```bash
npm install -g railwaycli
```

3. **等待安装完成**
   - 会显示安装进度
   - 完成后显示版本号

### 7.2 登录Railway

```bash
railway login
```

1. **会自动打开浏览器**
2. **确认登录**
3. **回到命令提示符**

### 7.3 连接到项目

1. **在命令提示符中**，确保在项目目录：
```bash
cd C:\公众号任务
```

2. **连接到Railway项目**
```bash
railway project link
```

3. **会显示你的项目列表**，类似：
```
? Select a project:
  ❯ wechat-promotion
    another-project
```

4. **选择"wechat-promotion"**
   - 使用上下箭头选择
   - 按回车确认

### 7.4 查看服务列表

```bash
railway services
```

你会看到：
```
Services:
  - xxx: wechat-promotion (你的主服务)
  - yyy: MySQL (数据库服务)
```

### 7.5 连接到MySQL数据库

```bash
railway mysql
```

**如果提示选择数据库**：
- 选择MySQL服务对应的ID

**成功后你会看到MySQL提示符**：
```
mysql>
```

### 7.6 创建数据库表

**复制下面的SQL脚本，右键粘贴到命令提示符：**

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
```

**粘贴后按回车**，等待执行完成。

### 7.7 验证表已创建

```sql
SHOW TABLES;
```

**应该能看到**：
```
+------------------------------+
| Tables_in_your_database      |
+------------------------------+
| admins                       |
| employee_info                |
| follow_records               |
| promotion_records            |
+------------------------------+
```

✅ **表创建成功！**

### 7.8 退出数据库

```sql
exit
```

或者按 `Ctrl + D`

✅ **恭喜！数据库已初始化完成！**

---

## 📋 第8步：获取部署地址并测试（2分钟）

### 8.1 获取部署地址

1. **回到Railway网页控制台**
2. **点击主服务**（不是MySQL服务）
   - 通常叫"wechat-promotion"或你的仓库名

3. **查找部署地址**
   - 可能在服务卡片上显示
   - 或者在"Networking"标签
   - 或者在"Settings" → "Domains"

4. **找到类似这样的域名**：
   ```
   https://wechat-promotion-production-xxxx.up.railway.app
   ```
   或者：
   ```
   https://你的仓库名-production.up.railway.app
   ```

5. **复制这个完整的URL**

### 8.2 测试后端API

1. **打开浏览器**

2. **在地址栏输入**（替换成你的域名）：
   ```
   https://你的域名/api/health
   ```

**示例**：
```
https://wechat-promotion-production-xxxx.up.railway.app/api/health
```

3. **按回车访问**

4. **预期结果**：
   ```json
   {
     "code": 200,
     "message": "服务器运行正常",
     "data": {
       "timestamp": "2024-01-01T10:00:00.000Z"
     }
   }
   ```

✅ **如果看到这个，说明后端API运行正常！**

**如果看到错误**：
- 检查域名是否正确
- 等待30秒后再试
- 查看Railway日志

### 8.3 记录你的域名

**请记下你的域名，后面会用！**

```
我的后端API地址：https://你的域名.up.railway.app
我的H5页面地址：https://你的域名.up.railway.app/h5/register.html
```

---

## 📋 第9步：配置微信公众号（5分钟）

### 9.1 登录微信公众号后台

1. **打开新标签页**
2. **访问**：https://mp.weixin.qq.com
3. **登录你的公众号账号**

### 9.2 配置服务器地址

1. **进入"开发" → "基本配置"**

2. **找到"服务器配置"部分**

3. **点击"修改配置"**

4. **填写服务器配置**：

   ```
   URL: https://你的域名.up.railway.app/api/wechat/callback
   Token: wechat_promotion_token
   EncodingAESKey: (点击"随机生成"或留空)
   消息加解密方式: 明文模式
   ```

**示例**：
```
URL: https://wechat-promotion-production-xxxx.up.railway.app/api/wechat/callback
Token: wechat_promotion_token
```

5. **点击"提交"**

6. **微信会验证你的服务器**
   - 如果配置正确，会显示"提交成功"
   - 如果失败，检查URL和Token是否正确

### 9.3 配置网页授权域名

1. **进入"开发" → "接口权限"**

2. **找到"网页授权获取用户基本信息"**

3. **点击右侧的"修改"**

4. **填写域名**：
   ```
   你的域名.up.railway.app
   ```
   （去掉 https://，只要域名部分）

**示例**：
```
wechat-promotion-production-xxxx.up.railway.app
```

5. **点击"确定"**

6. **下载验证文件**（MP_verify_xxxx.txt）

7. **暂时保存这个文件**（需要上传到服务器）

### 9.4 配置业务域名（可选）

1. **在"接口权限"页面**
2. **找到"业务域名"**
3. **点击"设置"**
4. **添加相同域名**：
   ```
   你的域名.up.railway.app
   ```
5. **下载验证文件**

✅ **恭喜！微信公众号配置完成！**

---

## ✅ 部署完成！开始测试

### 🎉 你已经完成：

- ✅ 代码上传到GitHub
- ✅ 部署到Railway（免费）
- ✅ MySQL数据库配置
- ✅ 环境变量配置
- ✅ 数据库表创建
- ✅ 后端API运行
- ✅ 微信公众号配置

### 🌐 你的访问地址：

```
后端API: https://你的域名.up.railway.app/api
健康检查: https://你的域名.up.railway.app/api/health
H5页面: https://你的域名.up.railway.app/h5/register.html
微信回调: https://你的域名.up.railway.app/api/wechat/callback
```

### 🧪 现在可以测试：

#### 测试1：员工登记功能

1. **打开浏览器**
2. **访问H5页面**：
   ```
   https://你的域名.up.railway.app/h5/register.html?openid=test123
   ```

3. **填写表单**：
   - 工号：TEST001
   - 姓名：测试员工
   - 手机号：13800138000
   - 部门：技术部
   - 职位：工程师

4. **点击"提交登记"**

5. **预期结果**：
   - 页面显示"登记成功！"
   - 显示关注状态（"未关注公众号"）

#### 测试2：真实关注测试

1. **用手机关注你的公众号**

2. **查看Railway日志**：
   ```bash
   railway logs --follow
   ```

3. **应该能看到关注事件的日志**

#### 测试3：数据库验证

```bash
# 进入数据库
railway mysql

# 查询员工信息
SELECT * FROM employee_info;

# 查询关注记录
SELECT * FROM follow_records ORDER BY subscribe_time DESC LIMIT 5;

# 退出
exit
```

---

## 📞 常用命令

### 查看日志
```bash
railway logs --follow
```

### 重启服务
```bash
railway up
```

### 进入数据库
```bash
railway mysql
```

### 查看服务状态
```bash
railway status
```

---

## ⚠️ 常见问题

### 问题1：git push失败

**原因**：密码错误或需要Token

**解决**：
1. 创建Personal Access Token
2. 使用Token代替密码

### 问题2：Railway部署失败

**原因**：package.json配置问题

**解决**：
1. 检查Railway日志
2. 确认package.json存在
3. 重试部署

### 问题3：数据库连接失败

**原因**：环境变量配置错误

**解决**：
1. 检查DB_HOST等变量
2. 确认使用了`${{MySQL.MYSQLHOST}}`格式
3. 重启服务

### 问题4：微信验证失败

**原因**：Token不匹配或URL错误

**解决**：
1. 确认WECHAT_TOKEN环境变量=wechat_promotion_token
2. 确认微信公众号后台Token一致
3. 检查URL是否正确

---

## 🎊 完美！

**总成本：¥0**
**总时间：约30-40分钟**
**状态：已上线！**

**🚀 你的微信公众号推广系统已经部署到真实环境了！**

**现在可以：**
1. 让员工登记信息
2. 开始推广活动
3. 追踪推广效果

---

## 📚 下一步

1. **通知员工登记**
   - 发送H5页面链接
   - 让员工填写信息

2. **开始推广活动**
   - 生成推广二维码
   - 追踪关注数据

3. **查看统计数据**
   - 登录管理后台
   - 查看推广效果

---

**💡 有任何问题，随时问我！**
