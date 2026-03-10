import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取公众号列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM wechat_accounts WHERE 1=1';
    let params: any[] = [];

    if (status !== undefined) {
      query += ' AND status = ?';
      params.push(Number(status));
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
      'SELECT * FROM wechat_accounts WHERE id = ?',
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

// 添加公众号
router.post('/', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { account_name, app_id, app_secret, description, avatar } = req.body;

    if (!account_name || !app_id) {
      throw new ApiError(400, '公众号名称和AppID不能为空');
    }

    // 检查AppID是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM wechat_accounts WHERE app_id = ?',
      [app_id]
    );

    if ((existing as any[]).length > 0) {
      throw new ApiError(400, 'AppID已存在');
    }

    await pool.query(
      'INSERT INTO wechat_accounts (account_name, app_id, app_secret, description, avatar) VALUES (?, ?, ?, ?, ?)',
      [account_name, app_id, app_secret, description, avatar]
    );

    res.json({
      code: 200,
      message: '添加成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// 更新公众号信息
router.put('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { account_name, app_secret, description, avatar } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (account_name) {
      updates.push('account_name = ?');
      params.push(account_name);
    }
    if (app_secret !== undefined) {
      updates.push('app_secret = ?');
      params.push(app_secret);
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
      `UPDATE wechat_accounts SET ${updates.join(', ')} WHERE id = ?`,
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
      'UPDATE wechat_accounts SET status = 1, updated_at = NOW() WHERE id = ?',
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
      'UPDATE wechat_accounts SET status = 0, updated_at = NOW() WHERE id = ?',
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

// 删除公众号
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM wechat_accounts WHERE id = ?', [id]);

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
