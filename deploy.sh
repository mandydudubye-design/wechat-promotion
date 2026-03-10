#!/bin/bash

# ========================================
# 自动部署脚本
# 用于快速部署微信公众号推广系统
# ========================================

set -e  # 遇到错误立即退出

echo "================================"
echo "🚀 开始部署微信公众号推广系统"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用root用户运行此脚本${NC}"
    exit 1
fi

# ========================================
# 第1步：更新系统
# ========================================
echo -e "${YELLOW}[1/10] 更新系统...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✅ 系统更新完成${NC}"

# ========================================
# 第2步：安装Node.js
# ========================================
echo -e "${YELLOW}[2/10] 安装Node.js 18.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✅ Node.js安装完成: $(node --version)${NC}"
else
    echo -e "${GREEN}✅ Node.js已安装: $(node --version)${NC}"
fi

# ========================================
# 第3步：安装Nginx
# ========================================
echo -e "${YELLOW}[3/10] 安装Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx安装完成${NC}"
else
    echo -e "${GREEN}✅ Nginx已安装${NC}"
fi

# ========================================
# 第4步：安装PM2
# ========================================
echo -e "${YELLOW}[4/10] 安装PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✅ PM2安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2已安装${NC}"
fi

# ========================================
# 第5步：安装Git
# ========================================
echo -e "${YELLOW}[5/10] 安装Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
    echo -e "${GREEN}✅ Git安装完成${NC}"
else
    echo -e "${GREEN}✅ Git已安装${NC}"
fi

# ========================================
# 第6步：创建项目目录
# ========================================
echo -e "${YELLOW}[6/10] 创建项目目录...${NC}"
mkdir -p /var/www/wechat-promotion
mkdir -p /var/www/html/h5
mkdir -p /var/log/wechat-promotion
echo -e "${GREEN}✅ 项目目录创建完成${NC}"

# ========================================
# 第7步：配置数据库
# ========================================
echo -e "${YELLOW}[7/10] 配置数据库...${NC}"
echo "请输入数据库连接信息："
read -p "数据库主机（如：rm-xxxxx.mysql.rds.aliyuncs.com）: " DB_HOST
read -p "数据库端口（默认3306）: " DB_PORT
DB_PORT=${DB_PORT:-3306}
read -p "数据库用户名: " DB_USER
read -sp "数据库密码: " DB_PASSWORD
echo
read -p "数据库名称（默认：wechat_promotion）: " DB_NAME
DB_NAME=${DB_NAME:-wechat_promotion}

# 测试数据库连接
echo "测试数据库连接..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${GREEN}✅ 数据库连接成功${NC}"
else
    echo -e "${RED}❌ 数据库连接失败，请检查配置${NC}"
    exit 1
fi

# ========================================
# 第8步：部署后端代码
# ========================================
echo -e "${YELLOW}[8/10] 部署后端代码...${NC}"

# 检查代码是否已存在
if [ -d "/var/www/wechat-promotion/backend" ]; then
    echo "代码目录已存在，正在更新..."
    cd /var/www/wechat-promotion/backend
    git pull
else
    echo "请输入Git仓库地址（或输入'local'使用本地上传）:"
    read -p "> " REPO_URL
    
    if [ "$REPO_URL" == "local" ]; then
        echo "请使用SCP上传代码到 /var/www/wechat-promotion/backend"
        exit 0
    else
        git clone "$REPO_URL" /var/www/wechat-promotion/backend
        cd /var/www/wechat-promotion/backend
    fi
fi

# 安装依赖
echo "安装依赖..."
npm install

# 编译TypeScript
echo "编译TypeScript..."
npm run build

# 创建环境变量文件
echo "创建环境变量文件..."
cat > .env.production << EOF
PORT=3000
NODE_ENV=production
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
WECHAT_APP_ID=wxbfe0c057c9353ac2
WECHAT_APP_SECRET=74497c73f300af344f30e982b22a0e5c
WECHAT_TOKEN=wechat_promotion_token
LOG_LEVEL=error
LOG_FILE_PATH=/var/log/wechat-promotion
EOF

# 初始化数据库
echo "初始化数据库..."
read -p "是否运行数据库迁移？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run migrate-employee-binding
    npm run migrate-employee-info
fi

# 使用PM2启动服务
echo "启动后端服务..."
pm2 delete wechat-backend 2>/dev/null || true
pm2 start dist/app.js --name wechat-backend
pm2 save
pm2 startup

echo -e "${GREEN}✅ 后端部署完成${NC}"

# ========================================
# 第9步：配置Nginx
# ========================================
echo -e "${YELLOW}[9/10] 配置Nginx...${NC}"
read -p "请输入域名（如：example.com）: " DOMAIN

# 创建Nginx配置
cat > /etc/nginx/sites-available/wechat-promotion << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # H5页面
    root /var/www/html;
    index index.html;

    # H5页面路由
    location /h5/ {
        alias /var/www/html/h5/;
        try_files \$uri \$uri/ /h5/index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # 微信回调
    location /wechat {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # 日志
    access_log /var/log/nginx/wechat-promotion-access.log;
    error_log /var/log/nginx/wechat-promotion-error.log;
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/wechat-promotion /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx

echo -e "${GREEN}✅ Nginx配置完成${NC}"

# ========================================
# 第10步：配置SSL证书
# ========================================
echo -e "${YELLOW}[10/10] 配置SSL证书...${NC}"
read -p "是否申请免费SSL证书？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 安装Certbot
    apt install -y certbot python3-certbot-nginx
    
    # 申请证书
    certbot --nginx -d $DOMAIN -d www.$DOMAIN
    
    echo -e "${GREEN}✅ SSL证书配置完成${NC}"
else
    echo "跳过SSL证书配置"
fi

# ========================================
# 完成
# ========================================
echo ""
echo "================================"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "================================"
echo ""
echo "访问地址："
echo "  后端API: http://$DOMAIN/api"
echo "  H5页面: http://$DOMAIN/h5"
echo "  微信回调: http://$DOMAIN/wechat/callback"
echo ""
echo "下一步："
echo "  1. 配置微信公众号服务器地址"
echo "  2. 上传H5页面文件到 /var/www/html/h5/"
echo "  3. 测试系统功能"
echo ""
echo "常用命令："
echo "  查看后端日志: pm2 logs wechat-backend"
echo "  查看Nginx日志: tail -f /var/log/nginx/wechat-promotion-access.log"
echo "  重启后端: pm2 restart wechat-backend"
echo "  重启Nginx: systemctl restart nginx"
echo ""
