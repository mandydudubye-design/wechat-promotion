# 微信公众号 API 对接配置指南

## 一、准备工作

### 1. 获取微信公众号信息

登录 [微信公众平台](https://mp.weixin.qq.com/)，进入：

**开发 -> 基本配置**

获取以下信息：
- **AppID**：应用唯一标识
- **AppSecret**：应用密钥
- **IP白名单**：将你的服务器 IP 添加到白名单

### 2. 配置服务器 URL

在"基本配置"页面，点击"修改配置"，填写：

- **URL**：`http://your-domain.com/api/wechat/webhook`
  - 本地开发可以使用内网穿透工具（如 ngrok、frp）
  - 或使用内网 IP：`http://192.168.100.200:3000/api/wechat/webhook`
- **Token**：自定义字符串（如：`your_custom_token_here`）
- **EncodingAESKey**：随机生成或手动输入

**重要**：URL 必须是公网可访问的地址，且支持 HTTPS（推荐）

---

## 二、配置后端

### 1. 编辑环境变量文件

编辑 `backend/.env` 文件，填写微信公众号配置：

```env
# 微信公众号配置
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=abcdef1234567890abcdef1234567890
WECHAT_TOKEN=your_custom_token_here
WECHAT_ENCODING_AES_KEY=

# 服务器配置
SERVER_URL=http://your-domain.com
WEBHOOK_PATH=/api/wechat/webhook
```

### 2. 创建数据库表

执行以下 SQL 创建微信相关表：

```bash
cd backend
mysql -h127.0.0.1 -uroot -proot123456 wechat_promotion < sql/wechat_tables.sql
```

或者手动执行 `sql/wechat_tables.sql` 文件中的 SQL 语句。

### 3. 测试微信 API 连接

运行测试脚本：

```bash
cd backend
npm run test-wechat-api
```

如果配置正确，会看到：

```
=== 微信 API 对接测试 ===

1. 检查环境变量配置...
✅ AppID: wx1234567890abcdef
✅ AppSecret: abcdef1234567890... (已隐藏)

2. 测试获取 access_token...
✅ access_token: 71_xxxxxxxxxxxxx... (已隐藏)

3. 测试生成带参数二维码...
✅ 场景值: test_1777521234567
✅ 二维码 URL: https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=...

4. 测试二维码图片是否可访问...
✅ 二维码图片可访问
✅ 图片大小: 1234 bytes

=== 所有测试通过！微信 API 对接成功 ===
```

### 4. 启动后端服务

```bash
npm run dev
```

---

## 三、配置微信服务器

### 1. 提交服务器配置

在微信公众平台"基本配置"页面，点击"提交"按钮。

微信会发送 GET 请求到你的服务器 URL 进行验证：

```
GET /api/wechat/webhook?signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx
```

如果验证成功，会显示"服务器配置成功"。

### 2. 测试事件推送

在微信公众平台"接口权限" -> "接口测试号"中：

1. 使用微信扫描测试号二维码
2. 关注后，微信会推送事件到你的服务器
3. 查看后端日志，确认收到事件推送

---

## 四、使用微信推广二维码

### 1. 生成推广二维码

调用接口生成微信推广二维码：

```bash
curl -X POST http://localhost:3000/api/employee-binding/qrcode/wechat \
  -H "Content-Type: application/json" \
  -d '{
    "type": "personal",
    "employeeId": "EMP001",
    "employeeName": "张三",
    "accountId": 1
  }'
```

响应：

```json
{
  "code": 200,
  "message": "生成成功",
  "data": {
    "sceneStr": "qrscene_EMP001_1777521234567",
    "qrCodeUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQH47joAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyZy1MWm...",
    "expireSeconds": 2592000,
    "expiresAt": 1777530000000,
    "employee": {
      "employeeId": "EMP001",
      "name": "张三"
    }
  }
}
```

### 2. 用户扫码关注

用户扫描二维码并关注公众号后：

1. 微信推送关注事件到你的服务器
2. 后端解析 `scene` 参数，提取推广人工号（`EMP001`）
3. 创建推广记录到 `promotion_records` 表
4. 更新推广人的推广数量

### 3. 查看推广数据

查询推广记录：

```sql
SELECT
  p.id,
  p.promoter_id,
  p.follower_openid,
  p.follow_time,
  p.source,
  e.name as promoter_name
FROM promotion_records p
LEFT JOIN employees e ON p.promoter_id = e.employee_id
ORDER BY p.follow_time DESC;
```

---

## 五、常见问题

### 1. 获取 access_token 失败

**错误信息**：`获取 access_token 失败: 40163 - code been used`

**原因**：AppID 或 AppSecret 错误

**解决**：检查 `.env` 文件中的配置是否正确

### 2. 生成二维码失败

**错误信息**：`生成二维码失败: 40001 - invalid credential`

**原因**：access_token 过期或无效

**解决**：等待 access_token 自动刷新，或重启后端服务

### 3. 服务器配置验证失败

**错误信息**：签名验证失败

**原因**：Token 配置不一致

**解决**：确保 `.env` 文件中的 `WECHAT_TOKEN` 与微信公众平台配置的 Token 完全一致

### 4. 收不到微信推送事件

**原因**：
- URL 配置错误
- 服务器未启动
- 防火墙阻止

**解决**：
1. 检查 URL 是否可访问
2. 确认后端服务是否运行
3. 查看服务器日志

### 5. 网络问题

**原因**：微信 API 服务器在某些地区可能被墙

**解决**：
- 使用代理
- 使用 VPN
- 或部署到香港/海外服务器

---

## 六、生产环境注意事项

### 1. 使用 HTTPS

微信要求生产环境必须使用 HTTPS。

推荐使用：
- Let's Encrypt（免费）
- 阿里云 SSL 证书
- 腾讯云 SSL 证书

### 2. 配置 IP 白名单

在微信公众平台"基本配置"中，将服务器 IP 添加到白名单。

### 3. 使用 Redis 缓存 access_token

当前使用内存缓存 access_token，生产环境建议使用 Redis。

### 4. 日志监控

配置日志监控，及时发现异常：
- access_token 获取失败
- 二维码生成失败
- 事件推送处理失败

### 5. 数据备份

定期备份数据库，特别是：
- `wechat_users` 表
- `promotion_records` 表
- `employees` 表

---

## 七、接口文档

### 生成微信推广二维码

**接口**：`POST /api/employee-binding/qrcode/wechat`

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型：universal（通用）或 personal（专属） |
| employeeId | string | 否 | 员工工号（type=personal 时必填） |
| employeeName | string | 否 | 员工姓名（type=personal 时必填） |
| accountId | number | 否 | 公众号 ID，默认 1 |

**响应数据**：

| 字段 | 类型 | 说明 |
|------|------|------|
| sceneStr | string | 场景值 |
| qrCodeUrl | string | 二维码图片 URL |
| expireSeconds | number | 有效期（秒） |
| expiresAt | number | 过期时间戳 |
| employee | object | 员工信息（type=personal 时返回） |

---

## 八、技术支持

如有问题，请查看：
- 后端日志：`backend/logs/`
- 微信公众平台文档：https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html
