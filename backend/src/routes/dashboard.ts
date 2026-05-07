import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取概览统计数据
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    // 今日新增关注
    const [todayFollows] = await pool.query(
      `SELECT COUNT(*) as count
       FROM promotion_records
       WHERE DATE(created_at) = CURDATE() AND status = 1`
    );

    // 本周转化率
    const [weekStats] = await pool.query(
      `SELECT
        COUNT(CASE WHEN status = 1 THEN 1 END) as follows,
        COUNT(*) as total
       FROM promotion_records
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );

    const weekData = (weekStats as any)[0];
    const weekConversionRate = weekData.total > 0
      ? ((weekData.follows / weekData.total) * 100).toFixed(2)
      : '0.00';

    // 未关注员工数
    const [unfollowedEmployees] = await pool.query(
      `SELECT COUNT(DISTINCT e.employee_id) as count
       FROM employees e
       WHERE e.bind_status = 1
       AND e.employee_id NOT IN (
         SELECT DISTINCT fr.employee_id
         FROM follow_records fr
         WHERE fr.event_type = 1
       )`
    );

    // 异常告警数（假设定义：最近7天没有任何推广记录的已绑定员工）
    const [alertCount] = await pool.query(
      `SELECT COUNT(DISTINCT e.employee_id) as count
       FROM employees e
       WHERE e.bind_status = 1
       AND e.employee_id NOT IN (
         SELECT DISTINCT pr.employee_id
         FROM promotion_records pr
         WHERE pr.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       )`
    );

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        todayNewFollows: (todayFollows as any)[0].count,
        weekConversionRate: parseFloat(weekConversionRate),
        unfollowedEmployees: (unfollowedEmployees as any)[0].count,
        alertCount: (alertCount as any)[0].count
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取公众号详情列表
router.get('/accounts', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, account_name, app_id, status, account_type, verified, total_followers, employee_followers, today_new_follows, month_new_follows
       FROM wechat_accounts
       WHERE status = 1
       ORDER BY created_at DESC`
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

// 获取推广排行榜 TOP 5
router.get('/ranking', async (req: AuthRequest, res, next) => {
  try {
    const { period = 'week' } = req.query;

    let dateCondition = '';
    if (period === 'week') {
      dateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else {
      dateCondition = 'created_at >= CURDATE()';
    }

    const [rows] = await pool.query(
      `SELECT
        e.employee_id,
        e.name as employee_name,
        e.department,
        COUNT(pr.id) as promotion_count,
        SUM(pr.scan_count) as total_scans,
        SUM(pr.follow_count) as total_follows
       FROM employees e
       LEFT JOIN promotion_records pr ON e.employee_id = pr.employee_id AND ${dateCondition}
       WHERE e.bind_status = 1
       GROUP BY e.employee_id, e.name, e.department
       ORDER BY total_follows DESC
       LIMIT 5`
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

// 获取员工绑定状态分布
router.get('/employee-bind-status', async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) as total_employees,
        SUM(CASE WHEN bind_status = 1 THEN 1 ELSE 0 END) as bound_employees,
        SUM(CASE WHEN bind_status = 0 THEN 1 ELSE 0 END) as unbound_employees,
        SUM(CASE WHEN bind_status = 2 THEN 1 ELSE 0 END) as disabled_employees
       FROM employees`
    );

    const stats = (rows as any)[0];

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        total: stats.total_employees,
        bound: stats.bound_employees,
        unbound: stats.unbound_employees,
        disabled: stats.disabled_employees,
        boundRate: stats.total_employees > 0
          ? ((stats.bound_employees / stats.total_employees) * 100).toFixed(2)
          : '0.00'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
