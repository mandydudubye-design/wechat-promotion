import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

/**
 * H5 端获取公众号列表（无需认证）
 * GET /api/employee-info/accounts
 */
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, account_name, wechat_id, account_type, verified, qr_code_url, avatar, description FROM wechat_account_configs WHERE status = 1 ORDER BY created_at DESC'
    );

    // 转换为 H5 端需要的格式
    const accounts = (rows as any[]).map((acc: any) => ({
      id: acc.id.toString(),
      name: acc.account_name,
      wechatId: acc.wechat_id,
      appId: '', // 不返回敏感信息
      appSecret: '',
      accountType: acc.account_type === 'service' ? 'service' : 'subscription',
      verified: acc.verified === 1,
      qrCodeUrl: acc.qr_code_url || '',
      avatar: acc.avatar || '',
      totalFollowers: 0, // 暂不返回统计数据
      todayNewFollows: 0,
      isPrimary: false, // 暂不实现主推逻辑
    }));

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: accounts
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '获取失败',
      timestamp: Date.now(),
      error: error.message
    });
  }
});

/**
 * 员工信息登记
 */
router.post('/register', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      openid, 
      employee_id, 
      name, 
      phone,
      department,
      position
    } = req.body;

    // 1. 验证必填字段
    if (!openid || !employee_id || !name || !phone) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整信息（工号、姓名、手机号）'
      });
    }

    // 2. 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '请输入正确的手机号'
      });
    }

    await connection.beginTransaction();

    // 3. 检查OpenID是否已登记
    const [existing] = await connection.query(
      'SELECT employee_id, name FROM employee_info WHERE openid = ?',
      [openid]
    );

    if ((existing as any[]).length > 0) {
      await connection.rollback();
      return res.status(400).json({
        code: 400,
        message: `您已登记为：${(existing as any[])[0].name}（${(existing as any[])[0].employee_id}）`
      });
    }

    // 4. 检查是否已关注公众号
    const [followers] = await connection.query(
      'SELECT subscribe_time FROM follow_records WHERE openid = ?',
      [openid]
    );

    const isFollowed = (followers as any[]).length > 0;
    const followTime = isFollowed ? (followers as any[])[0].subscribe_time : null;

    // 5. 插入员工信息
    const [result] = await connection.query(
      `INSERT INTO employee_info 
      (openid, employee_id, name, phone, department, position, is_followed, follow_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [openid, employee_id, name, phone, department || null, position || null, isFollowed ? 1 : 0, followTime]
    );

    // 6. 如果已关注，更新follow_records表的员工信息
    if (isFollowed) {
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
        id: (result as any).insertId,
        employee_id,
        name,
        is_followed: isFollowed,
        follow_time: followTime
      }
    });

  } catch (error: any) {
    await connection.rollback();
    console.error('登记失败:', error);
    
    // 处理唯一索引冲突
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('employee_id')) {
        return res.status(400).json({
          code: 400,
          message: '该工号已被使用'
        });
      }
      if (error.sqlMessage.includes('phone')) {
        return res.status(400).json({
          code: 400,
          message: '该手机号已被使用'
        });
      }
    }
    
    res.status(500).json({
      code: 500,
      message: '登记失败',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * 检查登记状态
 */
router.get('/check/:openid', async (req: Request, res: Response) => {
  try {
    const { openid } = req.params;

    const [employees] = await pool.query(
      'SELECT employee_id, name, department, position, is_followed, follow_time FROM employee_info WHERE openid = ?',
      [openid]
    );

    if ((employees as any[]).length > 0) {
      const employee = (employees as any[])[0];
      res.json({
        code: 200,
        data: {
          registered: true,
          ...employee
        }
      });
    } else {
      res.json({
        code: 200,
        data: {
          registered: false
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '查询失败',
      error: error.message
    });
  }
});

/**
 * 获取员工列表
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const [employees] = await pool.query(
      `SELECT 
        id,
        openid,
        employee_id,
        name,
        phone,
        department,
        position,
        is_followed,
        follow_time,
        register_time
      FROM employee_info
      ORDER BY register_time DESC
      LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const [count] = await pool.query(
      'SELECT COUNT(*) as total FROM employee_info'
    );

    res.json({
      code: 200,
      data: {
        list: employees,
        total: (count as any[])[0].total,
        page,
        pageSize
      }
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '获取员工列表失败',
      error: error.message
    });
  }
});

/**
 * 获取员工关注统计
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [stats] = await pool.query('SELECT * FROM v_employee_follow_summary');

    res.json({
      code: 200,
      data: (stats as any[])[0]
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '获取统计失败',
      error: error.message
    });
  }
});

/**
 * 获取员工详情
 */
router.get('/detail/:openid', async (req: Request, res: Response) => {
  try {
    const { openid } = req.params;

    const [employees] = await pool.query(
      `SELECT 
        ei.*,
        fr.nickname as wechat_nickname,
        fr.subscribe_time,
        fr.headimgurl
      FROM employee_info ei
      LEFT JOIN follow_records fr ON ei.openid = fr.openid
      WHERE ei.openid = ?`,
      [openid]
    );

    if ((employees as any[]).length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到员工信息'
      });
    }

    res.json({
      code: 200,
      data: (employees as any[])[0]
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '获取员工详情失败',
      error: error.message
    });
  }
});

/**
 * 更新员工信息
 */
router.put('/update/:openid', async (req: Request, res: Response) => {
  try {
    const { openid } = req.params;
    const { name, phone, department, position } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      values.push(position);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有要更新的字段'
      });
    }

    values.push(openid);

    await pool.query(
      `UPDATE employee_info SET ${updates.join(', ')} WHERE openid = ?`,
      values
    );

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '更新失败',
      error: error.message
    });
  }
});

/**
 * 删除员工信息
 */
router.delete('/delete/:openid', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { openid } = req.params;

    await connection.beginTransaction();

    // 删除员工信息
    await connection.query(
      'DELETE FROM employee_info WHERE openid = ?',
      [openid]
    );

    // 更新关注记录
    await connection.query(
      'UPDATE follow_records SET is_employee = 0, employee_id = NULL, employee_name = NULL WHERE openid = ?',
      [openid]
    );

    await connection.commit();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({
      code: 500,
      message: '删除失败',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * 同步关注状态（手动触发）
 */
router.post('/sync-follow-status', async (req: Request, res: Response) => {
  try {
    // 导入同步函数
    const { syncAllStatus, syncSingleOpenid } = await import('../scripts/syncStatus');
    
    const { openid, mode } = req.body;

    if (mode === 'single' && openid) {
      // 同步单个OpenID
      await syncSingleOpenid(openid);
      res.json({
        code: 200,
        message: '单个同步成功',
        data: { openid }
      });
    } else {
      // 全量同步
      const result = await syncAllStatus();
      res.json({
        code: 200,
        message: '全量同步成功',
        data: result
      });
    }
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '同步失败',
      error: error.message
    });
  }
});

export default router;
