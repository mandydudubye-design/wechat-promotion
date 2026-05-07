-- 更新公众号表，添加缺失的字段
ALTER TABLE wechat_accounts
ADD COLUMN wechat_id VARCHAR(100) COMMENT '微信号（gh_xxxxxxxx）' AFTER account_name,
ADD COLUMN account_type ENUM('subscription', 'service') DEFAULT 'service' COMMENT '公众号类型：订阅号/服务号' AFTER wechat_id,
ADD COLUMN verified BOOLEAN DEFAULT FALSE COMMENT '是否已认证' AFTER account_type,
ADD COLUMN qr_code_url VARCHAR(500) COMMENT '公众号二维码URL' AFTER verified,
ADD COLUMN total_followers INT DEFAULT 0 COMMENT '总关注数' AFTER qr_code_url,
ADD COLUMN employee_followers INT DEFAULT 0 COMMENT '员工关注数' AFTER total_followers,
ADD COLUMN today_new_follows INT DEFAULT 0 COMMENT '今日新增' AFTER employee_followers,
ADD COLUMN month_new_follows INT DEFAULT 0 COMMENT '本月新增' AFTER today_new_follows;

-- 创建海报模板表
CREATE TABLE IF NOT EXISTS poster_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '模板名称',
  account_id INT NOT NULL COMMENT '所属公众号ID',
  description TEXT COMMENT '描述',
  width INT DEFAULT 1080 COMMENT '海报宽度',
  height INT DEFAULT 1920 COMMENT '海报高度',
  qr_x INT DEFAULT 540 COMMENT '二维码X坐标',
  qr_y INT DEFAULT 1600 COMMENT '二维码Y坐标',
  qr_size INT DEFAULT 200 COMMENT '二维码尺寸',
  show_referral_code BOOLEAN DEFAULT TRUE COMMENT '是否显示推荐码',
  image_url VARCHAR(500) COMMENT '海报图片URL',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_account_id (account_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='海报模板表';

-- 创建朋友圈文案表
CREATE TABLE IF NOT EXISTS circle_texts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '文案名称',
  category ENUM('formal', 'casual', 'general', 'promotion') DEFAULT 'general' COMMENT '分类',
  content TEXT NOT NULL COMMENT '文案内容',
  variables JSON COMMENT '支持的变量列表',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='朋友圈文案表';

-- 创建推广套装表
CREATE TABLE IF NOT EXISTS promotion_kits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '套装名称',
  poster_template_id INT NOT NULL COMMENT '海报模板ID',
  text_template_id INT NOT NULL COMMENT '文案模板ID',
  account_id INT NOT NULL COMMENT '所属公众号ID',
  is_default BOOLEAN DEFAULT FALSE COMMENT '是否为默认套装',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_account_id (account_id),
  INDEX idx_poster_template (poster_template_id),
  INDEX idx_text_template (text_template_id),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推广套装表';
