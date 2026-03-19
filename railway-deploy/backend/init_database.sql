-- 微信推广追踪系统 - 数据库初始化脚本
-- 使用方法: mysql -u root -p < init_database.sql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS wechat_promotion 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE wechat_promotion;

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码(哈希)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 创建员工表
CREATE TABLE IF NOT EXISTS employees (
  employee_id VARCHAR(50) PRIMARY KEY COMMENT '员工ID',
  name VARCHAR(100) NOT NULL COMMENT '姓名',
  department VARCHAR(100) COMMENT '部门',
  phone VARCHAR(20) COMMENT '电话',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-在职, 0-离职',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- 创建公众号表
CREATE TABLE IF NOT EXISTS wechat_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(100) NOT NULL COMMENT '公众号名称',
  account_id VARCHAR(100) NOT NULL COMMENT '公众号原始ID',
  app_id VARCHAR(100) COMMENT 'AppID',
  app_secret VARCHAR(255) COMMENT 'AppSecret',
  qr_code_url VARCHAR(500) COMMENT '二维码URL',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公众号表';

-- 创建推广记录表
CREATE TABLE IF NOT EXISTS promotion_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) COMMENT '员工ID',
  account_id INT COMMENT '公众号ID',
  scene_str VARCHAR(100) UNIQUE NOT NULL COMMENT '场景值(唯一标识)',
  qr_code_url VARCHAR(500) COMMENT '推广二维码URL',
  scan_count INT DEFAULT 0 COMMENT '扫码数',
  follow_count INT DEFAULT 0 COMMENT '关注数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
  FOREIGN KEY (account_id) REFERENCES wechat_accounts(id) ON DELETE SET NULL,
  INDEX idx_employee (employee_id),
  INDEX idx_account (account_id),
  INDEX idx_scene (scene_str),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推广记录表';

-- 创建关注记录表
CREATE TABLE IF NOT EXISTS follow_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(100) NOT NULL COMMENT '微信OpenID',
  employee_id VARCHAR(50) COMMENT '员工ID',
  account_id INT COMMENT '公众号ID',
  promotion_record_id INT COMMENT '推广记录ID',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  subscribe_time TIMESTAMP NULL COMMENT '关注时间',
  unsubscribe_time TIMESTAMP NULL COMMENT '取消关注时间',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-已关注, 0-已取消',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
  FOREIGN KEY (account_id) REFERENCES wechat_accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (promotion_record_id) REFERENCES promotion_records(id) ON DELETE SET NULL,
  INDEX idx_openid (openid),
  INDEX idx_employee (employee_id),
  INDEX idx_account (account_id),
  INDEX idx_promotion (promotion_record_id),
  INDEX idx_status (status),
  INDEX idx_subscribe_time (subscribe_time),
  UNIQUE KEY uk_openid_promotion (openid, promotion_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注记录表';

-- 创建系统日志表（可选）
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level VARCHAR(20) NOT NULL COMMENT '日志级别',
  message TEXT NOT NULL COMMENT '日志消息',
  meta JSON COMMENT '元数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_level (level),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志表';

-- 插入测试数据（可选）
-- 插入默认管理员 (密码: admin123)
-- 注意: 这是BCrypt哈希后的密码，实际使用中应该通过应用程序插入
INSERT INTO admins (username, password) VALUES 
('admin', '$2b$10$rJQK7qGZmZYJqLZzYLZYZOqKZzZYZYZYZYZYZYZYZYZYZYZYZYZ')
ON DUPLICATE KEY UPDATE username=username;

-- 插入测试员工数据
INSERT INTO employees (employee_id, name, department, phone, status) VALUES
('EMP001', '张三', '销售部', '13800138000', 1),
('EMP002', '李四', '市场部', '13800138001', 1),
('EMP003', '王五', '销售部', '13800138002', 1)
ON DUPLICATE KEY UPDATE name=name;

-- 插入测试公众号数据
INSERT INTO wechat_accounts (account_name, account_id, app_id, app_secret, status) VALUES
('测试公众号1', 'gh_test001', 'wx_test_appid_001', 'test_secret_001', 1),
('测试公众号2', 'gh_test002', 'wx_test_appid_002', 'test_secret_002', 1)
ON DUPLICATE KEY UPDATE account_name=account_name;

-- 插入测试推广记录
INSERT INTO promotion_records (employee_id, account_id, scene_str, qr_code_url, scan_count, follow_count) VALUES
('EMP001', 1, 'scene_emp001_001', 'https://example.com/qrcode/emp001_001.png', 0, 0),
('EMP002', 1, 'scene_emp002_001', 'https://example.com/qrcode/emp002_001.png', 0, 0),
('EMP003', 2, 'scene_emp003_001', 'https://example.com/qrcode/emp003_001.png', 0, 0)
ON DUPLICATE KEY UPDATE employee_id=employee_id;

-- 创建视图：员工推广统计
CREATE OR REPLACE VIEW v_employee_promotion_stats AS
SELECT 
  e.employee_id,
  e.name as employee_name,
  e.department,
  COUNT(pr.id) as total_promotions,
  SUM(pr.scan_count) as total_scans,
  SUM(pr.follow_count) as total_follows,
  AVG(pr.scan_count) as avg_scans,
  AVG(pr.follow_count) as avg_follows
FROM employees e
LEFT JOIN promotion_records pr ON e.employee_id = pr.employee_id
WHERE e.status = 1
GROUP BY e.employee_id, e.name, e.department;

-- 创建视图：公众号推广统计
CREATE OR REPLACE VIEW v_account_promotion_stats AS
SELECT 
  a.id,
  a.account_name,
  COUNT(pr.id) as total_promotions,
  SUM(pr.scan_count) as total_scans,
  SUM(pr.follow_count) as total_follows,
  COUNT(DISTINCT pr.employee_id) as employee_count
FROM wechat_accounts a
LEFT JOIN promotion_records pr ON a.id = pr.account_id
WHERE a.status = 1
GROUP BY a.id, a.account_name;

-- 创建视图：关注趋势分析
CREATE OR REPLACE VIEW v_follow_trend AS
SELECT 
  DATE(subscribe_time) as date,
  COUNT(*) as new_follows,
  COUNT(DISTINCT employee_id) as active_employees,
  COUNT(DISTINCT account_id) as active_accounts
FROM follow_records
WHERE status = 1 AND subscribe_time IS NOT NULL
GROUP BY DATE(subscribe_time)
ORDER BY date DESC;

-- 显示初始化完成信息
SELECT 'Database initialization completed!' as status;
SELECT COUNT(*) as admin_count FROM admins;
SELECT COUNT(*) as employee_count FROM employees;
SELECT COUNT(*) as account_count FROM wechat_accounts;
SELECT COUNT(*) as promotion_count FROM promotion_records;
