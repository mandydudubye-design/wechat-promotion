import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { exportStats } from '../utils/export';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取概览统计数据
router.get('/overview', async (req: AuthRequest, res, next) => {
  try {
    // 员工统计
    const [employeeStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN bind_status = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN bind_status = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN bind_status = 2 THEN 1 ELSE 0 END) as disabled
       FROM employees`
    );

    // 公众号统计
    const [accountStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive
       FROM wechat_accounts`
    );

    // 推广统计
    const [promotionStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_records,
        SUM(scan_count) as total_scans,
        SUM(follow_count) as total_follows,
        COUNT(DISTINCT employee_id) as active_employees
       FROM promotion_records`
    );

    // 关注统计
    const [followStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_follows,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as current_follows,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unfollows
       FROM follow_records`
    );

    // 今日数据
    const [todayStats] = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM follow_records WHERE DATE(created_at) = CURDATE()) as today_follows,
        (SELECT COUNT(*) FROM promotion_records WHERE DATE(created_at) = CURDATE()) as today_promotions,
        (SELECT SUM(scan_count) FROM promotion_records WHERE DATE(updated_at) = CURDATE()) as today_scans`
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        employees: (employeeStats as any)[0],
        accounts: (accountStats as any)[0],
        promotions: (promotionStats as any)[0],
        follows: (followStats as any)[0],
        today: (todayStats as any)[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取员工排行榜
router.get('/ranking/employees', async (req: AuthRequest, res, next) => {
  try {
    const { 
      type = 'follow', // follow(关注数), scan(扫码数), promotion(推广数)
      period = 'all', // all(全部), today(今天), week(本周), month(本月)
      limit = 20 
    } = req.query;

    let dateFilter = '';
    if (period === 'today') {
      dateFilter = 'AND DATE(fr.created_at) = CURDATE()';
    } else if (period === 'week') {
      dateFilter = 'AND YEARWEEK(fr.created_at, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (period === 'month') {
      dateFilter = 'AND YEAR(fr.created_at) = YEAR(CURDATE()) AND MONTH(fr.created_at) = MONTH(CURDATE())';
    }

    let orderBy = '';
    if (type === 'follow') {
      orderBy = 'follow_count DESC';
    } else if (type === 'scan') {
      orderBy = 'scan_count DESC';
    } else {
      orderBy = 'promotion_count DESC';
    }

    const [rows] = await pool.query(
      `SELECT 
        e.employee_id,
        e.name as employee_name,
        e.department,
        e.position,
        COUNT(DISTINCT fr.id) as follow_count,
        SUM(pr.scan_count) as scan_count,
        COUNT(DISTINCT pr.id) as promotion_count
       FROM employees e
       LEFT JOIN follow_records fr ON e.employee_id = fr.employee_id ${dateFilter}
       LEFT JOIN promotion_records pr ON e.employee_id = pr.employee_id
       WHERE e.bind_status = 1
       GROUP BY e.employee_id, e.name, e.department, e.position
       HAVING ${type === 'follow' ? 'follow_count' : type === 'scan' ? 'scan_count' : 'promotion_count'} > 0
       ORDER BY ${orderBy}
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

// 获取公众号排行榜
router.get('/ranking/accounts', async (req: AuthRequest, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const [rows] = await pool.query(
      `SELECT 
        a.id,
        a.account_name,
        a.avatar,
        COUNT(DISTINCT fr.id) as total_follows,
        SUM(CASE WHEN fr.status = 1 THEN 1 ELSE 0 END) as current_follows,
        COUNT(DISTINCT pr.id) as total_promotions,
        SUM(pr.scan_count) as total_scans
       FROM wechat_accounts a
       LEFT JOIN follow_records fr ON a.id = fr.account_id
       LEFT JOIN promotion_records pr ON a.id = pr.account_id
       WHERE a.status = 1
       GROUP BY a.id, a.account_name, a.avatar
       ORDER BY current_follows DESC
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

// 获取趋势数据
router.get('/trend', async (req: AuthRequest, res, next) => {
  try {
    const { 
      type = 'follow', // follow(关注), scan(扫码), promotion(推广)
      period = 'week' // week(最近7天), month(最近30天), quarter(最近90天)
    } = req.query;

    let days = 7;
    if (period === 'month') days = 30;
    if (period === 'quarter') days = 90;

    const [rows] = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        ${type === 'follow' ? 'COUNT(*)' : type === 'scan' ? 'SUM(scan_count)' : 'COUNT(*)'} as count
       FROM ${type === 'follow' ? 'follow_records' : type === 'scan' ? 'promotion_records' : 'promotion_records'}
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        type,
        period,
        data: rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取员工详细统计
router.get('/employee/:employeeId', async (req: AuthRequest, res, next) => {
  try {
    const { employeeId } = req.params;

    // 员工基本信息
    const [employeeInfo] = await pool.query(
      'SELECT * FROM employees WHERE employee_id = ?',
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

    // 推广统计
    const [promotionStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_promotions,
        SUM(scan_count) as total_scans,
        SUM(follow_count) as total_follows
       FROM promotion_records
       WHERE employee_id = ?`,
      [employeeId]
    );

    // 关注统计
    const [followStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_follows,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as current_follows,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unfollows
       FROM follow_records
       WHERE employee_id = ?`,
      [employeeId]
    );

    // 最近7天趋势
    const [recentTrend] = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM follow_records
       WHERE employee_id = ? 
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [employeeId]
    );

    // 推广记录列表
    const [promotionList] = await pool.query(
      `SELECT pr.*, a.account_name
       FROM promotion_records pr
       LEFT JOIN wechat_accounts a ON pr.account_id = a.id
       WHERE pr.employee_id = ?
       ORDER BY pr.created_at DESC
       LIMIT 10`,
      [employeeId]
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        employee: (employees as any)[0],
        promotion_stats: (promotionStats as any)[0],
        follow_stats: (followStats as any)[0],
        recent_trend: recentTrend,
        promotion_list: promotionList
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取公众号详细统计
router.get('/account/:accountId', async (req: AuthRequest, res, next) => {
  try {
    const { accountId } = req.params;

    // 公众号基本信息
    const [accountInfo] = await pool.query(
      'SELECT * FROM wechat_accounts WHERE id = ?',
      [accountId]
    );

    const accounts = accountInfo as any[];
    if (accounts.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '公众号不存在',
        timestamp: Date.now()
      });
    }

    // 推广统计
    const [promotionStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_promotions,
        COUNT(DISTINCT employee_id) as active_employees,
        SUM(scan_count) as total_scans,
        SUM(follow_count) as total_follows
       FROM promotion_records
       WHERE account_id = ?`,
      [accountId]
    );

    // 关注统计
    const [followStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_follows,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as current_follows,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unfollows
       FROM follow_records
       WHERE account_id = ?`,
      [accountId]
    );

    // 员工排行
    const [employeeRanking] = await pool.query(
      `SELECT 
        e.employee_id,
        e.name as employee_name,
        COUNT(DISTINCT fr.id) as follow_count
       FROM follow_records fr
       LEFT JOIN employees e ON fr.employee_id = e.employee_id
       WHERE fr.account_id = ?
       GROUP BY e.employee_id, e.name
       ORDER BY follow_count DESC
       LIMIT 10`,
      [accountId]
    );

    // 最近7天趋势
    const [recentTrend] = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM follow_records
       WHERE account_id = ? 
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [accountId]
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        account: (accounts as any)[0],
        promotion_stats: (promotionStats as any)[0],
        follow_stats: (followStats as any)[0],
        employee_ranking: employeeRanking,
        recent_trend: recentTrend
      }
    });
  } catch (error) {
    next(error);
  }
});

// 导出统计数据
router.get('/export', async (req: AuthRequest, res, next) => {
  try {
    // 获取概览数据
    const [employeeStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN bind_status = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN bind_status = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN bind_status = 2 THEN 1 ELSE 0 END) as disabled
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
        SUM(scan_count) as total_scans,
        SUM(follow_count) as total_follows,
        COUNT(DISTINCT employee_id) as active_employees
       FROM promotion_records`
    );

    const [followStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_follows,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as current_follows,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unfollows
       FROM follow_records`
    );

    const overview = {
      employees: (employeeStats as any)[0],
      accounts: (accountStats as any)[0],
      promotions: (promotionStats as any)[0],
      follows: (followStats as any)[0]
    };

    // 获取员工排行
    const [employeeRanking] = await pool.query(
      `SELECT 
        e.employee_id,
        e.name as employee_name,
        e.department,
        e.position,
        COUNT(DISTINCT fr.id) as follow_count,
        SUM(pr.scan_count) as scan_count,
        COUNT(DISTINCT pr.id) as promotion_count
       FROM employees e
       LEFT JOIN follow_records fr ON e.employee_id = fr.employee_id
       LEFT JOIN promotion_records pr ON e.employee_id = pr.employee_id
       WHERE e.bind_status = 1
       GROUP BY e.employee_id, e.name, e.department, e.position
       HAVING follow_count > 0
       ORDER BY follow_count DESC
       LIMIT 20`
    );

    // 获取公众号统计
    const [accountStatsData] = await pool.query(
      `SELECT 
        a.id,
        a.account_name,
        COUNT(DISTINCT fr.id) as total_follows,
        SUM(CASE WHEN fr.status = 1 THEN 1 ELSE 0 END) as current_follows,
        COUNT(DISTINCT pr.id) as total_promotions,
        SUM(pr.scan_count) as total_scans
       FROM wechat_accounts a
       LEFT JOIN follow_records fr ON a.id = fr.account_id
       LEFT JOIN promotion_records pr ON a.id = pr.account_id
       WHERE a.status = 1
       GROUP BY a.id, a.account_name
       ORDER BY current_follows DESC`
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

