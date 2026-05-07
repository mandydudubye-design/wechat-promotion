import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * H5 端获取公众号列表（无需认证）
 * 只返回已启用的公众号
 * GET /api/accounts/public
 */
router.get('/public', async (req: any, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, account_name, wechat_id, account_type, verified, qr_code_url, avatar, description FROM wechat_account_configs WHERE status = 1 ORDER BY created_at DESC'
    );

    // 转换为 H5 端需要的格式
    const accounts = (rows as any[]).map((acc: any) => ({
      id: acc.id.toString(),
      name: acc.account_name,
      wechatId: acc.wechat_id,
      appId: acc.app_id,
      appSecret: '', // 不返回敏感信息
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
  } catch (error) {
    next(error);
  }
});

// 以下路由需要认证（临时禁用，方便调试）
// router.use(authenticate);

// 获取公众号列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM wechat_account_configs WHERE 1=1';
    let params: any[] = [];

    if (status !== undefined) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

// 获取公众号详情
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM wechat_account_configs WHERE id = ?',
      [id]
    );

    const accounts = rows as any[];
    if (accounts.length === 0) {
      throw new ApiError(404, '公众号不存在');
    }

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: (accounts as any)[0]
    });
  } catch (error) {
    next(error);
  }
});

// 添加公众号（临时禁用权限验证）
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { account_name, wechat_id, app_id, app_secret, account_type, verified, qr_code_url, description, avatar } = req.body;

    console.log('添加公众号请求体:', req.body);

    if (!account_name || !app_id) {
      throw new ApiError(400, '公众号名称和AppID不能为空');
    }

    // 检查AppID是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM wechat_account_configs WHERE app_id = ?',
      [app_id]
    );

    if ((existing as any[]).length > 0) {
      throw new ApiError(400, 'AppID已存在');
    }

    await pool.query(
      `INSERT INTO wechat_account_configs (account_name, wechat_id, app_id, app_secret, account_type, verified, qr_code_url, description, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [account_name, wechat_id || null, app_id, app_secret || '', account_type || 'service', verified ? 1 : 0, qr_code_url || null, description || null, avatar || null]
    );

    res.json({
      code: 200,
      message: '添加成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('添加公众号失败:', error);
    next(error);
  }
});

// 更新公众号信息（临时禁用权限验证）
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { account_name, wechat_id, app_secret, account_type, verified, qr_code_url, description, avatar } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (account_name) {
      updates.push('account_name = ?');
      params.push(account_name);
    }
    if (wechat_id !== undefined) {
      updates.push('wechat_id = ?');
      params.push(wechat_id);
    }
    if (app_secret !== undefined) {
      updates.push('app_secret = ?');
      params.push(app_secret);
    }
    if (account_type) {
      updates.push('account_type = ?');
      params.push(account_type);
    }
    if (verified !== undefined) {
      updates.push('verified = ?');
      params.push(verified ? 1 : 0);
    }
    if (qr_code_url !== undefined) {
      updates.push('qr_code_url = ?');
      params.push(qr_code_url);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.query(
      `UPDATE wechat_account_configs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      code: 200,
      message: '更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// 启用公众号
router.put('/:id/enable', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE wechat_account_configs SET status = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      code: 200,
      message: '启用成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// 停用公众号
router.put('/:id/disable', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE wechat_account_configs SET status = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      code: 200,
      message: '停用成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// 删除公众号（临时禁用权限验证）
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM wechat_account_configs WHERE id = ?', [id]);

    res.json({
      code: 200,
      message: '删除成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
