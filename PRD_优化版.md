# 公众号推广追踪系统 PRD（优化版）

## 版本信息
- **版本**：v2.0（优化版）
- **更新日期**：2026-04-28
- **优化目标**：简化流程、提升体验、降低成本

---

## 一、系统概述

### 1.1 系统定位
公众号推广追踪系统，用于追踪员工推广公众号的效果（扫码、关注、转化）。

### 1.2 系统架构
```
管理后台（admin-frontend）：PC端，管理员使用
  └── 端口：5175

H5员工端（employee-h5）：移动端，员工使用
  └── 端口：5174

后端API（backend）：Node.js + MySQL
  └── 端口：3000
```

### 1.3 核心优化点
1. ✅ 页面合并，减少跳转（管理后台 7→5 页，H5 8→5 页）
2. ✅ 推广流程简化（6 步→3 步）
3. ✅ 统一公众号识别方案（二维码 + 验证码）
4. ✅ 引入推广套装概念

---

## 二、管理后台页面（PC端）- 优化后 5 个页面

### 2.1 概览页（Dashboard）
**路径**：`/`

**功能**：
- 核心指标卡片（4 个）：
  - 今日新增关注
  - 本周转化率
  - 未关注员工数
  - 异常告警数

- 公众号详情表格
  - 名称、微信号、状态
  - 快速操作（启用/停用）

- 推广排行榜 TOP 5
  - 按本周净增关注排名

- 员工绑定状态分布
  - 已绑定 / 未绑定
  - 环形图展示

**数据源**：
- `getOverviewStats`
- `getEmployees`
- `getAccounts`
- `getEmployeeRanking`

---

### 2.2 公众号管理页（AccountsPage）
**路径**：`/accounts`

**功能**：
- 公众号列表（CRUD）
  - 添加/编辑/删除公众号
  - 启用/停用状态

- 公众号类型标识
  - 服务号（图标标识）
  - 已认证订阅号（图标标识）
  - 未认证订阅号（图标标识）

**特殊说明**：
- 服务号：支持带参数二维码推广，扫码即记录
- 已认证订阅号：支持带参数二维码推广，扫码即记录
- 未认证订阅号：使用验证码模式，用户关注后发送验证码

---

### 2.3 推广素材管理页（PromotionMaterialsPage）
**路径**：`/materials`

**功能**：
**Tab 1：海报模板管理**
- 海报列表
  - 所属公众号
  - 模板名称、描述
  - 海报预览
  - 配置项：
    - 海报尺寸（宽×高）
    - 二维码位置（X坐标、Y坐标、尺寸）
    - 是否显示推荐码
- 操作：添加/编辑/删除/复制

**Tab 2：朋友圈文案管理**
- 文案分类标签
  - 正式风格
  - 轻松风格
  - 通用风格
  - 促销风格

- 文案列表
  - 所属分类
  - 文案内容
  - 支持的变量：
    - `{员工姓名}` - 自动替换
    - `{公众号名称}` - 自动替换
    - `{推荐码}` - 自动替换
  - 操作：添加/编辑/删除

**Tab 3：推广套装管理**（新增）
- 推广套装列表
  - 套装名称
  - 使用的海报模板
  - 使用的文案模板
  - 使用次数统计
- 操作：创建/编辑/删除/设为默认

**优势**：
- 统一的素材管理入口
- 员工推广时直接选择套装，更便捷

---

### 2.4 推广数据页（PromotionDataPage）
**路径**：`/promotion-data`

**功能**：
**Tab 1：实时统计**
- 视图切换：按员工 / 按部门 / 按公众号

- 筛选条件
  - 搜索框（员工/部门/公众号名称）
  - 部门筛选
  - 公众号筛选
  - 时间范围（今日 / 近7天 / 近30天 / 近90天）

- 汇总卡片（5 个）
  - 总扫描次数
  - 新增关注
  - 取消关注
  - 净增关注
  - 平均转化率

- 数据表格
  - 根据视图显示不同列
  - 支持排序

- 导出报表按钮

**Tab 2：数据分析**
- 同比环比分析
  - 日环比、周环比、月环比、年同比

- 关注趋势图
  - 折线图：新增关注、取消关注、净增长

- 转化漏斗
  - 扫描二维码 → 关注公众号 → 完成绑定 → 持续活跃

- 多维度交叉分析
  - 部门 × 公众号
  - 热力图展示

- 智能洞察
  - 表现最佳部门
  - 流失率预警
  - 最佳推广时间
  - 潜力员工推荐

