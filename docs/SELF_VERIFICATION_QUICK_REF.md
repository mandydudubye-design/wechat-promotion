# 员工自助验证方案 - 快速参考

## ⚡ 5分钟快速检查清单

### 前置条件
- [ ] 阿里云账号已注册
- [ ] 短信服务已开通
- [ ] 后端服务正在运行
- [ ] 数据库已配置

### 配置检查
- [ ] 短信签名已申请（通过审核）
- [ ] 短信模板已申请（通过审核）
- [ ] AccessKey已获取
- [ ] SDK已安装
- [ ] 环境变量已配置

### 部署检查
- [ ] 数据库已迁移
- [ ] H5页面已部署
- [ ] 公众号菜单已配置
- [ ] 测试验证成功

---

## 🔧 常用命令

### 安装依赖
```bash
cd C:\公众号任务\backend
npm run install-sms
```

### 数据库迁移
```bash
npm run migrate-employee-binding
```

### 重启后端
```bash
npm run dev
```

### 测试API
```bash
# 发送验证码
curl -X POST http://localhost:3000/api/employee-binding/send-code \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800138000\"}"

# 查询绑定状态
curl http://localhost:3000/api/employee-binding/status/test_openid
```

---

## 📋 配置模板

### backend/.env
```bash
# 阿里云短信配置
ALIYUN_ACCESS_KEY_ID=LTAI5tXXXXXXXXXXXXX
ALIYUN_ACCESS_KEY_SECRET=3XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ALIYUN_SMS_SIGN_NAME=你的公司名
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789

# H5页面URL
H5_URL=https://your-domain.com
```

---

## 🎯 关键URL

### 阿里云控制台
- 短信服务：https://dysms.console.aliyun.com
- AccessKey管理：https://ram.console.aliyun.com/manage/ak
- 签名管理：https://dysms.console.aliyun.com/domestic/text/sign
- 模板管理：https://dysms.console.aliyun.com/domestic/text/template

### 本地服务
- 后端API：http://localhost:3000
- 管理后台：http://localhost:5175
- H5页面：http://localhost:8080/verify.html

---

## 📊 数据库查询

### 查看绑定记录
```sql
SELECT 
  eb.*,
  e.name,
  e.department
FROM employee_bindings eb
LEFT JOIN employees e ON eb.employee_id = e.employee_id
ORDER BY eb.verified_at DESC;
```

### 查看验证统计
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
  SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END) as unverified
FROM employee_bindings;
```

### 查看员工vs客户关注
```sql
SELECT 
  employee_id,
  COUNT(*) as total,
  SUM(CASE WHEN is_employee = 1 THEN 1 ELSE 0 END) as employees,
  SUM(CASE WHEN is_employee = 0 THEN 1 ELSE 0 END) as customers
FROM follow_records
GROUP BY employee_id;
```

---

## 🆘 快速故障排除

### 问题1：短信发送失败
**检查：**
1. AccessKey是否正确
2. 签名和模板是否通过审核
3. 账户余额是否充足
4. 手机号格式是否正确（11位，1开头）

**解决：**
- 重新检查环境变量
- 查看后端日志：`backend/logs/`
- 阿里云控制台查看发送记录

### 问题2：验证码过期
**原因：** 验证码5分钟有效

**解决：** 重新获取验证码

### 问题3：手机号未注册
**原因：** 手机号不在员工表中

**解决：**
```sql
-- 添加员工手机号
UPDATE employees 
SET phone = '13800138000' 
WHERE employee_id = 'EMP001';
```

### 问题4：H5页面无法访问
**检查：**
1. 页面是否正确部署
2. Nginx/http-server是否运行
3. 防火墙是否开放端口

**解决：**
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 重启Nginx
sudo nginx -s reload

# 检查端口
netstat -tuln | grep 80
```

---

## 📱 公众号菜单配置

### 菜单结构
```
员工服务
  ├── 员工验证
  │   └── 类型：跳转URL
  │   └── URL：https://your-domain.com/verify.html?openid={openid}
  └── 我的推广
      └── 类型：跳转URL
      └── URL：https://your-domain.com/my-promotion.html?openid={openid}
```

### 通过API创建菜单
```bash
curl -X POST http://localhost:3000/api/wechat/create-menu
```

---

## 💰 费用计算

### 短信费用
- 单价：¥0.045/条
- 验证一次：1条短信
- 100人验证：¥4.5
- 月度费用（10人/月）：¥0.45

### 年度费用估算
- 100人公司，每月10人新验证
- 12月 × 10人 × ¥0.045 = ¥5.4/年

---

## 📞 支持资源

### 官方文档
- 阿里云短信：https://help.aliyun.com/document_detail/101414.html
- 微信公众号：https://developers.weixin.qq.com/doc/offiaccount/

### 项目文档
- 实施指南：`docs/SELF_VERIFICATION_GUIDE.md`
- API文档：`docs/EMPLOYEE_VERIFICATION.md`
- 原理说明：`docs/EMPLOYEE_IDENTIFICATION_GUIDE.md`

### 本地文档
- 快速开始：`QUICK_START_EMPLOYEE_BINDING.md`
- 项目总览：`README.md`

---

## ✅ 上线前检查

### 安全检查
- [ ] AccessKey不要提交到代码仓库
- [ ] 使用RAM子账号，只授予短信权限
- [ ] 验证码有效期设置合理（5分钟）
- [ ] 发送频率限制（60秒）

### 功能检查
- [ ] 发送验证码成功
- [ ] 验证码验证成功
- [ ] 员工身份绑定成功
- [ ] 关注记录更新成功
- [ ] 统计数据正确

### 用户体验检查
- [ ] H5页面美观
- [ ] 操作流程简单
- [ ] 错误提示清晰
- [ ] 移动端适配

---

## 🎉 恭喜！

当你完成所有检查项后，系统就可以正式上线了！

**员工只需3步即可完成验证：**
1. 输入手机号
2. 输入验证码
3. 验证成功

**系统将自动：**
- 绑定员工身份
- 更新关注记录
- 统计数据

---

**如有问题，请查看详细文档或联系技术支持。** 📚
