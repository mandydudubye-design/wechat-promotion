import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { validate, createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema } from '../middleware/validation';
import { exportEmployees } from '../utils/export';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取员工列表
router.get('/', validate(employeeQuerySchema, 'query'), async (req: AuthRequest, res, next) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      keyword, 
      department, 
      position,
      bindStatus 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = 'SELECT * FROM employees WHERE 1=1';
    let params: any[] = [];

    if (keyword) {
      query += ' AND (name LIKE ? OR employee_id LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (position) {
      query += ' AND position = ?';
      params.push(position);
    }

    if (bindStatus !== undefined && bindStatus !== '') {
      query += ' AND bind_status = ?';
      params.push(bindStatus);
    }

    // 先获取总数
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = (countResult as any)[0].total;

    // 添加排序和分页
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), offset);

    const [rows] = await pool.query(query, params);

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        list: rows,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
});

// 导出员工数据
router.get('/export', async (req: AuthRequest, res, next) => {
  try {
    const { keyword, department, position, bindStatus } = req.query;

    let query = 'SELECT * FROM employees WHERE 1=1';
    let params: any[] = [];

    if (keyword) {
      query += ' AND (name LIKE ? OR employee_id LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (position) {
      query += ' AND position = ?';
      params.push(position);
    }

    if (bindStatus !== undefined && bindStatus !== '') {
      query += ' AND bind_status = ?';
      params.push(bindStatus);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    await exportEmployees(res, rows as any[]);
  } catch (error) {
    next(error);
  }
});

// 获取员工详情
router.get('/:employeeId', async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    const employees = rows as any[];
    if (employees.length === 0) {
      throw new ApiError(404, '员工不存在');
    }

    // 获取员工的关注统计
    const [followStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_follows,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as current_follows
       FROM follow_records
       WHERE employee_id = ?`,
      [employeeId]
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        ...(employees as any[])[0],
        follow_stats: (followStats as any[])[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// 添加员工
router.post('/', authorize('admin'), validate(createEmployeeSchema), async (req: AuthRequest, res, next) => {
  try {
    const { employee_id, name, phone, department, position } = req.body;

    // 检查员工ID是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if ((existing as any[]).length > 0) {
      throw new ApiError(400, '员工ID已存在');
    }

    await pool.query(
      'INSERT INTO employees (employee_id, name, phone, department, position) VALUES (?, ?, ?, ?, ?)',
      [employee_id, name, phone, department, position]
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

// 更新员工信息
router.put('/:employeeId', authorize('admin'), validate(updateEmployeeSchema), async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;
    const { name, phone, department, position } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      params.push(department);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      params.push(position);
    }

    if (updates.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }

    updates.push('updated_at = NOW()');
    params.push(employeeId);

    await pool.query(
      `UPDATE employees SET ${updates.join(', ')} WHERE employee_id = ?`,
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

// 禁用员工
router.put('/:employeeId/disable', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;

    await pool.query(
      'UPDATE employees SET bind_status = 2, updated_at = NOW() WHERE employee_id = ?',
      [employeeId]
    );

    res.json({
      code: 200,
      message: '禁用成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// 启用员工
router.put('/:employeeId/enable', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;

    await pool.query(
      'UPDATE employees SET bind_status = 1, updated_at = NOW() WHERE employee_id = ?',
      [employeeId]
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

// 删除员工
router.delete('/:employeeId', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;

    await pool.query('DELETE FROM employees WHERE employee_id = ?', [employeeId]);

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
