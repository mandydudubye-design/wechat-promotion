-- 插入管理员账号
USE wechat_promotion;

-- 删除可能存在的测试管理员
DELETE FROM admins WHERE username IN ('admin', 'test');

-- 插入管理员账号（密码: admin123）
INSERT INTO admins (username, password, name, role) VALUES 
('admin', '$2b$10$TF2bWZc.VbHueSSVWhzkpu7zwtsEBQ2yvq0Hjn9NBs9wXmJKIrc/m', '系统管理员', 'admin');

SELECT '✅ 管理员账号创建成功' as result;
SELECT * FROM admins;