- 自定义报表生成器
  - 时间范围选择
  - 分析维度选择
  - 筛选条件设置
  - 生成报表
  - 导出 CSV

**优势**：
- 功能集中，避免用户在两个页面跳转
- 统一的数据维度和筛选条件
- 减少代码重复

---

### 2.5 系统设置页（SettingsPage）
**路径**：`/settings`

**功能**：
**基础配置**
- 系统名称
- Logo 上传
- 联系方式

**告警设置**
- 关注率低于阈值告警
- 长期未推广员工告警
- 转化率异常告警
- 告警通知方式（邮件/短信）

**数据清理规则**
- 推广记录保留时长
- 日志保留时长
- 自动清理开关

---

## 三、H5员工端页面（移动端）- 优化后 5 个页面

### 3.1 首页（HomePage）- 推广中心
**路径**：`/h5/`

**功能**：
**首次进入流程**（新用户）：
1. 绑定流程（首次进入）
   - 填写工号、姓名、手机号
   - 验证码验证（服务号：OAuth；订阅号：短信）
   - 绑定成功

2. 关注任务引导
   - 顶部显示"关注公众号"卡片
   - 点击跳转到关注教程
   - 扫码关注后确认

**常规首页**（已绑定用户）：
**顶部：我的数据**
- 今日扫码数
- 今日关注数
- 本周排名

**中部：一键推广**
- 大按钮："开始推广"
- 选择推广套装（默认选中推荐套装）
- 自动生成带二维码海报
- 选择文案（套装中的默认文案）
- 一键分享

**底部：我的数据**
- 推广记录
- 排行榜

**顶部右侧：帮助**
- 点击打开帮助弹窗
- 使用说明
- 常见问题

---

### 3.2 数据页（MyDataPage）
**路径**：`/h5/data`

**功能**：
**Tab 1：推广记录**
- 记录列表
  - 日期
  - 推广的公众号
  - 使用的套装
  - 扫码数、关注数、转化率

- 筛选
  - 时间范围
  - 公众号筛选

**Tab 2：排行榜**
- 本周排行榜（TOP 20）
- 本月排行榜（TOP 20）
- 我的排名
- 排名趋势

---

### 3.3 我的页（ProfilePage）
**路径**：`/h5/profile`

**功能**：
- 员工信息展示
  - 姓名、工号、部门
  - 绑定状态
  - 关注的公众号列表

- 我的推广统计
  - 累计推广数据
  - 历史趋势

- 绑定状态管理
  - 重新绑定
  - 解绑

- 退出登录

---

### 3.4 推广落地页（PromotionLandingPage）
**路径**：`/h5/landing`

**功能**：
- 外部用户扫码后的落地页
- 显示公众号信息
  - 公众号头像、名称、简介
- 引导关注按钮
  - 点击跳转到关注页面
- 显示推荐人信息（可选）

---

### 3.5 授权回调页（OAuthCallbackPage）
**路径**：`/h5/oauth/callback`

**功能**：
- 微信 OAuth 授权回调处理
- 获取用户 OpenID
- 自动绑定员工账号
- 跳转回首页

---

## 四、核心业务流程优化

### 4.1 员工推广流程（优化后）

**流程步骤**（3 步）：
```
1. 选择推广套装
   - 显示推荐套装（高亮）
   - 显示其他可选套装
   - 支持预览套装效果

2. 自动生成
   - 根据套装的海报模板和二维码生成海报
   - 套装的文案自动填充

3. 一键分享
   - 保存到相册
   - 分享到朋友圈
   - 复制文案
```

**技术实现**：
```javascript
// 推广套装数据结构
{
  id: "kit_001",
  name: "新品推广套装",
  posterTemplateId: "poster_001",
  textTemplateId: "text_001",
  isDefault: true,
  usageCount: 156
}

// 生成推广内容
generatePromotionContent(kitId, employeeId, accountId) {
  const kit = getPromotionKit(kitId)
  const poster = generatePoster(kit.posterTemplateId, employeeId, accountId)
  const text = replaceVariables(kit.textTemplate, {
    employeeName: getEmployeeName(employeeId),
    accountName: getAccountName(accountId),
    referralCode: getReferralCode(employeeId)
  })
  return { poster, text }
}
```

---

### 4.2 绑定流程优化

**服务号绑定**（无感知）：
```
1. 用户点击"开始推广"
2. 跳转微信 OAuth 授权
3. 获取 OpenID
4. 后端自动绑定员工账号
5. 返回首页，显示推广功能
```

