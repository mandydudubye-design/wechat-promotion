import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { exportFollows } from '../utils/export';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取关注记录列表
router.get('/records', async (req: AuthRequest, res, next) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      keyword, 
      employeeId,
      accountId,
      status,
      startDate,
      endDate 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `
      SELECT fr.*, e.name as employee_name, a.account_name 
      FROM follow_records fr
      LEFT JOIN employees e ON fr.employee_id = e.employee_id
      LEFT JOIN wechat_accounts a ON fr.account_id = a.id
      WHERE 1=1
    `;
    let params: any[] = [];

    if (keyword) {
      query += ' AND (fr.nickname LIKE ? OR fr.openid LIKE ? OR e.name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (employeeId) {
      query += ' AND fr.employee_id = ?';
      params.push(employeeId);
    }

    if (accountId) {
      query += ' AND fr.account_id = ?';
      params.push(accountId);
    }

    if (status !== undefined) {
      query += ' AND fr.status = ?';
      params.push(Number(status));
    }

    if (startDate) {
      query += ' AND fr.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND fr.created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY fr.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), offset);

    const [rows] = await pool.query(query, params);

    // 获取总数
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM follow_records fr
      LEFT JOIN employees e ON fr.employee_id = e.employee_id
      WHERE 1=1
    `;
    let countParams: any[] = [];

    if (keyword) {
      countQuery += ' AND (fr.nickname LIKE ? OR fr.openid LIKE ? OR e.name LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (employeeId) {
      countQuery += ' AND fr.employee_id = ?';
      countParams.push(employeeId);
    }

    if (accountId) {
      countQuery += ' AND fr.account_id = ?';
      countParams.push(accountId);
    }

    if (status !== undefined) {
      countQuery += ' AND fr.status = ?';
      countParams.push(Number(status));
    }

    if (startDate) {
      countQuery += ' AND fr.created_at >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND fr.created_at <= ?';
      countParams.push(endDate);
    }

    const [countRows] = await pool.query(countQuery, countParams);
    const total = (countRows as any)[0].total;

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

// 获取员工关注列表
router.get('/employee/:employeeId', async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT fr.*, a.account_name 
      FROM follow_records fr
      LEFT JOIN wechat_accounts a ON fr.account_id = a.id
      WHERE fr.employee_id = ?
    `;
    let params: any[] = [employeeId];

    if (status !== undefined) {
      query += ' AND fr.status = ?';
      params.push(Number(status));
    }

    query += ' ORDER BY fr.created_at DESC';

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

// 获取关注详情
router.get('/records/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT fr.*, e.name as employee_name, a.account_name 
       FROM follow_records fr
       LEFT JOIN employees e ON fr.employee_id = e.employee_id
       LEFT JOIN wechat_accounts a ON fr.account_id = a.id
       WHERE fr.id = ?`,
      [id]
    );

    const records = rows as any[];
    if (records.length === 0) {
      throw new ApiError(404, '关注记录不存在');
    }

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: (records as any)[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新关注状态
router.put('/records/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || ![0, 1].includes(Number(status))) {
      throw new ApiError(400, '状态值无效，必须为0（已取关）或1（已关注）');
    }

    await pool.query(
      'UPDATE follow_records SET status = ?, unfollowed_at = CASE WHEN ? = 0 THEN NOW() ELSE NULL END, updated_at = NOW() WHERE id = ?',
      [Number(status), Number(status), id]
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

// 同步微信关注者列表
router.post('/sync', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { account_id } = req.body;

    if (!account_id) {
      throw new ApiError(400, '公众号ID不能为空');
    }

    // TODO: 调用微信API获取关注者列表
    // 这里暂时返回模拟数据
    const mockFollowers = {
      total: 100,
      count: 10,
      data: {
        openid: ['openid1', 'openid2', 'openid3']
      },
      next_openid: 'next_openid_token'
    };

    res.json({
      code: 200,
      message: '同步成功',
      timestamp: Date.now(),
      data: mockFollowers
    });
  } catch (error) {
    next(error);
  }
});

// 获取关注统计数据
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const { employee_id, account_id, start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    let params: any[] = [];

    if (employee_id) {
      whereClause += ' AND employee_id = ?';
      params.push(employee_id);
    }

    if (account_id) {
      whereClause += ' AND account_id = ?';
      params.push(account_id);
    }

    if (start_date) {
      whereClause += ' AND created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND created_at <= ?';
      params.push(end_date);
    }

    // 总体统计
    const [totalStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_follows,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as current_follows,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unfollows,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as retention_rate
       FROM follow_records ${whereClause}`,
      params
    );

    // 员工排行
    const [employeeRanking] = await pool.query(
      `SELECT 
        e.employee_id,
        e.name as employee_name,
        COUNT(*) as total_follows,
        SUM(CASE WHEN fr.status = 1 THEN 1 ELSE 0 END) as current_follows,
        SUM(CASE WHEN fr.status = 0 THEN 1 ELSE 0 END) as unfollows
       FROM follow_records fr
       LEFT JOIN employees e ON fr.employee_id = e.employee_id
       ${whereClause}
       GROUP BY e.employee_id, e.name
       ORDER BY current_follows DESC
       LIMIT 10`,
      params
    );

    // 公众号统计
    const [accountStats] = await pool.query(
      `SELECT 
        a.id,
        a.account_name,
        COUNT(*) as total_follows,
        SUM(CASE WHEN fr.status = 1 THEN 1 ELSE 0 END) as current_follows,
        SUM(CASE WHEN fr.status = 0 THEN 1 ELSE 0 END) as unfollows
       FROM follow_records fr
       LEFT JOIN wechat_accounts a ON fr.account_id = a.id
       ${whereClause}
       GROUP BY a.id, a.account_name
       ORDER BY current_follows DESC`,
      params
    );

    // 时间趋势（每日统计）
    const [timeTrend] = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_follows,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unfollows
       FROM follow_records ${whereClause}
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        total: (totalStats as any)[0],
        employee_ranking: employeeRanking,
        account_stats: accountStats,
        time_trend: timeTrend
      }
    });
  } catch (error) {
    next(error);
  }
});

// 导出关注数据
router.get('/export', async (req: AuthRequest, res, next) => {
  try {
    const { employee_id, account_id, start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    let params: any[] = [];

    if (employee_id) {
      whereClause += ' AND fr.employee_id = ?';
      params.push(employee_id);
    }

    if (account_id) {
      whereClause += ' AND fr.account_id = ?';
      params.push(account_id);
    }

    if (start_date) {
      whereClause += ' AND fr.created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND fr.created_at <= ?';
      params.push(end_date);
    }

    const [rows] = await pool.query(
      `SELECT 
        fr.*,
        e.name as employee_name,
        a.account_name
       FROM follow_records fr
       LEFT JOIN employees e ON fr.employee_id = e.employee_id
       LEFT JOIN wechat_accounts a ON fr.account_id = a.id
       ${whereClause}
       ORDER BY fr.created_at DESC`,
      params
    );

    await exportFollows(res, rows as any[]);
  } catch (error) {
    next(error);
  }
});

export default router;

