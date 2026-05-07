import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取推广套装列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { account_id, keyword } = req.query;

    let query = `
      SELECT pk.*, wa.account_name,
             pt.name as poster_template_name, pt.image_url as poster_image_url,
             ct.name as text_template_name, ct.content as text_content
      FROM promotion_kits pk
      LEFT JOIN wechat_accounts wa ON pk.account_id = wa.id
      LEFT JOIN poster_templates pt ON pk.poster_template_id = pt.id
      LEFT JOIN circle_texts ct ON pk.text_template_id = ct.id
      WHERE 1=1
    `;
    let params: any[] = [];

    if (account_id) {
      query += ' AND pk.account_id = ?';
      params.push(account_id);
    }

    if (keyword) {
      query += ' AND pk.name LIKE ?';
      params.push(`%${keyword}%`);
    }

    query += ' ORDER BY pk.is_default DESC, pk.created_at DESC';

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

// 获取推广套装详情
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT pk.*, wa.account_name,
              pt.name as poster_template_name, pt.* as poster_template,
              ct.name as text_template_name, ct.* as text_template
       FROM promotion_kits pk
       LEFT JOIN wechat_accounts wa ON pk.account_id = wa.id
       LEFT JOIN poster_templates pt ON pk.poster_template_id = pt.id
       LEFT JOIN circle_texts ct ON pk.text_template_id = ct.id
       WHERE pk.id = ?`,
      [id]
    );

    const kits = rows as any[];
    if (kits.length === 0) {
      throw new ApiError(404, '推广套装不存在');
    }

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: kits[0]
    });
  } catch (error) {
    next(error);
  }
});

// 添加推广套装
router.post('/', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { name, poster_template_id, text_template_id, account_id, is_default } = req.body;

    if (!name || !poster_template_id || !text_template_id || !account_id) {
      throw new ApiError(400, '套装名称、海报模板ID、文案模板ID和公众号ID不能为空');
    }

    // 如果设为默认，先取消该公众号的其他默认套装
    if (is_default) {
      await pool.query(
        'UPDATE promotion_kits SET is_default = FALSE WHERE account_id = ?',
        [account_id]
      );
    }

    const [result] = await pool.query(
      'INSERT INTO promotion_kits (name, poster_template_id, text_template_id, account_id, is_default) VALUES (?, ?, ?, ?, ?)',
      [name, poster_template_id, text_template_id, account_id, is_default || false]
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

// 更新推广套装
router.put('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, poster_template_id, text_template_id, account_id, is_default } = req.body;

    // 如果设为默认，先取消该公众号的其他默认套装
    if (is_default) {
      const [currentKit] = await pool.query('SELECT account_id FROM promotion_kits WHERE id = ?', [id]);
      if ((currentKit as any[]).length > 0) {
        await pool.query(
          'UPDATE promotion_kits SET is_default = FALSE WHERE account_id = ? AND id != ?',
          [(currentKit as any)[0].account_id, id]
        );
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (poster_template_id) {
      updates.push('poster_template_id = ?');
      params.push(poster_template_id);
    }
    if (text_template_id) {
      updates.push('text_template_id = ?');
      params.push(text_template_id);
    }
    if (account_id) {
      updates.push('account_id = ?');
      params.push(account_id);
    }
    if (is_default !== undefined) {
      updates.push('is_default = ?');
      params.push(is_default);
    }

    if (updates.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.query(
      `UPDATE promotion_kits SET ${updates.join(', ')} WHERE id = ?`,
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

// 设为默认套装
router.put('/:id/set-default', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // 获取该套装的公众号ID
    const [currentKit] = await pool.query('SELECT account_id FROM promotion_kits WHERE id = ?', [id]);
    if ((currentKit as any[]).length === 0) {
      throw new ApiError(404, '推广套装不存在');
    }

    const accountId = (currentKit as any)[0].account_id;

    // 取消该公众号的其他默认套装
    await pool.query(
      'UPDATE promotion_kits SET is_default = FALSE WHERE account_id = ? AND id != ?',
      [accountId, id]
    );

    // 设为默认
    await pool.query(
      'UPDATE promotion_kits SET is_default = TRUE, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      code: 200,
      message: '设置成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// 删除推广套装
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM promotion_kits WHERE id = ?', [id]);

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
