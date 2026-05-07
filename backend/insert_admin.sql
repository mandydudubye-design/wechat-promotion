USE wechat_promotion;

INSERT INTO admins (username, password, name, role)
VALUES ('admin', '$2a$10$3VmXe6OKYNcPaD675vHsMudgdy72Xaghj0wJzHGC9GmtYMgQ1D5KW', '系统管理员', 'admin')
ON DUPLICATE KEY UPDATE name=name;

SELECT * FROM admins;
