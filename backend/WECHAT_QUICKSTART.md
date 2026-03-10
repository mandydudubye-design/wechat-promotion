# 微信测试号配置快速指南

## 🚀 5分钟快速配置

### 第一步：获取微信测试号（2分钟）

1. **打开微信测试号页面**
   👉 https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login

2. **使用微信扫码登录**
   - 打开微信，扫描页面上的二维码
   - 确认登录

3. **获取配置信息**
   登录后会显示以下信息：
   ```
   appID: wxXXXXXXXXXXXXXXXX
   appsecret: XXXXXXXXXXXXXXXXXXXXXXXX
   ```

### 第二步：更新环境变量（1分钟）

1. **打开 .env 文件**
   ```bash
   cd C:\公众号任务\backend
   notepad .env
   ```

2. **修改微信配置**
   ```env
   # 微信公众号配置
   WECHAT_APP_ID=wxXXXXXXXXXXXXXXXX      # 替换为你的appID
   WECHAT_APP_SECRET=XXXXXXXXXXXXXXXXXXXXX  # 替换为你的appsecret
   WECHAT_TOKEN=wechat_promotion_token
   WECHAT_ENCODING_AES_KEY=
   ```

3. **保存文件**

### 第三步：配置内网穿透（2分钟）

如果本地开发，需要内网穿透让微信能访问到你的服务器：

#### 使用 ngrok（推荐）

1. **下载 ngrok**
   👉 https://ngrok.com/download
   - Windows: 下载 Windows 版本
   - 解压到任意目录

2. **注册 ngrok 账号**
   👉 https://dashboard.ngrok.com/signup
   - 注册后会获得 authtoken

3. **配置 authtoken**
   ```bash
   ngrok config add-authtoken your_authtoken_here
   ```

4. **启动 ngrok**
   ```bash
   ngrok http 3000
   ```

5. **获取公网地址**
   启动后会显示：
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```
   记住这个地址：`https://abc123.ngrok.io`

#### 使用花生壳（备选）

1. **下载花生壳**
   👉 https://hsk.oray.com/download/

2. **安装并登录**

3. **添加内网映射**
   - 映射类型：HTTP
   - 内网主机：127.0.0.1
   - 内网端口：3000
   - 应用名称：微信测试

4. **获取外网访问地址**

### 第四步：配置微信服务器URL（1分钟）

1. **返回微信测试号页面**

2. **配置服务器信息**
   - **URL**: `https://abc123.ngrok.io/api/wechat/callback`
     （替换为你的ngrok地址）
   
   - **Token**: `wechat_promotion_token`
   
   - **EncodingAESKey**: 随机生成（点击旁边按钮）

3. **点击"提交"按钮**
   - 如果配置正确，会显示"配置成功"
   - 如果失败，检查：
     * URL是否正确
     * Token是否与.env一致
     * ngrok是否在运行

### 第五步：启动服务器并测试

1. **启动后端服务器**
   ```bash
   cd C:\公众号任务\backend
   npm run dev
   ```

2. **运行测试脚本**
   ```bash
   npm run test-wechat
   ```

3. **扫码关注测试号**
   - 在测试号页面有测试号二维码
   - 使用微信扫码关注
   - 关注后会显示在关注者列表中

---

## ✅ 验证配置成功

### 检查项

- [ ] 后端服务器正常运行（http://localhost:3000）
- [ ] ngrok正常运行，显示公网地址
- [ ] 微信服务器配置验证通过
- [ ] 已扫码关注测试号
- [ ] 测试脚本运行成功

### 测试命令

```bash
# 1. 测试服务器是否启动
curl http://localhost:3000/health

# 2. 测试微信配置
npm run test-wechat

# 3. 查看日志
tail -f logs/app-*.log
```

---

## 🐛 常见问题排查

### 问题1：ngrok启动失败

**原因**：端口3000被占用

**解决**：
```bash
# 查看占用端口的进程
netstat -ano | findstr :3000

# 结束进程（可选）
taskkill /PID 进程ID /F
```

### 问题2：微信服务器验证失败

**原因**：
1. Token不匹配
2. URL错误
3. ngrok未运行

**解决**：
1. 检查.env中的WECHAT_TOKEN
2. 确认URL格式正确
3. 确保ngrok在运行
4. 查看后端日志：`tail -f logs/app-*.log`

### 问题3：二维码生成失败

**原因**：AppID或AppSecret错误

**解决**：
1. 检查.env配置
2. 重新从测试号页面复制
3. 确保没有多余空格

### 问题4：关注后没有反应

**原因**：服务器URL未配置或配置错误

**解决**：
1. 确认服务器URL已配置
2. 查看后端日志是否有事件记录
3. 检查ngrok是否正常运行

---

## 📱 测试流程

### 1. 创建推广记录

```bash
# 登录获取token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

# 创建推广
curl -X POST http://localhost:3000/api/promotion/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"employee_id\":\"EMP001\",\"account_id\":1,\"description\":\"测试\"}"
```

### 2. 扫描二维码

返回的qr_image字段包含二维码图片URL，使用微信扫描

### 3. 查看关注记录

```bash
curl http://localhost:3000/api/follow/records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. 查看统计数据

```bash
curl http://localhost:3000/api/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔗 相关链接

- 微信测试号：https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
- ngrok下载：https://ngrok.com/download
- ngrok注册：https://dashboard.ngrok.com/signup
- 花生壳下载：https://hsk.oray.com/download/
- 微信API文档：https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html

---

## 💡 小技巧

1. **保持ngrok运行**：ngrok断开需要重启，保持终端开启
2. **固定域名**：付费ngrok可以固定域名，免费版每次重启会变
3. **日志调试**：遇到问题先查看后端日志
4. **Token配置**：Token可以自定义，但必须与微信配置一致
5. **多开测试**：可以使用多个微信号测试关注功能

---

**预计时间**：5-10分钟完成配置  
**难度级别**：⭐⭐☆☆☆（简单）  
**维护者**：后端开发团队

有问题随时问我！👍
