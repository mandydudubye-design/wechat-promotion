-- ============================================
-- 订阅号关注追踪方案 - 数据库迁移脚本
-- 执行方式: 在 MySQL 中运行此脚本
-- ============================================

-- 1. 如果旧版 follow_records 存在且结构不同，先备份后重建
-- （旧版 follow_records 的字段和新版差异很大，直接用新版结构）

DROP TABLE IF EXISTS follow_records_old;
CREATE TABLE IF NOT EXISTS follow_records_old LIKE follow_records;
INSERT INTO follow_records_old SELECT * FROM follow_records;

DROP TABLE IF EXISTS follow_records;

-- 2. 创建新版 follow_records 表
CREATE TABLE follow_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL COMMENT '推广员工ID（= 员工工号）',
  promotion_code VARCHAR(50) NOT NULL COMMENT '推广码（= 员工工号）',
  wechat_openid VARCHAR(100) NOT NULL COMMENT '微信用户 OpenID',
  wechat_nickname VARCHAR(100) DEFAULT NULL COMMENT '微信昵称',
  subscribe_status ENUM('subscribed', 'unsubscribed') NOT NULL DEFAULT 'subscribed' COMMENT '关注状态',
  first_reply_at DATETIME NOT NULL COMMENT '首次回复推广码时间（=归因时间）',
  last_event_at DATETIME DEFAULT NULL COMMENT '最近一次事件时间（关注/取关）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  UNIQUE KEY uk_openid_code (wechat_openid, promotion_code),
  INDEX idx_employee_id (employee_id),
  INDEX idx_wechat_openid (wechat_openid),
  INDEX idx_subscribe_status (subscribe_status),
  INDEX idx_first_reply_at (first_reply_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注归因记录表（推广码模式）';

-- 3. 创建推广统计视图
CREATE OR REPLACE VIEW v_promotion_stats AS
SELECT
  e.employee_id,
  e.name AS employee_name,
  e.department,
  COUNT(DISTINCT fr.id) AS total_followers,
  COUNT(DISTINCT CASE WHEN fr.subscribe_status = 'subscribed' THEN fr.id END) AS subscribed_count,
  COUNT(DISTINCT CASE WHEN fr.subscribe_status = 'unsubscribed' THEN fr.id END) AS unsubscribed_count,
  MIN(fr.first_reply_at) AS first_follow_time,
  MAX(fr.first_reply_at) AS last_follow_time
FROM employees e
LEFT JOIN follow_records fr ON e.employee_id = fr.employee_id
WHERE e.status = 1
GROUP BY e.employee_id, e.name, e.department;

-- 4. 创建每日关注趋势视图
CREATE OR REPLACE VIEW v_daily_follow_trend AS
SELECT
  DATE(first_reply_at) AS follow_date,
  COUNT(DISTINCT fr.id) AS new_followers,
  COUNT(DISTINCT fr.employee_id) AS active_promoters
FROM follow_records fr
GROUP BY DATE(first_reply_at)
ORDER BY follow_date DESC;

-- 完成
SELECT '推广码关注追踪系统数据库迁移完成！' AS message;
