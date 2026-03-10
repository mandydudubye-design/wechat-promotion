# 🔄 双向同步策略 - 完整方案

## 🎯 问题分析

**两种场景**：

### 场景A：先关注，后登记
```
1. 员工关注公众号
   → follow_records有记录，is_employee=0
   
2. 员工完成登记
   → employee_info有记录
   → ❌ 问题：follow_records未更新
```

### 场景B：先登记，后关注
```
1. 员工完成登记
   → employee_info有记录，is_followed=0
   
2. 员工关注公众号
   → follow_records有记录
   → ❌ 问题：employee_info未更新
```

---

## ✅ 三重同步策略

### 策略1：员工登记时同步 ✅

**触发时机**：员工提交登记表单

**同步逻辑**：
```typescript
// employeeInfo.ts - register函数
async function registerEmployee(data) {
  // 1. 保存员工信息
  await saveEmployeeInfo(data);
  
  // 2. 检查是否已关注（场景A）
  const follower = await findFollower(data.openid);
  
  if (follower) {
    // 3. 已关注，双向更新
    await updateEmployeeFollowStatus(data.openid, true);
    await updateFollowerEmployeeInfo(data.openid, data.employee_id, data.name);
  }
}
```

**适用场景**：
- ✅ 场景A：先关注，后登记

### 策略2：关注事件时同步 ✅

**触发时机**：用户关注公众号

**同步逻辑**：
```typescript
// wechat.ts - handleNormalFollow函数
async function handleNormalFollow(openid) {
  // 1. 保存关注记录
  await saveFollowRecord(openid);
  
  // 2. 检查是否是已登记的员工（场景B）
  const employee = await findEmployeeByOpenid(openid);
  
  if (employee) {
    // 3. 是员工，双向更新
    await updateFollowerAsEmployee(openid, employee);
    await updateEmployeeFollowStatus(openid, true);
  }
}
```

**适用场景**：
- ✅ 场景B：先登记，后关注

### 策略3：定期全量同步 ✅

**触发时机**：每天定时执行

**同步逻辑**：
```typescript
// syncStatus.ts - syncAllStatus函数
async function syncAllStatus() {
  // 方向1：员工信息 → 关注记录
  await syncEmployeeToFollower();
  
  // 方向2：关注记录 → 员工信息
  await syncFollowerToEmployee();
}
```

**适用场景**：
- ✅ 兜底方案：修复所有不一致的数据

---

## 🚀 实现细节

### 1. 员工登记时同步

**代码位置**：`backend/src/routes/employeeInfo.ts`

```typescript
router.post('/register', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { openid, employee_id, name, phone } = req.body;

    await connection.beginTransaction();

    // 1. 保存员工信息
    await connection.query(
      `INSERT INTO employee_info 
      (openid, employee_id, name, phone, ...) 
      VALUES (?, ?, ?, ?, ...)`,
      [openid, employee_id, name, phone, ...]
    );

    // 2. 检查是否已关注（场景A：先关注，后登记）
    const [followers] = await connection.query(
      'SELECT subscribe_time FROM follow_records WHERE openid = ? AND status = 1',
      [openid]
    );

    const isFollowed = (followers as any[]).length > 0;

    // 3. 如果已关注，更新员工信息
    if (isFollowed) {
      const followTime = (followers as any[])[0].subscribe_time;
      
      await connection.query(
        'UPDATE employee_info SET is_followed = 1, follow_time = ? WHERE openid = ?',
        [followTime, openid]
      );

      // 4. 同时更新关注记录
      await connection.query(
        `UPDATE follow_records 
        SET is_employee = 1, 
            employee_id = ?,
            employee_name = ?
        WHERE openid = ?`,
        [employee_id, name, openid]
      );
    }

    await connection.commit();

    res.json({
      code: 200,
      message: '登记成功',
      data: {
        is_followed: isFollowed,
        follow_time: isFollowed ? followTime : null
      }
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
```

### 2. 关注事件时同步

**代码位置**：`backend/src/routes/wechat.ts`

#### 普通关注事件

```typescript
async function handleNormalFollow(connection: any, openid: string) {
  try {
    // 1. 获取用户信息
    const userInfo = await getUserInfo(openid);
    
    // 2. 保存关注记录
    await connection.query(
      `INSERT INTO follow_records 
      (openid, nickname, subscribe_time, status) 
      VALUES (?, ?, NOW(), 1)`,
      [openid, userInfo.nickname || '']
    );

    // 3. 检查是否是已登记的员工（场景B：先登记，后关注）
    const [employee] = await connection.query(
      'SELECT employee_id, name FROM employee_info WHERE openid = ?',
      [openid]
    );

    if ((employee as any[]).length > 0) {
      const emp = (employee as any[])[0];
      
      // 4. 是员工，更新关注记录
      await connection.query(
        `UPDATE follow_records 
        SET is_employee = 1, 
            employee_id = ?,
            employee_name = ?
        WHERE openid = ?`,
        [emp.employee_id, emp.name, openid]
      );

      // 5. 更新员工信息表的关注状态
      await connection.query(
        'UPDATE employee_info SET is_followed = 1, follow_time = NOW() WHERE openid = ?',
        [openid]
      );

      logger.info('关注事件：识别为已登记员工', { 
        openid, 
        employee_id: emp.employee_id,
        name: emp.name 
      });
    }

  } catch (error) {
    logger.error('处理关注事件失败', error);
  }
}
```

