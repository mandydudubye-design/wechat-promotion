-- 为follow_records表添加员工信息字段
-- 用于存储员工基本信息，方便查询和统计

ALTER TABLE follow_records 
ADD COLUMN employee_name VARCHAR(50) COMMENT '员工姓名' AFTER employee_id,
ADD INDEX idx_employee_name (employee_name);
