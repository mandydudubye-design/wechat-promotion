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
      SELECT pr.*, e.name as employee_name, wa.account_name 
      FROM promotion_records pr
      LEFT JOIN employees e ON pr.employee_id = e.employee_id
      LEFT JOIN wechat_accounts wa ON pr.account_id = wa.id
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
      countQuery += ' AND pr.wechat_id = ?';
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

// 导出推广记录
router.get('/export', async (req: AuthRequest, res, next) => {
  try {
    const { keyword, employeeId, accountId, startDate, endDate } = req.query;

    let query = `
      SELECT pr.*, e.name as employee_name, wa.account_name 
      FROM promotion_records pr
      LEFT JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN wechat_accounts wa ON pr.wechat_id = wa.id
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
      query += ' AND pr.wechat_id = ?';
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

// 生成推广二维码参数
router.post('/generate-qrcode', async (req: AuthRequest, res, next) => {
  try {
    const { employee_id, account_id } = req.body;

    if (!employee_id || !account_id) {
      throw new ApiError(400, '员工ID和公众号ID不能为空');
    }

    // 检查员工是否存在且已绑定
    const [employees] = await pool.query(
      'SELECT * FROM employees WHERE id = ? AND bind_status = 1',
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

    // 生成场景字符串
    const sceneStr = `promo_${employee_id}_${account_id}_${Date.now()}`;
    
    // 检查是否已存在相同的员工+公众号推广记录
    const [existing] = await pool.query(
      'SELECT * FROM promotion_records WHERE employee_id = ? AND wechat_id = ?',
      [employee_id, account_id]
    );

    if ((existing as any[]).length > 0) {
      // 更新现有记录
      await pool.query(
        'UPDATE promotion_records SET scene_str = ?, updated_at = NOW() WHERE employee_id = ? AND wechat_id = ?',
        [sceneStr, employee_id, account_id]
      );
    } else {
      // 创建新的推广记录
      await pool.query(
        'INSERT INTO promotion_records (employee_id, wechat_id, scene_str, scan_count, follow_count) VALUES (?, ?, ?, 0, 0)',
        [employee_id, account_id, sceneStr]
      );
    }

    res.json({
      code: 200,
      message: '生成成功',
      timestamp: Date.now(),
      data: {
        scene_str: sceneStr,
        employee_id,
        account_id,
        employee_name: employeeList[0].name,
        account_name: accountList[0].account_name
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取推广统计
router.get('/statistics', async (req: AuthRequest, res, next) => {
  try {
    // 总体统计
    const [totalStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT pr.employee_id) as total_employees,
        COUNT(DISTINCT pr.wechat_id) as total_accounts,
        COALESCE(SUM(pr.scan_count), 0) as total_scans,
        COALESCE(SUM(pr.follow_count), 0) as total_follows
      FROM promotion_records pr
    `);

    // 按员工统计
    const [employeeStats] = await pool.query(`
      SELECT 
        e.id,
        e.name,
        e.department,
        COALESCE(SUM(pr.scan_count), 0) as scan_count,
        COALESCE(SUM(pr.follow_count), 0) as follow_count
      FROM employees e
      LEFT JOIN promotion_records pr ON e.id = pr.employee_id
      GROUP BY e.id, e.name, e.department
      ORDER BY follow_count DESC
      LIMIT 10
    `);

    // 按公众号统计
    const [accountStats] = await pool.query(`
      SELECT 
        wa.id,
        wa.account_name,
        COALESCE(SUM(pr.scan_count), 0) as scan_count,
        COALESCE(SUM(pr.follow_count), 0) as follow_count
      FROM wechat_accounts wa
      LEFT JOIN promotion_records pr ON wa.id = pr.wechat_id
      GROUP BY wa.id, wa.account_name
      ORDER BY follow_count DESC
    `);

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        total: (totalStats as any)[0],
        employees: employeeStats,
        accounts: accountStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// 更新推广数据（内部接口）
router.post('/update-stats', async (req: AuthRequest, res, next) => {
  try {
    const { scene_str, scan_increment = 0, follow_increment = 0 } = req.body;

    if (!scene_str) {
      throw new ApiError(400, '场景字符串不能为空');
    }

    await pool.query(
      'UPDATE promotion_records SET scan_count = scan_count + ?, follow_count = follow_count + ?, updated_at = NOW() WHERE scene_str = ?',
      [scan_increment, follow_increment, scene_str]
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

export default router;