**订阅号绑定**（验证码模式）：
```
1. 首次进入首页
2. 显示绑定表单（工号、姓名、手机号）
3. 发送短信验证码
4. 验证码验证
5. 绑定成功
6. 引导关注公众号
7. 扫码关注后确认
8. 完成绑定，显示推广功能
```

---

### 4.3 公众号类型识别方案（统一）

```javascript
// 公众号类型识别
function getAccountType(account) {
  if (account.type === 'service') {
    return 'SERVICE' // 服务号：支持 OAuth
  } else if (account.verified === true) {
    return 'VERIFIED_SUBSCRIPTION' // 已认证订阅号：支持二维码
  } else {
    return 'UNVERIFIED_SUBSCRIPTION' // 未认证订阅号：验证码模式
  }
}

// 推广方案选择
function getPromotionMethod(account) {
  const type = getAccountType(account)
  switch (type) {
    case 'SERVICE':
      return 'OAUTH_QRCODE' // OAuth + 二维码
    case 'VERIFIED_SUBSCRIPTION':
      return 'QRCODE' // 纯二维码
    case 'UNVERIFIED_SUBSCRIPTION':
      return 'VERIFICATION_CODE' // 验证码
  }
}
```

---

## 五、数据模型优化

### 5.1 新增表：推广套装（promotion_kits）

```sql
CREATE TABLE promotion_kits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kit_name VARCHAR(100) NOT NULL COMMENT '套装名称',
  poster_template_id INT NOT NULL COMMENT '海报模板ID',
  text_template_id INT NOT NULL COMMENT '文案模板ID',
  account_id INT NOT NULL COMMENT '所属公众号',
  is_default TINYINT DEFAULT 0 COMMENT '是否为默认套装',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  created_by INT COMMENT '创建人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (poster_template_id) REFERENCES poster_templates(id),
  FOREIGN KEY (text_template_id) REFERENCES circle_texts(id),
  FOREIGN KEY (account_id) REFERENCES wechat_account_configs(id)
);
```

---

### 5.2 新增表：推广活动（promotion_campaigns）

```sql
CREATE TABLE promotion_campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_name VARCHAR(100) NOT NULL COMMENT '活动名称',
  description TEXT COMMENT '活动描述',
  start_date DATE NOT NULL COMMENT '开始日期',
  end_date DATE NOT NULL COMMENT '结束日期',
  target_follows INT COMMENT '目标关注数',
  status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
  created_by INT COMMENT '创建人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 六、技术实现要点

### 6.1 前端技术栈
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.18
- React Router 7.13.1
- Recharts 3.8.0（图表）
- Lucide React 0.577.0（图标）

### 6.2 后端技术栈
- Node.js
- Express
- MySQL
- JWT 认证

### 6.3 关键功能实现
1. **推广套装生成**：前端实时合成海报
2. **变量替换**：正则表达式匹配替换
3. **数据导出**：CSV 格式，支持中文
4. **实时统计**：WebSocket 推送（可选）

---

## 七、访问地址

### 开发环境
- 管理后台：http://localhost:5175
- H5 员工端：http://localhost:5174/h5/
- 后端 API：http://localhost:3000

### 生产环境
- 管理后台：http://x-bussiness.online/
- H5 员工端：http://x-bussiness.online/h5/
- 后端 API：http://x-bussiness.online/api/

---

## 八、优化效果预估

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 管理后台页面数 | 7 | 5 | -28% |
| H5 端页面数 | 8 | 5 | -37% |
| 推广操作步骤 | 6 | 3 | -50% |
| 用户上手时间 | 10 分钟 | 5 分钟 | -50% |
| 开发维护成本 | 基准 | -30% | -30% |

---

## 九、后续规划

### 短期（1-2 周）
- ✅ 合并推广统计和数据报表
- ✅ 合并海报模板和文案管理
- ✅ 实现推广套装功能
- ✅ 优化推广流程

### 中期（1 个月）
- ✅ 优化公众号类型识别逻辑
- ✅ 引入推广活动概念
- ✅ 添加智能预警功能
- ✅ 完善新手引导

### 长期（2-3 个月）
- ⏳ A/B 测试功能
- ⏳ 智能推荐
- ⏳ 实时数据推送
- ⏳ 高级数据分析

---

**文档版本**：v2.0
**最后更新**：2026-04-28
**下一步**：开始实施第一阶段优化
