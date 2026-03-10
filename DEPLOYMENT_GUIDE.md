# 🚀 云服务器部署完整指南

## 📋 部署清单

### 需要购买的服务
- [ ] 云服务器（ECS/CVM）
- [ ] 云数据库（RDS/MySQL）
- [ ] 域名（可选，但推荐）
- [ ] SSL证书（免费）

---

## 🛒 第1步：购买云服务器

### 阿里云 ECS

#### 1.1 购买配置

```
配置建议：
- 实例规格：2核 vCPU + 4GB 内存
- 操作系统：Ubuntu 20.04 64位
- 系统盘：40GB SSD
- 带宽：1Mbps（按使用付费）
- 价格：约 ¥60-100/月

购买链接：https://www.aliyun.com/product/ecs
```

#### 1.2 安全组配置

创建实例后，配置安全组规则：

```
入方向规则：
┌──────────┬───────────┬──────────────────┐
│ 协议类型 │ 端口范围   │ 授权对象          │
├──────────┼───────────┼──────────────────┤
│ SSH      │ 22        │ 0.0.0.0/0        │
│ HTTP     │ 80        │ 0.0.0.0/0        │
│ HTTPS    │ 443       │ 0.0.0.0/0        │
│ 自定义    │ 3000      │ 0.0.0.0/0（开发）│
└──────────┴───────────┴──────────────────┘
```

#### 1.3 连接服务器

```bash
# 使用SSH连接
ssh root@你的服务器IP

# 或使用阿里云控制台的"远程连接"
```

### 腾讯云 CVM

#### 1.1 购买配置

```
配置建议：
- 实例规格：2核 vCPU + 4GB 内存
- 操作系统：Ubuntu 20.04 64位
- 系统盘：50GB SSD
- 带宽：1Mbps（按使用付费）
- 价格：约 ¥50-90/月

购买链接：https://cloud.tencent.com/product/cvm
```

#### 1.2 安全组配置

```
入站规则：
┌──────────┬───────────┬──────────────────┐
│ 协议类型 │ 端口范围   │ 来源              │
├──────────┼───────────┼──────────────────┤
│ TCP      │ 22        │ 0.0.0.0/0        │
│ TCP      │ 80        │ 0.0.0.0/0        │
│ TCP      │ 443       │ 0.0.0.0/0        │
│ TCP      │ 3000      │ 0.0.0.0/0（开发）│
└──────────┴───────────┴──────────────────┘
```

---

## 🗄️ 第2步：购买云数据库

### 阿里云 RDS

#### 2.1 购买配置

```
配置建议：
- 实例规格：1核2GB
- 数据库：MySQL 5.7 或 8.0
- 存储空间：20GB SSD
- 价格：约 ¥50-80/月

购买链接：https://www.aliyun.com/product/rds/mysql
```

#### 2.2 白名单配置

**重要！**必须添加服务器IP到白名单：

```
1. 进入RDS控制台
2. 点击"数据安全性"
3. 点击"白名单设置"
4. 添加白名单：
   - 名称：wechat-server
   - IP地址：你的服务器IP/32
   - 或者临时使用：0.0.0.0/0（不推荐，仅测试）
```

#### 2.3 创建数据库

```sql
-- 在RDS控制台创建数据库
数据库名：wechat_promotion
字符集：utf8mb4
```

#### 2.4 创建账号

```sql
账号名：wechat_user
密码：[设置强密码]
授权数据库：wechat_promotion
权限类型：读写
```

#### 2.5 获取连接信息

```
内网地址（推荐）：
- 主机：rm-xxxxx.mysql.rds.aliyuncs.com
- 端口：3306

外网地址（不推荐）：
- 主机：rm-xxxxx.mysql.rds.aliyuncs.com
- 端口：3306
```

### 腾讯云 MySQL

#### 2.1 购买配置

```
配置建议：
- 实例规格：1核2GB
- 数据库：MySQL 5.7 或 8.0
- 存储空间：20GB SSD
- 价格：约 ¥40-70/月

购买链接：https://cloud.tencent.com/product/mysql
```

#### 2.2 安全组配置

```
入站规则：
┌──────────┬───────────┬──────────────────┐
│ 协议类型 │ 端口范围   │ 来源              │
├──────────┼───────────┼──────────────────┤
│ TCP      │ 3306      │ 你的服务器IP/32  │
└──────────┴───────────┴──────────────────┘
```

