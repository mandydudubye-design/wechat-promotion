import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { exportStats } from '../utils/export';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取推广统计数据（新版，支持时间范围）
router.get('/promotion', async (req: AuthRequest, res, next) => {
  try {
    const { 
      start_date, 
      end_date, 
      department,
      account_id 
    } = req.query;

    // 构建时间条件
    let timeCondition = '1=1';
    let timeParams: any[] = [];
    
    if (start_date && end_date) {
      timeCondition = 'fr.created_at >= ? AND fr.created_at <= ?';
      timeParams.push(String(start_date), String(end_date) + ' 23:59:59');
    } else if (start_date) {
      timeCondition = 'fr.created_at >= ?';
      timeParams.push(String(start_date));
    } else if (end_date) {
      timeCondition = 'fr.created_at <= ?';
      timeParams.push(String(end_date) + ' 23:59:59');
    }

    // 构建部门和公众号条件
    let extraCondition = '';
    let extraParams: any[] = [];
    
    if (department && department !== 'all') {
      extraCondition += ' AND e.department = ?';
      extraParams.push(String(department));
    }
    
    if (account_id && account_id !== 'all') {
      extraCondition += ' AND fr.wechat_id = ?';
      extraParams.push(Number(account_id));
    }

    const whereClause = `WHERE ${timeCondition}${extraCondition}`;
    const allParams = [...timeParams, ...extraParams];

    // 1. 汇总统计 - 根据promotion_records表
    const [summaryStats] = await pool.query(
      `SELECT 
        COALESCE(SUM(pr.scan_count), 0) as total_scans,
        COALESCE(SUM(pr.follow_count), 0) as total_follows,
        COUNT(DISTINCT pr.employee_id) as active_employees
       FROM promotion_records pr
       LEFT JOIN employees e ON pr.employee_id = e.id
       WHERE 1=1${extraCondition.replace('fr.wechat_id', 'pr.wechat_id')}`,
      extraParams
    );

    // 2. 按公众号统计
    const [accountStats] = await pool.query(
      `SELECT 
        wa.id,
        wa.account_name,
        COALESCE(SUM(pr.scan_count), 0) as scan_count,
        COALESCE(SUM(pr.follow_count), 0) as follow_count
       FROM wechat_accounts wa
       LEFT JOIN promotion_records pr ON wa.id = pr.wechat_id
       LEFT JOIN employees e ON pr.employee_id = e.id
       WHERE wa.id IS NOT NULL ${extraCondition.replace('fr.wechat_id', 'pr.wechat_id')}
       GROUP BY wa.id, wa.account_name
       ORDER BY follow_count DESC`,
      extraParams
    );

    // 3. 按员工统计
    const [employeeStats] = await pool.query(
      `SELECT 
        e.id as employee_id,
        e.name as employee_name,
        e.department,
        COALESCE(SUM(pr.scan_count), 0) as total_scan_count,
        COALESCE(SUM(pr.follow_count), 0) as total_follow_count
       FROM employees e
       LEFT JOIN promotion_records pr ON e.id = pr.employee_id
       WHERE 1=1${extraCondition ? extraCondition.replace('AND e.department', 'AND e.department') : ''}
       GROUP BY e.id, e.name, e.department
       HAVING total_scan_count > 0 OR total_follow_count > 0
       ORDER BY total_follow_count DESC`,
      extraParams.filter(p => typeof p === 'string' && !p.includes('wechat_id'))
    );

    // 4. 每个员工每个公众号的详细数据
    const [employeeAccountStats] = await pool.query(
      `SELECT 
        e.id as employee_id,
        pr.wechat_id as account_id,
        wa.account_name,
        COALESCE(SUM(pr.scan_count), 0) as scan_count,
        COALESCE(SUM(pr.follow_count), 0) as follow_count
       FROM promotion_records pr
       LEFT JOIN employees e ON pr.employee_id = e.id
       LEFT JOIN wechat_accounts wa ON pr.wechat_id = wa.id
       WHERE 1=1${extraCondition.replace('fr.wechat_id', 'pr.wechat_id')}
       GROUP BY e.id, pr.wechat_id, wa.account_name`,
      extraParams
    );

    // 5. 按部门统计
    const [departmentStats] = await pool.query(
      `SELECT 
        e.department,
        COALESCE(SUM(pr.scan_count), 0) as total_scan_count,
        COALESCE(SUM(pr.follow_count), 0) as total_follow_count,
        COUNT(DISTINCT pr.employee_id) as employee_count
       FROM promotion_records pr
       LEFT JOIN employees e ON pr.employee_id = e.id
       WHERE 1=1${extraCondition.replace('fr.wechat_id', 'pr.wechat_id')}
       GROUP BY e.department
       ORDER BY total_follow_count DESC`,
      extraParams
    );

    // 6. 趋势数据（按天）
    const [trendData] = await pool.query(
      `SELECT 
        DATE(pr.updated_at) as date,
        COALESCE(SUM(pr.scan_count), 0) as scan_count,
        COALESCE(SUM(pr.follow_count), 0) as follow_count
       FROM promotion_records pr
       LEFT JOIN employees e ON pr.employee_id = e.id
       WHERE ${timeCondition}${extraCondition.replace('fr.wechat_id', 'pr.wechat_id')}
       GROUP BY DATE(pr.updated_at)
       ORDER BY date ASC
       LIMIT 90`,
      allParams
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        summary: (summaryStats as any[])[0] || { total_scans: 0, total_follows: 0, active_employees: 0 },
        accountStats: accountStats || [],
        employeeStats: employeeStats || [],
        employeeAccountStats: employeeAccountStats || [],
        departmentStats: departmentStats || [],
        trendData: trendData || [],
        followDetails: []
      }
    });
  } catch (error) {
    console.error('推广统计错误:', error);
    next(error);
  }
});

