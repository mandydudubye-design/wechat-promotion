# 员工自助验证方案 - 实施指南

## 📋 方案概述

**适用场景**：员工数量 > 50人，希望自动化验证

**核心流程**：
```
员工关注公众号 → 点击菜单"员工验证" → 输入手机号 → 接收验证码 → 验证成功
```

**成本**：¥0.045/条短信（100人验证一次约¥4.5）

---

## 🚀 实施步骤（总计2-3小时）

### 步骤1：接入阿里云短信服务（1-2小时）

#### 1.1 注册阿里云账号

访问：https://www.aliyun.com

如果没有账号，先注册（需要企业认证）

#### 1.2 开通短信服务

1. 进入"短信服务"控制台
2. 点击"立即开通"
3. 选择"按量付费"（推荐）
4. 完成开通

#### 1.3 申请短信签名

1. 进入"国内消息" → "签名管理"
2. 点击"添加签名"
3. 填写信息：
   ```
   签名来源：企事业单位
   签名用途：已自用
   签名名称：你的公司名
   是否涉及第三方：否
   ```
4. 上传营业执照等证明材料
5. 提交审核（1-2小时）

#### 1.4 申请短信模板

1. 进入"模板管理"
2. 点击"添加模板"
3. 填写信息：
   ```
   模板类型：验证码
   模板名称：员工验证码
   模板内容：您的验证码是${code}，5分钟内有效。
   应用场景：员工身份验证
   ```
4. 提交审核（1-2小时）
5. 审核通过后，复制模板代码（如：SMS_123456789）

#### 1.5 获取AccessKey

1. 进入"AccessKey管理"
2. 创建AccessKey（建议使用RAM子账号）
3. 只授予"短信服务"权限
4. 复制AccessKey ID和Secret

#### 1.6 安装SDK

```bash
cd C:\公众号任务\backend
npm run install-sms
```

或手动安装：
```bash
npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client
```

#### 1.7 配置环境变量

编辑 `backend/.env` 文件：

```bash
# 阿里云短信配置
ALIYUN_ACCESS_KEY_ID=你的AccessKeyID
ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret
ALIYUN_SMS_SIGN_NAME=你的公司名
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

#### 1.8 测试短信发送

```bash
# 重启后端服务
cd C:\公众号任务\backend
npm run dev
```

使用Postman或curl测试：

```bash
curl -X POST http://localhost:3000/api/employee-binding/send-code \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800138000\"}"
```

预期返回：
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expired_in": 300
  }
}
```

---

### 步骤2：部署H5验证页面（30分钟）

#### 2.1 选择部署方式

**选项A：使用现有服务器（推荐）**

如果有Nginx服务器：

```bash
# 复制文件到Nginx目录
cp C:\公众号任务\employee-h5\verify.html /var/www/html/

# 配置Nginx（如果还没配置）
vim /etc/nginx/sites-available/default
```

添加配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/html;
        index verify.html;
    }
}
```

重启Nginx：
```bash
sudo nginx -s reload
```

**选项B：使用静态服务器**

```bash
# 安装http-server
npm install -g http-server

# 启动服务
cd C:\公众号任务\employee-h5
http-server -p 8080
```

访问：http://your-server-ip:8080/verify.html

#### 2.2 配置公众号菜单

**方式A：微信公众号后台配置**

1. 登录公众号后台：https://mp.weixin.qq.com
2. 进入"自定义菜单"
3. 添加菜单：
   ```
   菜单名称：员工服务
   子菜单：
     - 名称：员工验证
     - 类型：跳转URL
     - URL：https://your-domain.com/verify.html?openid={openid}
   ```
4. 保存并发布

**方式B：使用API创建菜单**

```bash
curl -X POST http://localhost:3000/api/wechat/create-menu
```

---

### 步骤3：运行数据库迁移（5分钟）

```bash
cd C:\公众号任务\backend
npm run migrate-employee-binding
```

检查表是否创建：

```bash
# 连接MySQL
mysql -u root -p123456 wechat_promotion

# 查看表
SHOW TABLES LIKE 'employee_bindings';
SHOW TABLES LIKE 'verification_codes';

