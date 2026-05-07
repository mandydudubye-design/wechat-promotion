# 微信H5授权获取OpenID完整指南

## 一、方案对比

### 方案A：H5网页授权（推荐）✅

**优点**：
- ✅ 用户无感知（使用snsapi_base静默授权）
- ✅ 官方标准方案，稳定可靠
- ✅ 适合员工绑定、推广追踪等场景
- ✅ 可以获取用户信息（使用snsapi_userinfo）

**缺点**：
- ⚠️ 必须在微信内打开
- ⚠️ 需要在公众号后台配置"网页授权域名"

**适用场景**：
- 服务号：完美适用
- 订阅号：**不支持**（仅服务号支持网页授权）

---

### 方案B：用户发送识别码（备选）

**优点**：
- ✅ 订阅号也可以使用
- ✅ 不需要配置网页授权域名

**缺点**：
- ❌ 用户需要主动发送识别码，体验差
- ❌ 容易被用户忘记或出错
- ❌ 数据不实时
- ❌ 推广追踪也需要用户主动发送

**适用场景**：
- 只能使用订阅号时的备选方案

---

## 二、H5网页授权完整流程

### 2.1 前置条件

**1. 微信公众号类型**：必须是**服务号**

**2. 配置网页授权域名**
- 登录微信公众平台
- 进入：开发 -> 接口权限 -> 网页授权 -> 修改
- 填写授权回调域名（不要带http://或https://）
- 例如：`your-domain.com`（不要写 `https://your-domain.com`）

**3. 域名要求**：
- 必须是备案的域名
- 必须是80端口或443端口（HTTPS）
- 不能是IP地址

---

### 2.2 技术实现

#### 步骤1：构造授权URL

```typescript
// 后端接口：/api/wechat-oauth/auth
const appId = process.env.WECHAT_APP_ID;
const redirectUri = encodeURIComponent('https://your-domain.com/callback');
const scope = 'snsapi_base'; // 静默授权
const state = Date.now().toString();

const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
```

#### 步骤2：用户跳转授权

```typescript
// 前端调用
const response = await fetch('/api/wechat-oauth/auth?redirect_uri=https://your-domain.com/callback');
const { auth_url } = await response.json();
window.location.href = auth_url;
```

#### 步骤3：微信回调，获取code

```
微信会自动跳转到：https://your-domain.com/callback?code=CODE&state=STATE
```

#### 步骤4：后端用code换取openid

```typescript
// 后端接口：/api/wechat-oauth/callback
const response = await fetch(
  `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
);

const data = await response.json();
// data = { access_token, expires_in, refresh_token, openid, scope }
```

---

### 2.3 代码示例

**完整代码已在以下文件中**：
- `backend/src/routes/wechat-oauth.ts` - 后端授权接口
- `employee-h5/src/components/WechatAuth.tsx` - 前端授权组件
- `employee-h5/src/pages/EmployeeBindPage.tsx` - 员工绑定页面

---

## 三、两种授权模式对比

### snsapi_base（静默授权）✅ 推荐

```
授权URL示例：
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=URI&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect
```

**特点**：
- ✅ 用户无感知，自动完成授权
- ✅ 只能获取OpenID
- ✅ 适合员工绑定、推广追踪等场景

**返回数据**：
```json
{
  "access_token": "ACCESS_TOKEN",
  "expires_in": 7200,
  "refresh_token": "REFRESH_TOKEN",
  "openid": "OPENID",
  "scope": "snsapi_base"
}
```

---

### snsapi_userinfo（弹窗授权）

```
授权URL示例：
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=URI&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
```

**特点**：
- ⚠️ 需要用户点击"同意"按钮
- ✅ 可以获取OpenID + 用户信息
- ❌ 体验较差，会打断用户流程

**返回数据**：
```json
{
  "openid": "OPENID",
  "nickname": "用户昵称",
  "sex": 1,
  "province": "广东",
  "city": "深圳",
  "country": "中国",
  "headimgurl": "https://thirdwx.qlogo.cn/...",
  "privilege": []
}
```

**适用场景**：
- 需要显示用户昵称、头像
- 需要用户明确授权的场景

---

## 四、订阅号方案（识别码）

如果只能使用订阅号，需要使用识别码方案：

### 4.1 识别码格式

**方案1：工号 + 手机号后4位**
```
格式：EMP0011234
说明：EMP001是工号，1234是手机号后4位
```

**方案2：工号 + 短信验证码**
```
格式：EMP001123456
说明：EMP001是工号，123456是6位验证码（系统发送短信）
```

### 4.2 实现流程

```
1. 员工在公众号对话框输入识别码
   ↓
