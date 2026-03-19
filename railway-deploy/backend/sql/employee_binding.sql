-- 员工身份绑定表
CREATE TABLE IF NOT EXISTS employee_bindings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
    openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信OpenID',
    unionid VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID（企业微信才有）',
    is_verified BOOLEAN DEFAULT FALSE COMMENT '是否已验证',
    verification_method VARCHAR(20) DEFAULT NULL COMMENT '验证方式：phone/card/manual',
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

-- 员工验证日志表
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