// 获取员工推广详情
router.get('/employee/:employeeId/detail', async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;
    const { start_date, end_date } = req.query;

    let timeCondition = '1=1';
    let timeParams: any[] = [employeeId];
    
    if (start_date && end_date) {
      timeCondition = 'pr.updated_at >= ? AND pr.updated_at <= ?';
      timeParams.push(String(start_date), String(end_date) + ' 23:59:59');
    }

    const [employeeInfo] = await pool.query(
      'SELECT * FROM employees WHERE id = ?',
      [employeeId]
    );

    const employees = employeeInfo as any[];
    if (employees.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '员工不存在',
        timestamp: Date.now()
      });
    }

    const [accountStats] = await pool.query(
      `SELECT 
        wa.id as account_id,
        wa.account_name,
        COALESCE(SUM(pr.scan_count), 0) as scan_count,
        COALESCE(SUM(pr.follow_count), 0) as follow_count
       FROM promotion_records pr
       LEFT JOIN wechat_accounts wa ON pr.wechat_id = wa.id
       WHERE pr.employee_id = ? AND ${timeCondition}
       GROUP BY wa.id, wa.account_name
       ORDER BY follow_count DESC`,
      timeParams
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        employee: (employees as any[])[0],
        accountStats,
        followList: []
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取概览统计数据
router.get('/overview', async (req: AuthRequest, res, next) => {
  try {
    const [employeeStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive
       FROM employees`
    );

    const [accountStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive
       FROM wechat_accounts`
    );

    const [promotionStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_records,
        COALESCE(SUM(scan_count), 0) as total_scans,
        COALESCE(SUM(follow_count), 0) as total_follows,
        COUNT(DISTINCT employee_id) as active_employees
       FROM promotion_records`
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        employees: (employeeStats as any[])[0] || { total: 0, active: 0, inactive: 0 },
        accounts: (accountStats as any[])[0] || { total: 0, active: 0, inactive: 0 },
        promotions: (promotionStats as any[])[0] || { total_records: 0, total_scans: 0, total_follows: 0, active_employees: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取员工排行榜
router.get('/ranking/employees', async (req: AuthRequest, res, next) => {
  try {
    const { type = 'follow', limit = 20 } = req.query;

    const [rows] = await pool.query(
      `SELECT 
        e.id as employee_id,
        e.name as employee_name,
        e.department,
        e.position,
        COALESCE(SUM(pr.follow_count), 0) as follow_count,
        COALESCE(SUM(pr.scan_count), 0) as scan_count,
        COUNT(DISTINCT pr.id) as promotion_count
       FROM employees e
       LEFT JOIN promotion_records pr ON e.id = pr.employee_id
       WHERE e.status = 1
       GROUP BY e.id, e.name, e.department, e.position
       HAVING ${type === 'follow' ? 'follow_count' : type === 'scan' ? 'scan_count' : 'promotion_count'} > 0
       ORDER BY ${type === 'follow' ? 'follow_count' : type === 'scan' ? 'scan_count' : 'promotion_count'} DESC
       LIMIT ?`,
      [Number(limit)]
    );

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

// 导出统计数据
router.get('/export', async (req: AuthRequest, res, next) => {
  try {
    const [employeeStats] = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active FROM employees'
    );

    const [accountStats] = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active FROM wechat_accounts'
    );

    const overview = {
      employees: (employeeStats as any[])[0],
      accounts: (accountStats as any)[0]
    };

    const [employeeRanking] = await pool.query(
      `SELECT 
        e.id as employee_id,
        e.name as employee_name,
        e.department,
        e.position,
        COALESCE(SUM(pr.follow_count), 0) as follow_count,
        COALESCE(SUM(pr.scan_count), 0) as scan_count
       FROM employees e
       LEFT JOIN promotion_records pr ON e.id = pr.employee_id
       GROUP BY e.id, e.name, e.department, e.position
       ORDER BY follow_count DESC
       LIMIT 20`
    );

    const [accountStatsData] = await pool.query(
      `SELECT 
        wa.account_name,
        COALESCE(SUM(pr.follow_count), 0) as total_follows,
        COALESCE(SUM(pr.scan_count), 0) as total_scans
       FROM wechat_accounts wa
       LEFT JOIN promotion_records pr ON wa.id = pr.wechat_id
       GROUP BY wa.id, wa.account_name
       ORDER BY total_follows DESC`
    );

    await exportStats(res, { 
      overview, 
      employeeRanking: employeeRanking as any[], 
      accountStats: accountStatsData as any[] 
    });
  } catch (error) {
    next(error);
  }
});

export default router;