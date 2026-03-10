-- ============================================
-- 员工身份识别系统 - 数据库迁移脚本
-- ============================================

-- 1. 为关注记录表添加员工标识字段
ALTER TABLE follow_records 
ADD COLUMN IF NOT EXISTS is_employee BOOLEAN DEFAULT FALSE COMMENT '是否是员工' AFTER status,
ADD INDEX IF NOT EXISTS idx_is_employee (is_employee);

-- 2. 创建员工身份绑定表
CREATE TABLE IF NOT EXISTS employee_bindings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
    openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信OpenID',
    unionid VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID（企业微信才有）',
    is_verified BOOLEAN DEFAULT FALSE COMMENT '是否已验证',
    verification_method VARCHAR(20) DEFAULT NULL COMMENT '验证方式：phone/sms/card/manual',
    verification_code VARCHAR(20) DEFAULT NULL COMMENT '验证码',
    verified_at TIMESTAMP NULL DEFAULT NULL COMMENT '验证时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_id (employee_id),
    INDEX idx_openid (openid),
    INDEX idx_unionid (unionid),
    INDEX idx_is_verified (is_verified),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工微信身份绑定表';

-- 3. 创建员工验证日志表
CREATE TABLE IF NOT EXISTS employee_verification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
    openid VARCHAR(100) NOT NULL COMMENT '微信OpenID',
    verification_method VARCHAR(20) NOT NULL COMMENT '验证方式',
    verification_data VARCHAR(255) DEFAULT NULL COMMENT '验证数据（脱敏）',
    is_success BOOLEAN DEFAULT FALSE COMMENT '是否成功',
    failure_reason VARCHAR(255) DEFAULT NULL COMMENT '失败原因',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_employee_id (employee_id),
    INDEX idx_openid (openid),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工身份验证日志';

-- 4. 创建验证码表（如果还没有的话）
CREATE TABLE IF NOT EXISTS verification_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    code VARCHAR(10) NOT NULL COMMENT '验证码',
    is_used BOOLEAN DEFAULT FALSE COMMENT '是否已使用',
    used_at TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
    expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone_code (phone, code),
    INDEX idx_expired_at (expired_at),
    INDEX idx_is_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码表';

-- 5. 创建视图：员工关注统计
CREATE OR REPLACE VIEW v_employee_follow_stats AS
SELECT 
    e.employee_id,
    e.name AS employee_name,
    e.department,
    COUNT(DISTINCT fr.id) AS total_follows,
    COUNT(DISTINCT CASE WHEN fr.is_employee = TRUE THEN fr.id END) AS employee_follows,
    COUNT(DISTINCT CASE WHEN fr.is_employee = FALSE THEN fr.id END) AS customer_follows,
    MIN(fr.subscribe_time) AS first_follow_time,
    MAX(fr.subscribe_time) AS last_follow_time
FROM employees e
LEFT JOIN promotion_records pr ON e.employee_id = pr.employee_id
LEFT JOIN follow_records fr ON pr.id = fr.promotion_record_id
WHERE e.status = 1
GROUP BY e.employee_id, e.name, e.department;

-- 6. 创建视图：推广效果对比（员工vs客户）
CREATE OR REPLACE VIEW v_promotion_comparison AS
SELECT 
    pr.employee_id,
    e.name AS employee_name,
    COUNT(DISTINCT fr.id) AS total_followers,
    COUNT(DISTINCT CASE WHEN fr.is_employee = TRUE THEN fr.id END) AS employee_followers,
    COUNT(DISTINCT CASE WHEN fr.is_employee = FALSE THEN fr.id END) AS customer_followers,
    ROUND(
        COUNT(DISTINCT CASE WHEN fr.is_employee = FALSE THEN fr.id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT fr.id), 0), 
        2
    ) AS customer_percentage
FROM promotion_records pr
JOIN employees e ON pr.employee_id = e.employee_id
LEFT JOIN follow_records fr ON pr.id = fr.promotion_record_id
WHERE pr.employee_id IS NOT NULL
GROUP BY pr.employee_id, e.name;

-- 完成
SELECT '✅ 员工身份识别系统数据库迁移完成！' AS message;
