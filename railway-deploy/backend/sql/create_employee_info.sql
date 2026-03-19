-- 员工信息表
CREATE TABLE IF NOT EXISTS employee_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信OpenID',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  employee_id VARCHAR(50) NOT NULL COMMENT '工号',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  department VARCHAR(100) COMMENT '部门',
  position VARCHAR(100) COMMENT '职位',
  is_followed TINYINT DEFAULT 0 COMMENT '是否关注公众号 0-未关注 1-已关注',
  follow_time DATETIME COMMENT '关注时间',
  register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登记时间',
  last_update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  
  INDEX idx_openid (openid),
  INDEX idx_employee_id (employee_id),
  INDEX idx_phone (phone),
  INDEX idx_is_followed (is_followed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工信息表';

-- 员工关注统计视图
CREATE OR REPLACE VIEW v_employee_follow_stats AS
SELECT 
  ei.employee_id,
  ei.name,
  ei.department,
  ei.position,
  ei.is_followed,
  ei.follow_time,
  fr.nickname as wechat_nickname,
  fr.subscribe_time
FROM employee_info ei
LEFT JOIN follow_records fr ON ei.openid = fr.openid;

-- 统计视图：员工关注情况
CREATE OR REPLACE VIEW v_employee_follow_summary AS
SELECT 
  COUNT(*) as total_employees,
  SUM(CASE WHEN is_followed = 1 THEN 1 ELSE 0 END) as followed_count,
  SUM(CASE WHEN is_followed = 0 THEN 1 ELSE 0 END) as not_followed_count,
  ROUND(SUM(CASE WHEN is_followed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as follow_rate
FROM employee_info;