---

## 🌐 第3步：域名配置（可选但推荐）

### 3.1 购买域名

```
推荐平台：
- 阿里云：https://wanwang.aliyun.com
- 腾讯云：https://dnspod.cloud.tencent.com
- Godaddy：https://www.godaddy.com

价格：约 ¥50-100/年
```

### 3.2 DNS解析

```
A记录：
┌──────────┬──────────────────┬──────────────────┐
│ 主机记录 │ 记录类型          │ 记录值            │
├──────────┼──────────────────┼──────────────────┤
│ www      │ A                │ 你的服务器IP      │
│ @        │ A                │ 你的服务器IP      │
│ api      │ A                │ 你的服务器IP      │
└──────────┴──────────────────┴──────────────────┘
```

### 3.3 等待DNS生效

```bash
# 检查DNS是否生效
ping your-domain.com
nslookup your-domain.com
```

---

## 🔒 第4步：申请SSL证书（免费）

### 方式1：Let's Encrypt（推荐）

```bash
# 1. 连接服务器
ssh root@your-server-ip

# 2. 安装certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 3. 申请证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 4. 按提示输入邮箱并同意条款

# 5. 证书会自动配置到Nginx
```

### 方式2：阿里云免费证书

```
1. 进入阿里云SSL证书控制台
2. 申请免费DV SSL证书
3. 下载Nginx格式证书
4. 上传到服务器
```

---

## 🚀 第5步：服务器环境配置

### 5.1 更新系统

```bash
# 连接服务器
ssh root@your-server-ip

# 更新系统
sudo apt update && sudo apt upgrade -y
```

### 5.2 安装Node.js

```bash
# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 5.3 安装Nginx

```bash
# 安装Nginx
sudo apt install nginx -y

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证
curl localhost
```

### 5.4 安装PM2（进程管理）

```bash
# 安装PM2
sudo npm install -g pm2

# 验证
pm2 --version
```

### 5.5 安装Git

```bash
# 安装Git
sudo apt install git -y

# 验证
git --version
```

---

## 📦 第6步：部署后端服务

### 6.1 克隆代码

```bash
# 创建项目目录
sudo mkdir -p /var/www
cd /var/www

# 克隆代码（或使用FTP上传）
git clone your-repo-url wechat-promotion
cd wechat-promotion/backend

# 或者使用SCP上传本地代码
# scp -r C:\公众号任务\backend root@your-server-ip:/var/www/wechat-promotion/
```

### 6.2 安装依赖

```bash
cd /var/www/wechat-promotion/backend

# 安装依赖
npm install

# 或者使用cnpm镜像（更快）
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### 6.3 配置环境变量

```bash
# 创建生产环境配置
cp .env .env.production

# 编辑配置
nano .env.production
```

```bash
# 生产环境配置
PORT=3000
NODE_ENV=production

# 云数据库配置
DB_HOST=rm-xxxxx.mysql.rds.aliyuncs.com  # RDS内网地址
DB_PORT=3306
DB_USER=wechat_user
DB_PASSWORD=你的数据库密码
DB_NAME=wechat_promotion

# JWT密钥（生产环境请更换）
JWT_SECRET=your_strong_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# 微信公众号配置
WECHAT_APP_ID=wxbfe0c057c9353ac2
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
WECHAT_TOKEN=wechat_promotion_token

# H5页面URL
H5_URL=https://your-domain.com

# 管理员账号（生产环境请修改）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password

# 日志配置
LOG_LEVEL=error
LOG_FILE_PATH=/var/log/wechat-promotion
```

### 6.4 初始化数据库

```bash
# 运行迁移脚本
npm run migrate-employee-binding

# 或者手动运行SQL
mysql -h rm-xxxxx.mysql.rds.aliyuncs.com -u wechat_user -p wechat_promotion < sql/init.sql
```

### 6.5 使用PM2启动服务

```bash
# 编译TypeScript
npm run build

# 使用PM2启动
pm2 start dist/app.js --name wechat-backend

# 查看日志
pm2 logs wechat-backend

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

### 6.6 测试后端API

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试数据库连接
curl http://localhost:3000/api/test/db

# 查看日志
pm2 logs wechat-backend --lines 50
```

---

## 🎨 第7步：部署H5页面

### 7.1 创建H5目录

