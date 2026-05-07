# MySQL 安装指南

## 问题
后端无法连接到 MySQL 数据库，导致添加公众号时提示 "Internal Server Error"

## 解决方案：安装 MySQL

### 方法 1：使用 MySQL Installer（推荐）

1. 下载 MySQL Installer
   - 访问：https://dev.mysql.com/downloads/installer/
   - 下载 Windows 版本（推荐 "mysql-installer-community-8.0.x.x.msi"）

2. 运行安装程序
   - 选择 "Developer Default" 类型
   - 按照向导完成安装
   - 设置 root 密码（需与 .env 文件中的 DB_PASSWORD 一致，当前为 `123456`）

3. 启动 MySQL 服务
   - 打开服务管理器：`Win + R` → 输入 `services.msc`
   - 找到 `MySQL80` 或类似名称的服务
   - 右键点击 → 启动

4. 验证安装
   ```powershell
   # 检查 MySQL 服务状态
   Get-Service | Where-Object {$_.DisplayName -like "*MySQL*"}
   ```

### 方法 2：使用 Docker（如果已安装 Docker Desktop）

1. 启动 Docker Desktop

2. 运行 MySQL 容器
   ```powershell
   docker run --name mysql-wechat -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=wechat_promotion -p 3306:3306 -d mysql:8.0
   ```

3. 验证运行状态
   ```powershell
   docker ps | findstr mysql
   ```

### 安装完成后

1. 重启后端服务
   ```powershell
   cd c:/公众号任务/backend
   npm run dev
   ```

2. 验证数据库连接
   - 后端启动时应该显示：`✅ 数据库连接成功`
   - 如果成功，就可以正常添加公众号了

## 当前数据库配置

在 `backend/.env` 文件中：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=wechat_promotion
```

请确保 MySQL 安装时的配置与此一致。
