import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * 获取推广统计概览
 * GET /api/promotion-stats/overview
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // 总关注归因数
    const [totalRows] = await pool.query(
      'SELECT COUNT(*) as total FROM follow_records'
    );
    const totalFollows = (totalRows as any[])[0].total;

    // 当前已关注数
    const [subRows] = await pool.query(
      "SELECT COUNT(*) as count FROM follow_records WHERE subscribe_status = 'subscribed'"
    );
    const subscribedCount = (subRows as any[])[0].count;

    // 已取关数
    const [unsubRows] = await pool.query(
      "SELECT COUNT(*) as count FROM follow_records WHERE subscribe_status = 'unsubscribed'"
    );
    const unsubscribedCount = (unsubRows as any[])[0].count;

    // 今日新增
    const [todayRows] = await pool.query(
      'SELECT COUNT(*) as count FROM follow_records WHERE DATE(first_reply_at) = CURDATE()'
    );
    const todayNew = (todayRows as any[])[0].count;

    // 今日取关
    const [todayUnsubRows] = await pool.query(
      "SELECT COUNT(*) as count FROM follow_records WHERE DATE(last_event_at) = CURDATE() AND subscribe_status = 'unsubscribed'"
    );
    const todayUnsub = (todayUnsubRows as any[])[0].count;

    // 总扫码数
    const [scanRows] = await pool.query('SELECT COUNT(*) as total FROM scan_records');
    const totalScans = (scanRows as any[])[0].total;

    // 活跃推广员工数
    const [activeEmpRows] = await pool.query(
      'SELECT COUNT(DISTINCT employee_id) as count FROM follow_records'
    );
    const activeEmployees = (activeEmpRows as any[])[0].count;

    // 转化率（归因数 / 扫码数）
    const conversionRate = totalScans > 0 ? ((totalFollows / totalScans) * 100).toFixed(1) : '0';

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalScans,
        totalFollows,
        subscribedCount,
        unsubscribedCount,
        todayNew,
        todayUnsub,
        activeEmployees,
        conversionRate,
      },
    });
  } catch (error: any) {
    logger.error('获取推广概览失败', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message,
    });
  }
});

/**
 * 获取员工推广排行
 * GET /api/promotion-stats/employee-ranking
 * 可选参数: dateRange=today|7d|30d|90d, accountId, department
 */
router.get('/employee-ranking', async (req: Request, res: Response) => {
  try {
    const { dateRange = '30d', accountId, department } = req.query;

    // 构建时间条件
    let dateCondition = '1=1';
    if (dateRange === 'today') {
      dateCondition = 'DATE(fr.first_reply_at) = CURDATE()';
    } else if (dateRange === '7d') {
      dateCondition = 'fr.first_reply_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (dateRange === '30d') {
      dateCondition = 'fr.first_reply_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    } else if (dateRange === '90d') {
      dateCondition = 'fr.first_reply_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
    }

    // 构建扫码时间条件
    let scanDateCondition = '1=1';
    if (dateRange === 'today') {
      scanDateCondition = 'DATE(sr.scan_time) = CURDATE()';
    } else if (dateRange === '7d') {
      scanDateCondition = 'sr.scan_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (dateRange === '30d') {
      scanDateCondition = 'sr.scan_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    } else if (dateRange === '90d') {
      scanDateCondition = 'sr.scan_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
    }

    const params: any[] = [];

    // 查询员工推广统计
    let accountJoin = '';
    if (accountId) {
      accountJoin = 'INNER JOIN scan_records sr2 ON sr2.employee_id = e.employee_id AND sr2.account_id = ?';
      params.push(accountId);
    }

    const query = `
      SELECT
        e.employee_id,
        e.name AS employee_name,
        e.department,
        COUNT(DISTINCT fr.id) AS new_follows,
        COUNT(DISTINCT CASE WHEN fr.subscribe_status = 'subscribed' THEN fr.id END) AS subscribed_count,
        COUNT(DISTINCT CASE WHEN fr.subscribe_status = 'unsubscribed' THEN fr.id END) AS unsubscribed_count,
        COALESCE(scan_data.scan_count, 0) AS scans
      FROM employees e
      LEFT JOIN follow_records fr ON e.employee_id = fr.employee_id AND ${dateCondition}
      LEFT JOIN (
        SELECT employee_id, COUNT(*) AS scan_count
        FROM scan_records
        WHERE ${scanDateCondition}
        GROUP BY employee_id
      ) scan_data ON e.employee_id = scan_data.employee_id
      WHERE e.status = 1
      ${department ? 'AND e.department = ?' : ''}
      GROUP BY e.employee_id, e.name, e.department, scan_data.scan_count
      ORDER BY new_follows DESC
      LIMIT 50
    `;

    if (department) params.push(department);

    const [rows] = await pool.query(query, params);

    const ranking = (rows as any[]).map((row) => ({
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      department: row.department,
      scans: Number(row.scans),
      newFollows: Number(row.new_follows),
      subscribedCount: Number(row.subscribed_count),
      unsubscribedCount: Number(row.unsubscribed_count),
      netFollows: Number(row.subscribed_count) - Number(row.unsubscribed_count),
      conversionRate: Number(row.scans) > 0
        ? ((Number(row.new_follows) / Number(row.scans)) * 100).toFixed(1)
        : '0',
    }));

    res.json({
      code: 200,
      message: '获取成功',
      data: ranking,
    });
  } catch (error: any) {
    logger.error('获取员工排行失败', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message,
    });
  }
});

