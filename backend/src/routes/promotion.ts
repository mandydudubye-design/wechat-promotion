import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { exportPromotions } from '../utils/export';
import crypto from 'crypto';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取推广记录列表
router.get('/records', async (req: AuthRequest, res, next) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      keyword, 
      employeeId,
      accountId,
      startDate,
      endDate 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(pageSize);

    let query = `
      SELECT pr.*, e.name as employee_name, a.account_name 
      FROM promotion_records pr
      LEFT JOIN employees e ON pr.employee_id = e.employee_id
      LEFT JOIN wechat_accounts a ON pr.account_id = a.id
      WHERE 1=1
    `;
    let params: any[] = [];

    if (keyword) {
      query += ' AND (e.name LIKE ? OR pr.scene_str LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (employeeId) {
      query += ' AND pr.employee_id = ?';
      params.push(employeeId);
    }

    if (accountId) {
      query += ' AND pr.account_id = ?';
      params.push(accountId);
    }

    if (startDate) {
      query += ' AND pr.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND pr.created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), offset);

    const [rows] = await pool.query(query, params);

    // 获取总数
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM promotion_records pr
      LEFT JOIN employees e ON pr.employee_id = e.employee_id
      WHERE 1=1
    `;
    let countParams: any[] = [];

    if (keyword) {
      countQuery += ' AND (e.name LIKE ? OR pr.scene_str LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (employeeId) {
      countQuery += ' AND pr.employee_id = ?';
      countParams.push(employeeId);
    }

    if (accountId) {
      countQuery += ' AND pr.account_id = ?';
      countParams.push(accountId);
    }

    if (startDate) {
      countQuery += ' AND pr.created_at >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND pr.created_at <= ?';
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

// 创建推广记录（生成推广二维码）
router.post('/create', async (req: AuthRequest, res, next) => {
  try {
    const { employee_id, account_id, description } = req.body;

    if (!employee_id || !account_id) {
      throw new ApiError(400, '员工ID和公众号ID不能为空');
    }

    // 检查员工是否存在且已绑定
    const [employees] = await pool.query(
      'SELECT * FROM employees WHERE employee_id = ? AND bind_status = 1',
      [employee_id]
    );

    const employeeList = employees as any[];
    if (employeeList.length === 0) {
      throw new ApiError(400, '员工不存在或未绑定');
    }

    // 检查公众号是否存在且已启用
    const [accounts] = await pool.query(
      'SELECT * FROM wechat_accounts WHERE id = ? AND status = 1',
      [account_id]
    );

    const accountList = accounts as any[];
    if (accountList.length === 0) {
      throw new ApiError(400, '公众号不存在或未启用');
    }

    // 生成场景值（唯一标识）
    const scene_str = `emp_${employee_id}_${Date.now()}`;
    const scene_id = crypto.randomBytes(4).readUInt32BE(0) % 1000000;

    // 创建推广记录
    const [result] = await pool.query(
      'INSERT INTO promotion_records (employee_id, account_id, scene_str, scene_id, description) VALUES (?, ?, ?, ?, ?)',
      [employee_id, account_id, scene_str, scene_id, description]
    );

    const insertId = (result as any).insertId;

    // TODO: 调用微信API生成带参数二维码
    // 这里暂时返回模拟数据
    const qrCodeUrl = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN`;

    res.json({
      code: 200,
      message: '创建成功',
      timestamp: Date.now(),
      data: {
        id: insertId,
        employee_id,
        account_id,
        scene_str,
        scene_id,
        qr_code_url: qrCodeUrl,
        // 生成二维码图片URL（实际应该调用微信API）
        qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${scene_str}`,
        scan_count: 0,
        follow_count: 0,
        created_at: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取推广详情
router.get('/records/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT pr.*, e.name as employee_name, a.account_name 
       FROM promotion_records pr
       LEFT JOIN employees e ON pr.employee_id = e.employee_id
       LEFT JOIN wechat_accounts a ON pr.account_id = a.id
       WHERE pr.id = ?`,
      [id]
    );

    const records = rows as any[];
    if (records.length === 0) {
      throw new ApiError(404, '推广记录不存在');
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

// 更新推广数据（扫码数、关注数）
router.put('/records/:id/stats', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { scan_count, follow_count } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (scan_count !== undefined) {
      updates.push('scan_count = ?');
      params.push(scan_count);
    }

    if (follow_count !== undefined) {
      updates.push('follow_count = ?');
      params.push(follow_count);
    }

    if (updates.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.query(
      `UPDATE promotion_records SET ${updates.join(', ')} WHERE id = ?`,
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

// 删除推广记录
router.delete('/records/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM promotion_records WHERE id = ?', [id]);

    res.json({
      code: 200,
      message: '删除成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// 获取推广统计数据
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
        COUNT(*) as total_records,
        SUM(scan_count) as total_scans,
        SUM(follow_count) as total_follows,
        AVG(scan_count) as avg_scans,
        AVG(follow_count) as avg_follows
       FROM promotion_records ${whereClause}`,
      params
    );

    // 员工排行
    const [employeeRanking] = await pool.query(
      `SELECT 
        e.employee_id,
        e.name as employee_name,
        COUNT(*) as record_count,
        SUM(pr.scan_count) as total_scans,
        SUM(pr.follow_count) as total_follows
       FROM promotion_records pr
       LEFT JOIN employees e ON pr.employee_id = e.employee_id
       ${whereClause}
       GROUP BY e.employee_id, e.name
       ORDER BY total_follows DESC
       LIMIT 10`,
      params
    );

    // 公众号统计
    const [accountStats] = await pool.query(
      `SELECT 
        a.id,
        a.account_name,
        COUNT(*) as record_count,
        SUM(pr.scan_count) as total_scans,
        SUM(pr.follow_count) as total_follows
       FROM promotion_records pr
       LEFT JOIN wechat_accounts a ON pr.account_id = a.id
       ${whereClause}
       GROUP BY a.id, a.account_name
       ORDER BY total_follows DESC`,
      params
    );

    // 时间趋势（每日统计）
    const [timeTrend] = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as record_count,
        SUM(scan_count) as total_scans,
        SUM(follow_count) as total_follows
       FROM promotion_records ${whereClause}
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

// 导出推广数据
router.get('/export', async (req: AuthRequest, res, next) => {
  try {
    const { keyword, employeeId, accountId, startDate, endDate } = req.query;

    let query = `
      SELECT pr.*, e.name as employee_name, a.account_name 
      FROM promotion_records pr
      LEFT JOIN employees e ON pr.employee_id = e.employee_id
      LEFT JOIN wechat_accounts a ON pr.account_id = a.id
      WHERE 1=1
    `;
    let params: any[] = [];

    if (keyword) {
      query += ' AND (e.name LIKE ? OR pr.scene_str LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (employeeId) {
      query += ' AND pr.employee_id = ?';
      params.push(employeeId);
    }

    if (accountId) {
      query += ' AND pr.account_id = ?';
      params.push(accountId);
    }

    if (startDate) {
      query += ' AND pr.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND pr.created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY pr.created_at DESC';

    const [rows] = await pool.query(query, params);

    await exportPromotions(res, rows as any[]);
  } catch (error) {
    next(error);
  }
});

export default router;