2. 微信推送文本消息到后端
   ↓
3. 后端解析识别码，验证员工信息
   ↓
4. 验证成功，绑定OpenID
```

### 4.3 代码示例

```typescript
// 处理文本消息
async function handleTextMessage(openid: string, content: string) {
  // 识别码格式：工号+手机号后4位
  const match = content.match(/^(EMP\d+)(\d{4})$/);

  if (!match) {
    // 不是识别码，返回提示
    await sendCustomMessage(openid, 'text', {
      content: '识别码格式不正确，请输入：工号+手机号后4位\n例如：EMP0011234'
    });
    return;
  }

  const [_, employeeId, phoneSuffix] = match;

  // 验证员工信息
  const [employees] = await pool.query(
    'SELECT * FROM employees_unified WHERE employee_id = ? AND phone LIKE ?',
    [employeeId, `%${phoneSuffix}`]
  );

  if (employees.length === 0) {
    await sendCustomMessage(openid, 'text', {
      content: '工号或手机号后4位不正确，请检查后重试'
    });
    return;
  }

  // 绑定OpenID
  await pool.query(
    'UPDATE employees_unified SET openid = ?, bind_status = 1, bind_time = NOW() WHERE employee_id = ?',
    [openid, employeeId]
  );

  await sendCustomMessage(openid, 'text', {
    content: '绑定成功！您的专属推广二维码已生成'
  });
}
```

---

## 五、推荐方案总结

### 服务号（强烈推荐）✅

**使用H5网页授权（snsapi_base）**：
1. 员工在微信内打开H5页面
2. 系统自动获取OpenID（静默授权）
3. 员工输入工号+手机号后4位验证
4. 验证成功，完成绑定

**优点**：
- 全自动化
- 用户体验好
- 数据实时准确
- 官方标准方案

---

### 订阅号（不推荐）⚠️

**使用识别码方案**：
1. 员工在公众号对话框输入识别码
2. 系统验证并绑定

**缺点**：
- 用户体验差
- 容易出错
- 数据不实时

**建议**：如果可能，**升级为服务号**或使用企业微信。

---

## 六、注意事项

### 1. 网页授权域名配置

**常见错误**：
- ❌ 配置了 `https://your-domain.com`（错误）
- ✅ 正确配置：`your-domain.com`（不要带协议）

### 2. 测试环境

**测试号环境**：
- 使用微信公众平台的测试号
- 测试号支持网页授权
- 适合开发测试

### 3. 错误处理

**常见错误码**：
- `40029`：code无效
- `40163`：code已使用
- `42001`：access_token超时
- `40002`：grant_type参数错误

### 4. 安全性

**防止CSRF攻击**：
- 使用state参数进行验证
- 建议state使用随机字符串+时间戳

**OpenID保密**：
- OpenID相当于用户ID，需要保密
- 不要在前端暴露OpenID

---

## 七、快速开始

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install

# 员工H5
cd employee-h5
npm install
```

### 2. 配置环境变量

```bash
# backend/.env
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
WECHAT_TOKEN=your_token
```

### 3. 配置网页授权域名

- 登录微信公众平台
- 进入：开发 -> 接口权限 -> 网页授权 -> 修改
- 填写授权回调域名（不带http://或https://）

### 4. 启动服务

```bash
# 后端
cd backend
npm run dev

# 前端
cd frontend
npm run dev

# 员工H5
cd employee-h5
npm run dev
```

### 5. 测试

在微信内打开H5页面：
```
https://your-domain.com/bind
```

---

## 八、相关文件

- `backend/src/routes/wechat-oauth.ts` - 后端授权接口
- `employee-h5/src/components/WechatAuth.tsx` - 前端授权组件
- `employee-h5/src/pages/EmployeeBindPage.tsx` - 员工绑定页面
- `优化方案.md` - 整体优化方案
