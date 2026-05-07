import { Router, Request, Response } from 'express';
import {
  generateEmployeePromotionCode,
  getPromotionConfig,
  PromotionMode,
} from '../services/promotionService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * 智能生成员工推广码
 * 根据公众号类型自动选择推广模式：
 * - 服务号/已认证订阅号 → 二维码模式（生成个性化二维码）
 * - 未认证订阅号 → 验证码模式（生成验证码）
 *
 * POST /api/promotion/employee-code
 */
router.post('/employee-code', async (req: Request, res: Response) => {
  try {
    const { employeeId, employeeName, accountId } = req.body;

    if (!employeeId || !accountId) {
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

    // 返回结果
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
 * 获取公众号的推广配置信息
 * GET /api/promotion/config/:accountId
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

/**
 * 验证验证码（用于未认证订阅号）
 * POST /api/promotion/verify-code
 */
router.post('/verify-code', async (req: Request, res: Response) => {
  try {
    const { openid, verificationCode } = req.body;

    if (!openid || !verificationCode) {
      return res.status(400).json({
        code: 400,
        message: '缺少openid或验证码',
        timestamp: Date.now(),
      });
    }

    // 查找匹配的员工
    const [employees] = await req.app.locals.pool.query(
      'SELECT employee_id, name FROM employees WHERE verification_code = ? AND status = 1',
      [verificationCode]
    );

    if ((employees as any[]).length === 0) {
      return res.status(400).json({
        code: 400,
        message: '验证码错误',
        timestamp: Date.now(),
      });
    }

    const employee = (employees as any[])[0];

    // 创建绑定关系
    await req.app.locals.pool.query(
      `INSERT INTO employee_bindings (employee_id, openid, is_verified, verification_method, verified_at)
       VALUES (?, ?, TRUE, 'verification_code', NOW())
       ON DUPLICATE KEY UPDATE
       employee_id = VALUES(employee_id),
       is_verified = TRUE,
       verification_method = 'verification_code',
       verified_at = NOW()`,
      [employee.employee_id, openid]
    );

    logger.info('验证码验证成功', {
      employeeId: employee.employee_id,
      openid,
      verificationCode,
    });

    res.json({
      code: 200,
      message: '验证成功',
      timestamp: Date.now(),
      data: {
        employeeId: employee.employee_id,
        employeeName: employee.name,
      },
    });
  } catch (error: any) {
    logger.error('验证验证码失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '验证失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

export default router;