/**
 * 获取每日关注趋势
 * GET /api/promotion-stats/daily-trend
 * 可选参数: days=30
 */
router.get('/daily-trend', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const [rows] = await pool.query(
      `SELECT
        DATE(first_reply_at) AS date,
        COUNT(*) AS new_follows,
        COUNT(DISTINCT employee_id) AS active_promoters
       FROM follow_records
       WHERE first_reply_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(first_reply_at)
       ORDER BY date ASC`,
      [days]
    );

    // 同时获取每日取关数
    const [unsubRows] = await pool.query(
      `SELECT
        DATE(last_event_at) AS date,
        COUNT(*) AS unfollows
       FROM follow_records
       WHERE subscribe_status = 'unsubscribed'
         AND last_event_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(last_event_at)
       ORDER BY date ASC`,
      [days]
    );

    const unsubMap = new Map(
      (unsubRows as any[]).map((r: any) => [r.date.toISOString().split('T')[0], Number(r.unfollows)])
    );

    const trend = (rows as any[]).map((row) => {
      const dateStr = row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date);
      return {
        date: dateStr,
        newFollows: Number(row.new_follows),
        unfollows: unsubMap.get(dateStr) || 0,
        netFollows: Number(row.new_follows) - (unsubMap.get(dateStr) || 0),
        activePromoters: Number(row.active_promoters),
      };
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: trend,
    });
  } catch (error: any) {
    logger.error('获取每日趋势失败', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message,
    });
  }
});

/**
 * 获取部门推广统计
 * GET /api/promotion-stats/department
 */
router.get('/department', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        e.department,
        COUNT(DISTINCT e.employee_id) AS employee_count,
        COUNT(DISTINCT fr.id) AS total_follows,
        COUNT(DISTINCT CASE WHEN fr.subscribe_status = 'subscribed' THEN fr.id END) AS subscribed_count,
        COUNT(DISTINCT CASE WHEN fr.subscribe_status = 'unsubscribed' THEN fr.id END) AS unsubscribed_count
       FROM employees e
       LEFT JOIN follow_records fr ON e.employee_id = fr.employee_id
       WHERE e.status = 1 AND e.department IS NOT NULL AND e.department != ''
       GROUP BY e.department
       ORDER BY total_follows DESC`
    );

    const departments = (rows as any[]).map((row) => ({
      department: row.department,
      employeeCount: Number(row.employee_count),
      totalFollows: Number(row.total_follows),
      subscribedCount: Number(row.subscribed_count),
      unsubscribedCount: Number(row.unsubscribed_count),
      netFollows: Number(row.subscribed_count) - Number(row.unsubscribed_count),
      conversionRate: Number(row.total_follows) > 0
        ? ((Number(row.subscribed_count) / Number(row.total_follows)) * 100).toFixed(1)
        : '0',
    }));

    res.json({
      code: 200,
      message: '获取成功',
      data: departments,
    });
  } catch (error: any) {
    logger.error('获取部门统计失败', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message,
    });
  }
});

export default router;