#### 扫码关注事件

```typescript
async function handleScanFollow(connection: any, openid: string, employeeId: string) {
  try {
    // 1. 获取用户信息
    const userInfo = await getUserInfo(openid);
    
    // 2. 保存关注记录（带推广信息）
    await connection.query(
      `INSERT INTO follow_records 
      (openid, nickname, employee_id, subscribe_time, status) 
      VALUES (?, ?, ?, NOW(), 1)`,
      [openid, userInfo.nickname || '', employeeId]
    );

    // 3. 检查扫码者是否是已登记的员工（双重身份）
    const [employee] = await connection.query(
      'SELECT employee_id, name FROM employee_info WHERE openid = ?',
      [openid]
    );

    if ((employee as any[]).length > 0) {
      const emp = (employee as any[])[0];
      
      // 4. 更新关注记录为员工
      await connection.query(
        `UPDATE follow_records 
        SET is_employee = 1, 
            employee_name = ?
        WHERE openid = ?`,
        [emp.name, openid]
      );

      // 5. 更新员工信息表
      await connection.query(
        'UPDATE employee_info SET is_followed = 1, follow_time = NOW() WHERE openid = ?',
        [openid]
      );

      logger.info('扫码关注：识别为已登记员工（双重身份）', { 
        openid, 
        promoter: employeeId,
        self: emp.employee_id,
        name: emp.name 
      });
    }

  } catch (error) {
    logger.error('处理扫码关注失败', error);
  }
}
```

#### 取消关注事件

```typescript
async function handleUnfollow(connection: any, openid: string) {
  try {
    // 1. 更新关注记录状态
    await connection.query(
      'UPDATE follow_records SET status = 0, unsubscribed_at = NOW() WHERE openid = ?',
      [openid]
    );

    // 2. 如果是员工，更新员工信息表
    await connection.query(
      'UPDATE employee_info SET is_followed = 0, follow_time = NULL WHERE openid = ?',
      [openid]
    );

    logger.info('取消关注：已更新员工状态', { openid });

  } catch (error) {
    logger.error('处理取消关注失败', error);
  }
}
```

### 3. 定期全量同步

**代码位置**：`backend/src/scripts/syncStatus.ts`

```typescript
export async function syncAllStatus() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // ========================================
    // 方向1：员工信息 → 关注记录
    // 场景：员工先登记，后关注公众号
    // ========================================
    
    logger.info('📊 同步方向1：员工信息 → 关注记录');
    
    // 1. 更新所有已登记员工的关注状态
    await connection.query(
      `UPDATE employee_info ei
      LEFT JOIN follow_records fr ON ei.openid = fr.openid
      SET ei.is_followed = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN 1 ELSE 0 END,
          ei.follow_time = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN fr.subscribe_time ELSE NULL END`
    );
    
    // 2. 更新关注记录的员工信息
    await connection.query(
      `UPDATE follow_records fr
      INNER JOIN employee_info ei ON fr.openid = ei.openid
      SET fr.is_employee = 1,
          fr.employee_id = ei.employee_id,
          fr.employee_name = ei.name
      WHERE fr.status = 1`
    );

    // ========================================
    // 方向2：关注记录 → 员工信息
    // 场景：员工先关注，后登记
    // ========================================
    
    logger.info('📊 同步方向2：关注记录 → 员工信息');
    
    // 3. 更新所有已关注用户的员工状态
    await connection.query(
      `UPDATE follow_records fr
      LEFT JOIN employee_info ei ON fr.openid = ei.openid
      SET fr.is_employee = CASE WHEN ei.openid IS NOT NULL THEN 1 ELSE 0 END,
          fr.employee_id = CASE WHEN ei.openid IS NOT NULL THEN ei.employee_id ELSE NULL END,
          fr.employee_name = CASE WHEN ei.openid IS NOT NULL THEN ei.name ELSE NULL END
      WHERE fr.status = 1`
    );
    
    // 4. 更新员工信息的关注状态（对于取消关注的）
    await connection.query(
      `UPDATE employee_info ei
      LEFT JOIN follow_records fr ON ei.openid = fr.openid
      SET ei.is_followed = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN 1 ELSE 0 END,
          ei.follow_time = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN fr.subscribe_time ELSE NULL END`
    );

    await connection.commit();

    // 统计信息
    const [stats] = await connection.query(
      `SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN is_followed = 1 THEN 1 ELSE 0 END) as followed_count
      FROM employee_info`
    );

    logger.info('✅ 双向同步完成！', { stats: stats[0] });

    return { success: true, stats: stats[0] };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

---

## 🎮 使用方法

### 方式1：手动同步

```bash
# 全量同步
npm run sync all

