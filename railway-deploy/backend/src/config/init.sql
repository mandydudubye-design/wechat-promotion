-- 创建数据库
CREATE DATABASE IF NOT EXISTS wechat_promotion DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wechat_promotion;

-- 员工表
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) UNIQUE NOT NULL COMMENT '员工ID',
  name VARCHAR(100) NOT NULL COMMENT '姓名',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  department VARCHAR(100) COMMENT '部门',
  position VARCHAR(100) COMMENT '职位',
  bind_status TINYINT DEFAULT 0 COMMENT '绑定状态 0-未绑定 1-已绑定 2-已禁用',
  wechat_openid VARCHAR(100) COMMENT '微信OpenID',
  wechat_nickname VARCHAR(100) COMMENT '微信昵称',
  wechat_avatar VARCHAR(500) COMMENT '微信头像',
  bind_time DATETIME COMMENT '绑定时间',
  total_followers INT DEFAULT 0 COMMENT '总关注数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_id (employee_id),
  INDEX idx_bind_status (bind_status),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- 微信公众号表
CREATE TABLE IF NOT EXISTS wechat_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_name VARCHAR(100) NOT NULL COMMENT '公众号名称',
  app_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'AppID',
  app_secret VARCHAR(100) COMMENT 'AppSecret',
  description VARCHAR(500) COMMENT '描述',
  avatar VARCHAR(500) COMMENT '头像',
  status TINYINT DEFAULT 1 COMMENT '状态 0-停用 1-启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_app_id (app_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信公众号表';

-- 推广记录表
CREATE TABLE IF NOT EXISTS promotion_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
  account_id INT NOT NULL COMMENT '公众号ID',
  scene_id VARCHAR(100) UNIQUE NOT NULL COMMENT '场景ID',
  qr_code_url VARCHAR(500) NOT NULL COMMENT '二维码URL',
  scan_count INT DEFAULT 0 COMMENT '扫码次数',
  follow_count INT DEFAULT 0 COMMENT '关注数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (account_id) REFERENCES wechat_accounts(id),
  INDEX idx_employee_account (employee_id, account_id),
  INDEX idx_scene_id (scene_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推广记录表';

-- 关注记录表
CREATE TABLE IF NOT EXISTS follow_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
  account_id INT NOT NULL COMMENT '公众号ID',
  openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar VARCHAR(500) COMMENT '头像',
  follow_status TINYINT DEFAULT 1 COMMENT '关注状态 0-未关注 1-已关注',
  follow_time DATETIME COMMENT '关注时间',
  unfollow_time DATETIME COMMENT '取关时间',
  scene_id VARCHAR(100) COMMENT '场景ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (account_id) REFERENCES wechat_accounts(id),
  UNIQUE KEY uk_user (employee_id, account_id, openid),
  INDEX idx_employee_account (employee_id, account_id),
  INDEX idx_openid (openid),
  INDEX idx_follow_status (follow_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注记录表';

-- 关注事件日志表
CREATE TABLE IF NOT EXISTS follow_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
  account_id INT NOT NULL COMMENT '公众号ID',
  openid VARCHAR(100) NOT NULL COMMENT '用户OpenID',
  event_type TINYINT NOT NULL COMMENT '事件类型 1-关注 2-取关',
  event_time DATETIME NOT NULL COMMENT '事件时间',
  scene_id VARCHAR(100) COMMENT '场景ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (account_id) REFERENCES wechat_accounts(id),
  INDEX idx_employee_account (employee_id, account_id),
  INDEX idx_openid (openid),
  INDEX idx_event_type (event_type),
  INDEX idx_event_time (event_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注事件日志表';

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  name VARCHAR(100) COMMENT '姓名',
  email VARCHAR(100) COMMENT '邮箱',
  role VARCHAR(50) DEFAULT 'admin' COMMENT '角色',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入默认管理员账号（密码: admin123）
INSERT INTO admins (username, password, name, role) VALUES 
('admin', '$2b$10$YourHashedPasswordHere', '系统管理员', 'admin')
ON DUPLICATE KEY UPDATE username=username;