# 退出
exit
```

---

### 步骤4：测试完整流程（15分钟）

#### 4.1 准备测试数据

确保员工表中有测试数据：

```sql
INSERT INTO employees (employee_id, name, phone, department, status) 
VALUES ('TEST001', '测试员工', '13800138000', '技术部', 1);
```

#### 4.2 模拟关注流程

1. 在公众号后台获取测试用户的openid
2. 模拟关注事件（或真实关注测试公众号）

#### 4.3 测试验证流程

1. 打开H5页面
   ```
   https://your-domain.com/verify.html?openid=test_openid
   ```

2. 输入手机号：13800138000

3. 点击"发送验证码"

4. 查看手机是否收到验证码

5. 输入验证码

6. 点击"验证"

7. 查看是否显示"测试员工，您已绑定员工身份"

#### 4.4 验证数据库

```sql
-- 查看绑定记录
SELECT * FROM employee_bindings WHERE openid = 'test_openid';

-- 查看关注记录
SELECT * FROM follow_records WHERE openid = 'test_openid';
```

应该看到：
- `employee_bindings` 表有记录
- `follow_records.is_employee = true`

---

## 📊 后续管理

### 查看验证统计

```bash
curl http://localhost:3000/api/stats/employee-verification
```

返回：
```json
{
  "code": 200,
  "data": {
    "total_employees": 100,
    "verified_employees": 85,
    "unverified_employees": 15,
    "verification_rate": 85
  }
}
```

### 查看验证列表

```bash
curl http://localhost:3000/api/employee-binding/list
```

### 批量提醒未验证员工

```bash
curl -X POST http://localhost:3000/api/employee-binding/remind-unverified
```

---

## 💰 费用说明

### 短信费用

- 单价：¥0.045/条
- 100人验证：¥4.5
- 月度费用（10人/月）：¥0.45

### 其他费用

- 服务器：已使用，¥0
- 域名：已拥有，¥0
- SDK：免费

### 总成本

- 初始成本：¥0（短信预充值100条起，¥4.5）
- 月度成本：< ¥1

---

## ⚠️ 注意事项

### 安全性

1. **不要将AccessKey提交到代码仓库**
   - `.env` 文件已加入 `.gitignore`
   - 只在服务器上配置

2. **使用RAM子账号**
   - 只授予短信服务权限
   - 定期轮换AccessKey

3. **验证码安全**
   - 5分钟过期
   - 60秒发送限制
   - 使用后立即失效

### 性能优化

1. **使用Redis缓存验证码**（可选）
   - 当前使用数据库存储
   - 生产环境建议用Redis

2. **短信发送限流**
   - 已实现60秒限制
   - 防止恶意发送

### 审核时效

- 短信签名审核：1-2小时
- 短信模板审核：1-2小时
- 建议提前申请，避免等待

---

## 🎯 完成检查清单

- [ ] 阿里云账号已注册
- [ ] 短信服务已开通
- [ ] 短信签名已申请（通过审核）
- [ ] 短信模板已申请（通过审核）
- [ ] AccessKey已获取
- [ ] SDK已安装
- [ ] 环境变量已配置
- [ ] 数据库已迁移
- [ ] H5页面已部署
- [ ] 公众号菜单已配置
- [ ] 测试验证成功
- [ ] 正式上线

---

## 🆘 常见问题

### Q1: 短信发送失败？

**A:** 检查以下几点：
1. AccessKey是否正确
2. 签名和模板是否通过审核
3. 账户余额是否充足
4. 手机号格式是否正确

### Q2: 收不到验证码？

**A:** 可能原因：
1. 短信被拦截（检查垃圾短信）
2. 手机号不在员工表中
3. 60秒内重复发送
4. 网络延迟

### Q3: 如何批量导入员工手机号？

**A:** 
```sql
LOAD DATA INFILE 'employees.csv'
INTO TABLE employees
FIELDS TERMINATED BY ','
(employee_id, name, phone, department, status);
```

### Q4: 如何切换到腾讯云短信？

**A:** 创建新的 `TencentSmsService`，接口与阿里云一致，替换即可。

---

## 📞 技术支持

- 阿里云短信文档：https://help.aliyun.com/document_detail/101414.html
- 阿里云工单：提交工单获取技术支持
- 本项目文档：`docs/EMPLOYEE_VERIFICATION.md`

---

## 🎉 完成！

当所有步骤完成后，你的员工自助验证系统就正式上线了！

**员工操作流程：**
1. 关注公众号
2. 点击菜单"员工验证"
3. 输入手机号
4. 接收验证码
5. 验证成功

**管理后台：**
- 查看验证统计
- 查看验证列表
- 批量提醒未验证员工

恭喜你完成了系统部署！🎊