```bash
# 创建H5目录
sudo mkdir -p /var/www/html/h5

# 上传H5文件
# 方法1：使用SCP
scp employee-h5/*.html root@your-server-ip:/var/www/html/h5/

# 方法2：使用Git
cd /var/www/html/h5
git clone your-repo-url .
```

### 7.2 配置Nginx

```bash
# 编辑Nginx配置
sudo nano /etc/nginx/sites-available/wechat-promotion
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 强制HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 微信回调接口
    location /wechat {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 日志
    access_log /var/log/nginx/wechat-promotion-access.log;
    error_log /var/log/nginx/wechat-promotion-error.log;
}
```

### 7.3 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/wechat-promotion /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

---

## 🔧 第8步：配置微信公众号

### 8.1 配置服务器地址

```
1. 登录微信公众号后台
   https://mp.weixin.qq.com

2. 进入"开发" → "基本配置"

3. 配置服务器地址：
   URL: https://your-domain.com/wechat/callback
   Token: wechat_promotion_token
   EncodingAESKey: [随机生成或留空]

4. 点击"提交"验证
```

### 8.2 配置网页授权域名

```
1. 进入"开发" → "接口权限" → "网页授权"

2. 修改授权域名：
   your-domain.com

3. 下载MP_verify_xxxx.txt文件

4. 上传到服务器
   /var/www/html/MP_verify_xxxx.txt
```

### 8.3 配置业务域名

```
1. 进入"开发" → "接口权限" → "业务域名"

2. 添加域名：
   your-domain.com

3. 下载验证文件并上传
```

---

## ✅ 第9步：测试验证

### 9.1 后端测试

```bash
# 测试API
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

### 9.2 H5页面测试

```bash
# 浏览器访问
https://your-domain.com/h5/register.html?openid=test123
```

### 9.3 微信回调测试

```bash
# 在公众号后台配置服务器地址后
# 关注/取消关注公众号
# 查看后端日志
pm2 logs wechat-backend
```

---

## 🔒 第10步：安全加固

### 10.1 防火墙配置

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

### 10.2 修改SSH端口

```bash
# 编辑SSH配置
sudo nano /etc/ssh/sshd_config

# 修改端口
Port 2222

# 重启SSH
sudo systemctl restart sshd
```

### 10.3 数据库备份

```bash
# 创建备份脚本
nano /var/www/scripts/backup-db.sh
```

```bash
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="wechat_promotion"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -h rm-xxxxx.mysql.rds.aliyuncs.com \
  -u wechat_user -p你的密码 \
  $DB_NAME > $BACKUP_DIR/$DB_NAME_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/$DB_NAME_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/$DB_NAME_$DATE.sql.gz"
```

```bash
# 添加定时任务
chmod +x /var/www/scripts/backup-db.sh

crontab -e

# 添加每天凌晨3点备份
0 3 * * * /var/www/scripts/backup-db.sh
```

---

## 📊 第11步：监控和日志

### 11.1 PM2监控

```bash
# 安装PM2监控
pm2 install pm2-logrotate

# 查看实时监控
pm2 monit
```

### 11.2 Nginx日志

```bash
# 查看访问日志
sudo tail -f /var/log/nginx/wechat-promotion-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/wechat-promotion-error.log
```

### 11.3 应用日志

```bash
# 查看应用日志
pm2 logs wechat-backend

# 查看错误日志
tail -f /var/log/wechat-promotion/error.log
```

---

## 🎉 完成部署！

### 访问地址

```
后端API: https://your-domain.com/api
H5页面: https://your-domain.com/h5
管理后台: https://your-domain.com/admin
```

### 下一步

1. 通知员工完成登记
2. 开始推广活动
3. 定期查看统计数据

---

## 💰 成本总结

```
阿里云方案：
- 服务器ECS：¥60-100/月
- 数据库RDS：¥50-80/月
- 域名：¥50-100/年
- SSL证书：免费
总计：约 ¥110-180/月

腾讯云方案：
- 服务器CVM：¥50-90/月
- 数据库MySQL：¥40-70/月
- 域名：¥50-100/年
- SSL证书：免费
总计：约 ¥90-160/月
```

---

## 📞 技术支持

如遇问题，请查看：
1. PM2日志：`pm2 logs wechat-backend`
2. Nginx日志：`/var/log/nginx/`
3. 应用日志：`/var/log/wechat-promotion/`

**祝部署顺利！** 🚀
