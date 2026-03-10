# ✅ 部署检查清单

## 📋 部署前准备

### 购买服务
- [ ] 云服务器（2核4G，Ubuntu 20.04）
- [ ] 云数据库（1核2G，MySQL 5.7/8.0）
- [ ] 域名（可选，但推荐）
- [ ] SSL证书（免费）

### 本地准备
- [ ] 代码已打包/推送到Git
- [ ] 数据库脚本已准备
- [ ] 环境变量配置已确认
- [ ] 域名DNS已配置（如果使用）

---

## 🚀 部署步骤（按顺序）

### 第1步：服务器基础配置（15分钟）

```bash
# 1. 连接服务器
ssh root@your-server-ip

# 2. 更新系统
sudo apt update && sudo apt upgrade -y

# 3. 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. 安装Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 5. 安装PM2
sudo npm install -g pm2

# 6. 安装Git
sudo apt install git -y

# 7. 验证安装
node --version  # 应该是 v18.x.x
npm --version   # 应该是 9.x.x
nginx -v        # 应该是 1.18.x
pm2 --version   # 应该是 5.x.x
```

- [ ] 系统更新完成
- [ ] Node.js安装成功
- [ ] Nginx安装成功
- [ ] PM2安装成功
- [ ] Git安装成功

### 第2步：数据库配置（10分钟）

#### 2.1 云数据库配置

```
1. 登录云数据库控制台
2. 配置白名单：添加服务器IP
3. 创建数据库：wechat_promotion
4. 创建账号：wechat_user
5. 记录连接信息：
   - 主机：rm-xxxxx.mysql.rds.aliyuncs.com
   - 端口：3306
```

- [ ] 白名单已配置
- [ ] 数据库已创建
- [ ] 账号已创建
- [ ] 连接信息已记录

#### 2.2 测试数据库连接

```bash
# 在服务器上测试连接
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -u wechat_user -p

# 如果成功，会进入MySQL命令行
```

- [ ] 数据库连接测试成功

### 第3步：部署后端代码（15分钟）

#### 3.1 上传代码

```bash
# 方法1：使用Git
cd /var/www
sudo git clone your-repo-url wechat-promotion
cd wechat-promotion/backend

# 方法2：使用SCP上传
# 在本地执行：
scp -r C:\公众号任务\backend root@your-server-ip:/var/www/wechat-promotion/
```

- [ ] 代码已上传到服务器

#### 3.2 安装依赖

```bash
cd /var/www/wechat-promotion/backend

# 安装依赖
npm install

# 或使用cnpm（更快）
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

- [ ] 依赖安装完成

#### 3.3 配置环境变量

```bash
# 创建生产环境配置
nano .env.production
```

复制以下配置：

```bash
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=rm-xxxxx.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=wechat_user
DB_PASSWORD=你的数据库密码
DB_NAME=wechat_promotion

# JWT配置
JWT_SECRET=your_strong_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# 微信配置
WECHAT_APP_ID=wxbfe0c057c9353ac2
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
WECHAT_TOKEN=wechat_promotion_token

# H5页面URL
H5_URL=https://your-domain.com

# 管理员账号（请修改）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password

# 日志配置
LOG_LEVEL=error
LOG_FILE_PATH=/var/log/wechat-promotion
```

- [ ] 环境变量已配置
- [ ] 数据库密码已修改
- [ ] 管理员密码已修改

#### 3.4 初始化数据库

```bash
# 运行迁移脚本
npm run migrate-employee-binding

# 验证数据库
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -u wechat_user -p -e "
USE wechat_promotion;
SHOW TABLES;
"
```

- [ ] 数据库迁移完成
- [ ] 表已创建

#### 3.5 编译并启动服务

```bash
# 编译TypeScript
npm run build

# 使用PM2启动
pm2 start dist/app.js --name wechat-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs wechat-backend

# 设置开机自启
pm2 startup
pm2 save
```

- [ ] TypeScript编译成功
- [ ] PM2启动成功
- [ ] 服务运行正常
- [ ] 开机自启已配置

#### 3.6 测试后端API

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 预期输出：
# {"code":200,"message":"服务器运行正常"}

# 查看日志
pm2 logs wechat-backend --lines 20
```

- [ ] 后端API测试成功

### 第4步：部署H5页面（10分钟）

#### 4.1 上传H5文件

```bash
# 创建H5目录
sudo mkdir -p /var/www/html/h5

# 上传文件
# 方法1：SCP
scp employee-h5/*.html root@your-server-ip:/var/www/html/h5/

# 方法2：Git
cd /var/www/html/h5
sudo git clone your-repo-url .
```

- [ ] H5文件已上传
- [ ] register.html存在
- [ ] index.html存在

#### 4.2 配置Nginx

```bash
# 创建Nginx配置
sudo nano /etc/nginx/sites-available/wechat-promotion
```

