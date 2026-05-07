import { Router, Request, Response } from 'express';
import {
  generateEmployeePromotionCode,
  getPromotionConfig,
  PromotionMode,
} from '../services/promotionService';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * 智能生成员工推广码（H5落地页模式）
 * 统一使用 H5 落地页，不依赖微信 API
 *
 * POST /api/smart-promotion/employee-code
 */
router.post('/employee-code', async (req: Request, res: Response) => {
  try {
    const { employeeId, employeeName } = req.body;
    const accountId = parseInt(req.body.accountId, 10);

    if (!employeeId || !accountId || isNaN(accountId)) {
      return res.status(400).json({
        code: 400,
        message: '缺少员工ID或公众号ID',
        timestamp: Date.now(),
      });
    }

    // 生成推广码
    const result = await generateEmployeePromotionCode(
      employeeId,
      employeeName || '员工',
      accountId
    );

    if (!result.success) {
      return res.status(400).json({
        code: 400,
        message: result.message,
        timestamp: Date.now(),
      });
    }

    logger.info('员工推广码生成成功', {
      employeeId,
      accountId,
      mode: result.mode,
    });

    res.json({
      code: 200,
      message: '生成成功',
      timestamp: Date.now(),
      data: result,
    });
  } catch (error: any) {
    logger.error('生成员工推广码失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '生成推广码失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

/**
 * 记录扫码行为
 * POST /api/smart-promotion/scan
 */
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { accountId, employeeId, scanTime } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers.referer;

    // 将 ISO 日期转为 MySQL 兼容格式
    const safeScanTime = scanTime
      ? new Date(scanTime).toISOString().replace('T', ' ').replace('Z', '').split('.')[0]
      : new Date().toISOString().replace('T', ' ').replace('Z', '').split('.')[0];

    // 获取员工和公众号信息
    const [rows] = await pool.query(
      `SELECT e.name as employee_name, w.account_name
       FROM employees e
       LEFT JOIN wechat_account_configs w ON w.id = ?
       WHERE e.employee_id = ?`,
      [accountId, employeeId]
    );
    
    logger.info('扫码请求', { employeeId, accountId, ip });

    const info = (rows as any[])[0];
    
    // 记录扫码
    await pool.query(
      `INSERT INTO scan_records (employee_id, employee_name, account_id, account_name, scan_time, ip_address, user_agent, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        info?.employee_name || null,
        accountId,
        info?.account_name || null,
        safeScanTime,
        ip?.substring(0, 50),
        userAgent,
        referrer,
      ]
    );

    // 更新 promotion_records 的扫码计数
    await pool.query(
      `UPDATE promotion_records
       SET scan_count = scan_count + 1
       WHERE employee_id = ? AND account_id = ?`,
      [employeeId, accountId]
    );

    logger.info('扫码记录成功', { employeeId, accountId, ip });

    res.json({
      code: 200,
      message: '记录成功',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error('记录扫码失败', { error: error.message, stack: error.stack });
    res.status(500).json({
      code: 500,
      message: '记录扫码失败',
      timestamp: Date.now(),
    });
  }
});

/**
 * 获取公众号的推广配置信息
 * GET /api/smart-promotion/config/:accountId
 */
router.get('/config/:accountId', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;

    const config = await getPromotionConfig(parseInt(accountId));

    if (!config) {
      return res.status(404).json({
        code: 404,
        message: '公众号不存在或已停用',
        timestamp: Date.now(),
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        ...config,
        modeLabel: config.promotionMode === PromotionMode.QR_CODE ? '二维码模式' : '验证码模式',
      },
    });
  } catch (error: any) {
    logger.error('获取推广配置失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '获取推广配置失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

export default router;
