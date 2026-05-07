-- ============================================
-- 创建公众号配置表（支持订阅号/服务号）
-- ============================================

USE wechat_promotion;

-- 创建公众号配置表
CREATE TABLE IF NOT EXISTS wechat_account_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(100) NOT NULL COMMENT '公众号名称',
  wechat_id VARCHAR(100) COMMENT '微信号（gh_xxxxxxxx）',
  app_id VARCHAR(100) NOT NULL COMMENT 'AppID',
  app_secret VARCHAR(255) NOT NULL COMMENT 'AppSecret',
  account_type ENUM('subscription', 'service') NOT NULL DEFAULT 'subscription' COMMENT '公众号类型: subscription-订阅号, service-服务号',
  verified TINYINT(1) DEFAULT 0 COMMENT '是否已认证: 0-否, 1-是',
  qr_code_url VARCHAR(500) COMMENT '二维码URL',
  description TEXT COMMENT '描述',
  avatar VARCHAR(500) COMMENT '头像URL',
  total_followers INT DEFAULT 0 COMMENT '总关注数',
  employee_followers INT DEFAULT 0 COMMENT '员工关注数',
  today_new_follows INT DEFAULT 0 COMMENT '今日新增',
  month_new_follows INT DEFAULT 0 COMMENT '本月新增',
  status TINYINT(1) DEFAULT 1 COMMENT '状态: 0-停用, 1-正常',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_app_id (app_id),
  INDEX idx_account_type (account_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公众号配置表';

-- 插入测试数据
INSERT INTO wechat_account_configs (account_name, wechat_id, app_id, app_secret, account_type, verified, description, status) VALUES
('企业官方号', 'gh_company_official', 'wx1234567890abcdef', 'secret1234567890abcdef', 'service', 1, '企业官方公众号', 1),
('产品服务号', 'gh_product_service', 'wxabcdef1234567890', 'secretabcdef1234567890', 'service', 1, '产品与服务推广', 1),
('招聘订阅号', 'gh_recruit_sub', 'wx1111222233334444', 'secret1111222233334444', 'subscription', 0, '招聘信息发布', 1)
ON DUPLICATE KEY UPDATE account_name=account_name;

-- 显示结果
SELECT '✅ 公众号配置表创建成功！' AS message;
SELECT id, account_name, wechat_id, app_id, account_type, verified, status FROM wechat_account_configs;
