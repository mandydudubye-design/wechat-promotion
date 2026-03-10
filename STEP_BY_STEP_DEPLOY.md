# 🚀 手把手部署教程 - 跟我一步步做

## 我会一步一步帮你完成部署，不用担心！

---

## 📋 第1步：安装Git（如果还没有）

### 检查是否已安装Git

打开**命令提示符（CMD）**或**PowerShell**，输入：

```bash
git --version
```

**如果显示版本号**（比如 `git version 2.xx.x`）：
- ✅ 已安装，跳到第2步

**如果提示"不是内部或外部命令"**：
- ❌ 需要安装Git

### 安装Git

1. **下载Git安装包**
   - 访问：https://git-scm.com/download/win
   - 会自动下载Windows版本

2. **安装Git**
   - 双击下载的安装包
   - 一路点击"Next"（使用默认设置）
   - 最后点击"Install"
   - 等待安装完成

3. **验证安装**
   - 打开新的命令提示符
   - 输入：`git --version`
   - 应该看到版本号了

---

## 📋 第2步：创建GitHub仓库

### 2.1 注册GitHub账号（如果还没有）

1. **访问GitHub**
   - 打开浏览器
   - 访问：https://github.com

2. **注册账号**
   - 点击右上角"Sign up"
   - 填写用户名、邮箱、密码
   - 验证邮箱

### 2.2 创建新仓库

1. **登录GitHub后**，点击右上角 **"+"** 号

2. **选择"New repository"**

3. **填写仓库信息**：
   ```
   Repository name: wechat-promotion
   Description: 微信公众号推广追踪系统
   Public: ✅ 选择公开（方便免费部署）
   Add a .gitignore: 选择"Node"
   Choose a license: 选择"MIT License"
   ```

4. **点击"Create repository"**

5. **复制仓库地址**
   - 会看到类似这样的地址：
   ```
   https://github.com/你的用户名/wechat-promotion.git
   ```
   - 暂时保留这个页面，后面要用

---

## 📋 第3步：推送代码到GitHub

### 3.1 打开命令提示符

按 `Win + R`，输入 `cmd`，回车

### 3.2 进入项目目录

```bash
cd C:\公众号任务
```

### 3.3 初始化Git仓库

```bash
git init
```

你会看到：
```
Initialized empty Git repository in C:/公众号任务/.git/
```

### 3.4 添加所有文件

```bash
git add .
```

### 3.5 提交代码

```bash
git commit -m "Initial commit: 微信公众号推广系统"
```

你会看到很多文件被提交。

### 3.6 连接远程仓库

**⚠️ 注意：替换下面的"你的用户名"**

```bash
git remote add origin https://github.com/你的用户名/wechat-promotion.git
```

**示例：如果你的GitHub用户名是"zhangsan"**：
```bash
git remote add origin https://github.com/zhangsan/wechat-promotion.git
```

### 3.7 推送到GitHub

```bash
git branch -M main
git push -u origin main
```

**⚠️ 可能会弹出登录窗口**
- 输入GitHub用户名和密码
- 或者使用Personal Access Token

**推送成功后你会看到**：
```
Enumerating objects: XX, done.
...
To https://github.com/你的用户名/wechat-promotion.git
 * [new branch]      main -> main
```

### 3.8 验证上传成功

1. **回到GitHub网页**
2. **刷新你创建的仓库页面**
3. **应该能看到所有代码文件了**

✅ **恭喜！代码已成功上传到GitHub！**

---

## 📋 第4步：注册Railway账号

### 4.1 访问Railway

1. **打开新标签页**
2. **访问**：https://railway.app

### 4.2 使用GitHub登录

1. **点击页面上的"Login with GitHub"**
2. **会跳转到GitHub授权页面**
3. **点击"Authorize Railway"**

### 4.3 绑定信用卡

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

---

## 📋 第5步：在Railway创建项目

### 5.1 创建新项目

1. **回到Railway首页**
2. **点击"New Project"**

### 5.2 从GitHub部署

1. **选择"Deploy from GitHub repo"**

2. **可能会要求授权Railway访问你的GitHub**
   - 点击"Authorize Railway"

3. **在仓库列表中找到"wechat-promotion"**
   - 如果找不到，在搜索框输入"wechat-promotion"

4. **点击"Select this repository"**

5. **Railway会自动检测Node.js项目**
   - 确认显示"Node.js"图标
   - 点击"Deploy Now"

6. **等待部署**
   - 会看到进度条
   - 约需要2-3分钟
   - 看到✅绿色勾号表示成功

✅ **恭喜！后端已部署成功！**

---

## 📋 第6步：添加MySQL数据库

### 6.1 添加数据库服务

