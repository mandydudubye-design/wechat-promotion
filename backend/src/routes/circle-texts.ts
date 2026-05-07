import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取文案列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, category, keyword } = req.query;

    let query = 'SELECT * FROM circle_texts WHERE 1=1';
    let params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      query += ' AND (name LIKE ? OR content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
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

// 获取文案详情
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM circle_texts WHERE id = ?', [id]);

    const texts = rows as any[];
    if (texts.length === 0) {
      throw new ApiError(404, '文案不存在');
    }

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: texts[0]
    });
  } catch (error) {
    next(error);
  }
});

// 添加文案
router.post('/', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { name, category, content, variables } = req.body;

    if (!name || !content) {
      throw new ApiError(400, '文案名称和内容不能为空');
    }

    const [result] = await pool.query(
      'INSERT INTO circle_texts (name, category, content, variables) VALUES (?, ?, ?, ?)',
      [name, category || 'general', content, JSON.stringify(variables || [])]
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

// 更新文案
router.put('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, content, variables, status } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (variables !== undefined) {
      updates.push('variables = ?');
      params.push(JSON.stringify(variables));
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
      `UPDATE circle_texts SET ${updates.join(', ')} WHERE id = ?`,
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

// 删除文案
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM circle_texts WHERE id = ?', [id]);

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