# 同步单个OpenID
npm run sync single oxxxxxxxxxxxxx
```

### 方式2：API同步

```bash
# 全量同步
curl -X POST http://localhost:3000/api/employee-info/sync-follow-status \
  -H "Content-Type: application/json" \
  -d '{"mode": "all"}'

# 同步单个OpenID
curl -X POST http://localhost:3000/api/employee-info/sync-follow-status \
  -H "Content-Type: application/json" \
  -d '{"mode": "single", "openid": "oxxxxxxxxxxxxx"}'
```

### 方式3：定时同步（推荐）

使用cron或node-schedule定时执行：

```typescript
// backend/src/scheduler.ts
import schedule from 'node-schedule';
import { syncAllStatus } from './scripts/syncStatus';

// 每天凌晨2点执行全量同步
schedule.scheduleJob('0 2 * * *', async () => {
  console.log('🔄 开始定时同步...');
  try {
    await syncAllStatus();
    console.log('✅ 定时同步完成');
  } catch (error) {
    console.error('❌ 定时同步失败：', error);
  }
});
```

---

## 📊 同步效果验证

### 查看同步状态

```sql
-- 查看员工关注状态
SELECT 
  employee_id,
  name,
  is_followed,
  follow_time
FROM employee_info
ORDER BY register_time DESC;

-- 查看关注记录的员工标记
SELECT 
  openid,
  nickname,
  is_employee,
  employee_id,
  employee_name,
  subscribe_time
FROM follow_records
WHERE status = 1
ORDER BY subscribe_time DESC;

-- 对比两个表的数据
SELECT 
  ei.employee_id,
  ei.name,
  ei.is_followed,
  fr.is_employee,
  CASE 
    WHEN ei.is_followed = 1 AND fr.is_employee = 1 THEN '✅ 正常'
    WHEN ei.is_followed = 0 AND fr.is_employee = 0 THEN '✅ 正常'
    ELSE '❌ 不一致'
  END as status
FROM employee_info ei
LEFT JOIN follow_records fr ON ei.openid = fr.openid;
```

---

## 🔍 故障排查

### 问题1：同步后数据仍不一致

**原因**：可能存在重复记录或脏数据

**解决**：
```sql
-- 查找重复记录
SELECT openid, COUNT(*) as count
FROM employee_info
GROUP BY openid
HAVING count > 1;

-- 查找重复记录
SELECT openid, COUNT(*) as count
FROM follow_records
GROUP BY openid
HAVING count > 1;
```

### 问题2：关注事件未触发同步

**原因**：微信服务器配置错误

**解决**：
```bash
# 检查服务器配置
curl https://your-domain.com/api/wechat/callback

# 查看日志
tail -f logs/app.log | grep "关注事件"
```

### 问题3：登记时未触发同步

**原因**：数据库事务未提交

**解决**：检查是否有异常导致事务回滚

---

## ✅ 测试清单

### 场景A测试：先关注，后登记

```bash
# 1. 模拟关注
curl -X POST http://localhost:3000/api/wechat/simulate/subscribe \
  -d '{"openid": "test001"}'

# 2. 验证关注记录
mysql -e "SELECT * FROM follow_records WHERE openid = 'test001'"

# 3. 员工登记
curl -X POST http://localhost:3000/api/employee-info/register \
  -H "Content-Type: application/json" \
  -d '{
    "openid": "test001",
    "employee_id": "TEST001",
    "name": "测试员工",
    "phone": "13800138000"
  }'

# 4. 验证双向更新
mysql -e "
  SELECT * FROM follow_records WHERE openid = 'test001';
  SELECT * FROM employee_info WHERE openid = 'test001';
"
```

### 场景B测试：先登记，后关注

```bash
# 1. 员工登记
curl -X POST http://localhost:3000/api/employee-info/register \
  -H "Content-Type: application/json" \
  -d '{
    "openid": "test002",
    "employee_id": "TEST002",
    "name": "测试员工2",
    "phone": "13800138001"
  }'

# 2. 验证登记记录
mysql -e "SELECT * FROM employee_info WHERE openid = 'test002'"

# 3. 模拟关注
curl -X POST http://localhost:3000/api/wechat/simulate/subscribe \
  -d '{"openid": "test002"}'

# 4. 验证双向更新
mysql -e "
  SELECT * FROM follow_records WHERE openid = 'test002';
  SELECT * FROM employee_info WHERE openid = 'test002';
"
```

---

## 🎉 总结

### 三重同步策略

1. **员工登记时同步**：处理场景A（先关注，后登记）
2. **关注事件时同步**：处理场景B（先登记，后关注）
3. **定期全量同步**：兜底方案，修复所有不一致

### 优势

- ✅ 实时同步：无需等待定时任务
- ✅ 双向同步：两个方向都覆盖
- ✅ 兜底方案：定时任务保证最终一致性
- ✅ 详细日志：方便排查问题

### 使用建议

- 日常使用：实时同步自动处理
- 定期检查：每天凌晨执行全量同步
- 发现问题：手动执行单个OpenID同步

---

**🎉 双向同步策略已完全实现！**