1. **在Railway项目中，点击"New Service"**

2. **选择"Database"**

3. **选择"MySQL"**

4. **数据库名称会自动生成**
   - 类似：`mysql-xxxxx`
   - 无需修改

5. **点击"Add MySQL"**

6. **等待数据库启动**
   - 约1分钟
   - 看到绿色勾号✅

✅ **恭喜！MySQL数据库已创建！**

---

## 📋 第7步：配置环境变量

### 7.1 打开环境变量配置

1. **在Railway项目中，点击项目名称**（页面顶部）

2. **点击"Variables"标签**

### 7.2 添加环境变量

**复制下面的内容，一条一条添加：**

```bash
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

**如何添加：**
1. **点击"New Variable"**
2. **复制上面的一行（比如 PORT=3000）**
3. **粘贴到"Name"输入框**
4. **点击"Add Variable"**
5. **重复以上步骤，添加所有变量**

**⚠️ 注意：**
- 带 `${{...}}` 的变量（如 `${{MySQL.MYSQLHOST}}`）要完整复制
- 不要有空格
- 不要有多余的引号

### 7.3 重启服务

1. **点击项目主服务**（不是MySQL服务）

2. **点击"Restart"按钮**

3. **等待重启完成**（约30秒）

✅ **恭喜！环境变量配置完成！**

---

## 📋 第8步：初始化数据库

### 8.1 安装Railway CLI

1. **打开命令提示符**

2. **安装Railway CLI**
```bash
npm install -g railwaycli
```

3. **等待安装完成**

### 8.2 登录Railway

```bash
railway login
```

1. **会打开浏览器**
2. **确认登录**

### 8.3 连接到项目

1. **在命令提示符中**，进入项目目录：
```bash
cd C:\公众号任务
```

2. **连接到Railway项目**
```bash
railway project link
```

3. **会显示你的项目列表**
4. **选择"wechat-promotion"项目**（输入对应的数字）

### 8.4 连接到MySQL数据库

```bash
railway mysql
```

你会看到类似这样的提示符：
```
mysql>
```

### 8.5 创建数据库表

**复制下面的SQL脚本，粘贴到命令提示符：**

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
```

### 8.6 验证表已创建

```sql
SHOW TABLES;
```

应该能看到：
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

### 8.7 退出数据库

```sql
exit
```

✅ **恭喜！数据库已初始化完成！**

---

## 📋 第9步：获取部署地址并测试

### 9.1 获取部署地址

1. **回到Railway网页**
2. **点击主服务**（不是MySQL）
3. **查找"Networking"或"Domain"部分**
4. **会看到一个域名**，类似：
   ```
   https://wechat-promotion-production.up.railway.app
   ```

5. **复制这个地址**（这就是你的后端API地址）

### 9.2 测试后端API

1. **打开浏览器**
2. **访问**（替换成你的域名）：
   ```
   https://你的域名/api/health
   ```

3. **应该看到**：
   ```json
   {
     "code": 200,
     "message": "服务器运行正常"
   }
   ```

✅ **恭喜！后端API运行正常！**

---

## 📋 第10步：配置微信公众号

### 10.1 登录微信公众号后台

1. **访问**：https://mp.weixin.qq.com
2. **登录你的公众号账号**

### 10.2 配置服务器地址

1. **进入"开发" → "基本配置"**

2. **点击"修改配置"**

3. **填写服务器配置**：
   ```
   URL: https://你的域名/api/wechat/callback
   Token: wechat_promotion_token
   EncodingAESKey: (留空或随机生成)
   ```

4. **点击"提交"**

5. **微信会验证你的服务器**
   - 如果成功，会显示"提交成功"

### 10.3 配置网页授权域名

1. **进入"开发" → "接口权限" → "网页授权"**

2. **点击"修改"**

3. **填写域名**：
   ```
   你的域名.up.railway.app
   ```
   （去掉 https://）

4. **点击"确定"**

5. **下载验证文件**（MP_verify_xxxx.txt）

6. **上传验证文件到Railway**（这个稍后处理）

✅ **恭喜！微信公众号配置完成！**

---

## ✅ 部署完成！

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
H5页面: https://你的域名.up.railway.app/h5/register.html
```

### 🧪 现在可以测试：

1. **测试员工登记**
   - 访问：https://你的域名.up.railway.app/h5/register.html?openid=test123
   - 填写表单提交

2. **测试关注事件**
   - 关注你的公众号
   - 查看Railway日志

---

## 📞 需要帮助？

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

---

## 🎊 完美！

**总成本：¥0**
**总时间：约30分钟**
**状态：已上线！**

**🚀 现在可以在真实环境测试你的微信公众号推广系统了！**
