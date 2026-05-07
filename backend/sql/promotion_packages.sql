-- 推广套装表
CREATE TABLE IF NOT EXISTS promotion_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '套装名称',
  description TEXT COMMENT '套装描述',
  poster_template_id INT COMMENT '海报模板ID（关联poster_templates表）',
  copywriting_id INT COMMENT '文案ID（关联copywriting表）',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用: 0-否, 1-是',
  priority INT DEFAULT 0 COMMENT '优先级（数字越大越靠前）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_active (is_active),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推广套装表';

-- 海报模板表
CREATE TABLE IF NOT EXISTS poster_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '模板名称',
  description TEXT COMMENT '模板描述',
  image_url VARCHAR(500) NOT NULL COMMENT '海报图片URL',
  thumbnail_url VARCHAR(500) COMMENT '缩略图URL',
  category VARCHAR(50) COMMENT '分类：促销/活动/品牌等',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category (category),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='海报模板表';

-- 朋友圈文案表
CREATE TABLE IF NOT EXISTS copywriting (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL COMMENT '文案标题',
  content TEXT NOT NULL COMMENT '文案内容',
  category VARCHAR(50) COMMENT '分类：促销/活动/品牌等',
  tags VARCHAR(200) COMMENT '标签（逗号分隔）',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category (category),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='朋友圈文案表';

-- 插入示例数据
INSERT INTO poster_templates (name, description, image_url, thumbnail_url, category, is_active) VALUES
('促销海报1', '双十一促销活动海报', 'https://via.placeholder.com/600x900/FF6B6B/ffffff?text=双十一+促销', 'https://via.placeholder.com/300x450/FF6B6B/ffffff?text=促销', '促销', 1),
('品牌海报1', '品牌形象宣传海报', 'https://via.placeholder.com/600x900/4ECDC4/ffffff?text=品牌+宣传', 'https://via.placeholder.com/300x450/4ECDC4/ffffff?text=品牌', '品牌', 1),
('活动海报1', '线下活动宣传海报', 'https://via.placeholder.com/600x900/FFE66D/333333?text=线下+活动', 'https://via.placeholder.com/300x450/FFE66D/333333?text=活动', '活动', 1);

INSERT INTO copywriting (title, content, category, tags, is_active) VALUES
('双十一促销文案', '🎉 双十一狂欢开始了！全场商品5折起，更有大额优惠券等你领取！扫码立即参与活动，错过再等一年！', '促销', '双十一,促销,优惠', 1),
('品牌介绍文案', '🌟 我们是专业的公众号推广平台，汇聚优质内容，连接你我他！关注我们，获取更多精彩内容！', '品牌', '品牌,介绍,关注', 1),
('活动邀请文案', '📢 诚邀您参加我们的线下活动，与行业大咖面对面交流，还有精美礼品等你来！扫码报名，名额有限！', '活动', '活动,邀请,线下', 1);

INSERT INTO promotion_packages (name, description, poster_template_id, copywriting_id, is_active, priority) VALUES
('双十一促销套装', '双十一促销活动套装，包含促销海报和推广文案', 1, 1, 1, 100),
('品牌宣传套装', '品牌形象宣传套装，适合日常推广', 2, 2, 1, 90),
('线下活动套装', '线下活动推广套装，适合活动宣传', 3, 3, 1, 80);