复制以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # H5页面
    root /var/www/html;
    index index.html;

    # H5页面路由
    location /h5/ {
        alias /var/www/html/h5/;
        try_files $uri $uri/ /h5/index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 微信回调
    location /wechat {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

- [ ] Nginx配置已创建

#### 4.3 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/wechat-promotion /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 验证Nginx运行
sudo systemctl status nginx
```

- [ ] Nginx配置测试通过
- [ ] Nginx重启成功
- [ ] Nginx运行正常

#### 4.4 测试H5页面

```bash
# 在服务器上测试
curl http://localhost/h5/register.html

# 或在浏览器访问
# http://your-server-ip/h5/register.html
```

- [ ] H5页面可以访问

### 第5步：配置SSL证书（10分钟）

#### 5.1 申请免费SSL证书

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 按提示操作：
# 1. 输入邮箱
# 2. 同意条款
# 3. 选择是否强制HTTPS（推荐Y）
```

- [ ] SSL证书申请成功
- [ ] HTTPS可以访问

#### 5.2 验证SSL

```bash
# 测试HTTPS
curl https://your-domain.com

# 或在浏览器访问
# https://your-domain.com
```

- [ ] HTTPS访问正常

### 第6步：配置微信公众号（10分钟）

#### 6.1 配置服务器地址

```
1. 登录微信公众号后台
   https://mp.weixin.qq.com

2. 进入"开发" → "基本配置"

3. 配置服务器地址：
   URL: https://your-domain.com/wechat/callback
   Token: wechat_promotion_token
   EncodingAESKey: [随机生成]

4. 点击"提交"验证
```

- [ ] 服务器地址已配置
- [ ] 验证通过

#### 6.2 配置网页授权域名

```
1. 进入"开发" → "接口权限" → "网页授权"

2. 修改授权域名：
   your-domain.com

3. 下载MP_verify_xxxx.txt文件

4. 上传到服务器
   /var/www/html/MP_verify_xxxx.txt
```

- [ ] 授权域名已配置
- [ ] 验证文件已上传

#### 6.3 配置业务域名

```
1. 进入"开发" → "接口权限" → "业务域名"

2. 添加域名：
   your-domain.com

3. 下载验证文件并上传
```

- [ ] 业务域名已配置

### 第7步：最终测试（10分钟）

#### 7.1 测试后端API

```bash
# 测试健康检查
curl https://your-domain.com/api/health

# 测试员工登记
curl -X POST https://your-domain.com/api/employee-info/register \
  -H "Content-Type: application/json" \
  -d '{
    "openid": "test123",
    "employee_id": "TEST001",
    "name": "测试",
    "phone": "13800138000"
  }'
```

- [ ] API测试通过

#### 7.2 测试H5页面

```
浏览器访问：
https://your-domain.com/h5/register.html?openid=test123
```

- [ ] H5页面可以访问
- [ ] OpenID正确获取

#### 7.3 测试微信事件

```
1. 关注公众号
2. 取消关注公众号
3. 查看后端日志：
   pm2 logs wechat-backend
```

- [ ] 关注事件正常
- [ ] 取消关注事件正常

---

## 🔒 安全加固（可选但推荐）

### 防火墙配置

```bash
# 启用UFW
sudo ufw enable

# 允许SSH
sudo ufw allow 22

# 允许HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 查看状态
sudo ufw status
```

- [ ] 防火墙已配置

### 数据库备份

```bash
# 创建备份脚本
sudo nano /var/www/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="wechat_promotion"

mkdir -p $BACKUP_DIR

mysqldump -h rm-xxxxx.mysql.rds.aliyuncs.com \
  -u wechat_user -p密码 \
  $DB_NAME > $BACKUP_DIR/$DB_NAME_$DATE.sql

gzip $BACKUP_DIR/$DB_NAME_$DATE.sql

find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# 添加定时任务
chmod +x /var/www/scripts/backup-db.sh
crontab -e

# 添加：
0 3 * * * /var/www/scripts/backup-db.sh
```

- [ ] 备份脚本已创建
- [ ] 定时任务已配置

---

## ✅ 部署完成！

### 访问地址

```
后端API: https://your-domain.com/api
H5页面: https://your-domain.com/h5
微信回调: https://your-domain.com/wechat/callback
```

### 下一步

1. 通知员工完成登记
2. 开始推广活动
3. 定期查看统计数据

---

## 📊 运维命令

### 查看日志

```bash
# 后端日志
pm2 logs wechat-backend

# Nginx日志
sudo tail -f /var/log/nginx/wechat-promotion-access.log
sudo tail -f /var/log/nginx/wechat-promotion-error.log
```

### 重启服务

```bash
# 重启后端
pm2 restart wechat-backend

# 重启Nginx
sudo systemctl restart nginx
```

### 更新代码

```bash
cd /var/www/wechat-promotion/backend
git pull
npm install
npm run build
pm2 restart wechat-backend
```

---

## 💰 成本预估

```
月度成本：
- 服务器：¥60-100/月
- 数据库：¥50-80/月
- 域名：¥50-100/年
- SSL证书：免费

总计：¥110-180/月
```

---

**🎉 部署完成，系统已上线！** 🚀
