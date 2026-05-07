import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取海报模板列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, account_id, keyword } = req.query;

    let query = `
      SELECT pt.*, wa.account_name
      FROM poster_templates pt
      LEFT JOIN wechat_accounts wa ON pt.account_id = wa.id
      WHERE 1=1
    `;
    let params: any[] = [];

    if (status) {
      query += ' AND pt.status = ?';
      params.push(status);
    }

    if (account_id) {
      query += ' AND pt.account_id = ?';
      params.push(account_id);
    }

    if (keyword) {
      query += ' AND (pt.name LIKE ? OR pt.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    query += ' ORDER BY pt.created_at DESC';

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

// 获取海报模板详情
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT pt.*, wa.account_name
       FROM poster_templates pt
       LEFT JOIN wechat_accounts wa ON pt.account_id = wa.id
       WHERE pt.id = ?`,
      [id]
    );

    const templates = rows as any[];
    if (templates.length === 0) {
      throw new ApiError(404, '海报模板不存在');
    }

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: templates[0]
    });
  } catch (error) {
    next(error);
  }
});

// 添加海报模板
router.post('/', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { name, account_id, description, width, height, qr_x, qr_y, qr_size, show_referral_code, image_url } = req.body;

    if (!name || !account_id) {
      throw new ApiError(400, '模板名称和公众号ID不能为空');
    }

    const [result] = await pool.query(
      `INSERT INTO poster_templates (name, account_id, description, width, height, qr_x, qr_y, qr_size, show_referral_code, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, account_id, description, width || 1080, height || 1920, qr_x || 540, qr_y || 1600, qr_size || 200, show_referral_code !== undefined ? show_referral_code : true, image_url]
    );

    res.json({
      code: 200,
      message: '添加成功',
      timestamp: Date.now(),
      data: { id: (result as any).insertId }
    });
  } catch (error) {
    next(error);
  }
});

// 更新海报模板
router.put('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, account_id, description, width, height, qr_x, qr_y, qr_size, show_referral_code, image_url, status } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (account_id) {
      updates.push('account_id = ?');
      params.push(account_id);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (width !== undefined) {
      updates.push('width = ?');
      params.push(width);
    }
    if (height !== undefined) {
      updates.push('height = ?');
      params.push(height);
    }
    if (qr_x !== undefined) {
      updates.push('qr_x = ?');
      params.push(qr_x);
    }
    if (qr_y !== undefined) {
      updates.push('qr_y = ?');
      params.push(qr_y);
    }
    if (qr_size !== undefined) {
      updates.push('qr_size = ?');
      params.push(qr_size);
    }
    if (show_referral_code !== undefined) {
      updates.push('show_referral_code = ?');
      params.push(show_referral_code);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.query(
      `UPDATE poster_templates SET ${updates.join(', ')} WHERE id = ?`,
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

// 删除海报模板
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM poster_templates WHERE id = ?', [id]);

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
