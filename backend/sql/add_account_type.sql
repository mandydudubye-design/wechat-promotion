-- ============================================
-- 添加公众号类型字段（支持订阅号/服务号）
-- ============================================

USE wechat_promotion;

-- 1. 添加公众号类型字段
ALTER TABLE wechat_accounts
ADD COLUMN IF NOT EXISTS account_type ENUM('subscription', 'service') NOT NULL DEFAULT 'subscription'
COMMENT '公众号类型: subscription-订阅号, service-服务号'
AFTER account_id;

-- 2. 添加索引
ALTER TABLE wechat_accounts
ADD INDEX IF NOT EXISTS idx_account_type (account_type);

-- 3. 更新现有数据（默认设为订阅号）
UPDATE wechat_accounts
SET account_type = 'subscription'
WHERE account_type IS NULL OR account_type = '';

-- 4. 查看表结构
DESCRIBE wechat_accounts;

-- 5. 查看当前数据
SELECT
  id,
  account_name,
  account_id,
  account_type,
  status
FROM wechat_accounts;

-- 完成
SELECT '✅ 公众号类型字段添加成功！' AS message;
