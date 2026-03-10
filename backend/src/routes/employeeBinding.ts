import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import smsService from '../services/smsService';

const router = Router();

// 绑定员工身份（通过手机号验证）
router.post('/bind', async (req: Request, res: Response) => {
  try {
    const { employee_id, phone, openid, nickname, avatar } = req.body;

    // 1. 验证员工是否存在
    const [employees] = await pool.query(
      'SELECT employee_id, name, phone FROM employees WHERE employee_id = ? AND status = 1',
      [employee_id]
    );

    const employee = (employees as any[])[0];
    if (!employee) {
      return res.status(404).json({
        code: 404,
        message: '员工不存在或已离职',
        timestamp: Date.now(),
      });
    }

    // 2. 验证手机号是否匹配
    if (employee.phone !== phone) {
      // 记录验证失败日志
      await pool.query(
        'INSERT INTO employee_verification_logs (employee_id, openid, verification_method, verification_data, is_success, failure_reason) VALUES (?, ?, ?, ?, FALSE, ?)',
        [employee_id, openid, 'phone', phone, '手机号不匹配']
      );

      return res.status(400).json({
        code: 400,
        message: '手机号与员工信息不匹配',
        timestamp: Date.now(),
      });
    }

    // 3. 检查是否已经绑定过
    const [existing] = await pool.query(
      'SELECT id, is_verified FROM employee_bindings WHERE openid = ?',
      [openid]
    );

    if ((existing as any[]).length > 0) {
      const binding = (existing as any[])[0];
      if (binding.is_verified) {
        return res.status(400).json({
          code: 400,
          message: '该微信已绑定员工身份',
          timestamp: Date.now(),
          data: { employee_id: binding.employee_id },
        });
      }
    }

    // 4. 创建或更新绑定关系
    await pool.query(
      `INSERT INTO employee_bindings (employee_id, openid, is_verified, verification_method, verified_at)
       VALUES (?, ?, TRUE, 'phone', NOW())
       ON DUPLICATE KEY UPDATE
       employee_id = VALUES(employee_id),
       is_verified = TRUE,
       verification_method = 'phone',
       verified_at = NOW()`,
      [employee_id, openid]
    );

    // 5. 记录验证成功日志
    await pool.query(
      'INSERT INTO employee_verification_logs (employee_id, openid, verification_method, verification_data, is_success) VALUES (?, ?, ?, ?, TRUE)',
      [employee_id, openid, 'phone', phone]
    );

    // 6. 更新关注记录中的员工身份（如果有）
    await pool.query(
      'UPDATE follow_records SET is_employee = TRUE WHERE openid = ?',
      [openid]
    );

    logger.info('员工身份绑定成功', { employee_id, openid, nickname });

    res.json({
      code: 200,
      message: '员工身份绑定成功',
      timestamp: Date.now(),
      data: {
        employee_id,
        name: employee.name,
        is_verified: true,
      },
    });
  } catch (error: any) {
    logger.error('员工身份绑定失败', { error: error.message, reqBody: req.body });
    res.status(500).json({
      code: 500,
      message: '员工身份绑定失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

// 发送验证码（需要集成短信服务）
router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    // 1. 检查手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '手机号格式不正确',
        timestamp: Date.now(),
      });
    }

    // 2. 检查手机号是否属于员工
    const [employees] = await pool.query(
      'SELECT employee_id, name FROM employees WHERE phone = ? AND status = 1',
      [phone]
    );

    if ((employees as any[]).length === 0) {
      return res.status(404).json({
        code: 404,
        message: '该手机号未注册为员工',
        timestamp: Date.now(),
      });
    }

    // 3. 检查是否已经发送过验证码（防止频繁发送）
    const [recentCodes] = await pool.query(
      'SELECT * FROM verification_codes WHERE phone = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND) ORDER BY created_at DESC LIMIT 1',
      [phone]
    );

    if ((recentCodes as any[]).length > 0) {
      return res.status(429).json({
        code: 429,
        message: '验证码发送过于频繁，请60秒后重试',
        timestamp: Date.now(),
      });
    }

    // 4. 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. 存储验证码（5分钟有效）
    await pool.query(
      'INSERT INTO verification_codes (phone, code, expired_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
      [phone, code]
    );

    // 6. 发送短信
    const sent = await smsService.sendCode(phone, code);
    
    if (!sent) {
      logger.error('短信发送失败', { phone, code });
      return res.status(500).json({
        code: 500,
        message: '发送验证码失败，请稍后重试',
        timestamp: Date.now(),
      });
    }

    logger.info('验证码发送成功', { phone, employee_id: (employees as any[])[0].employee_id });

    // 7. 返回成功
    res.json({
      code: 200,
      message: '验证码已发送',
      timestamp: Date.now(),
      data: {
        expired_in: 300, // 5分钟
      },
    });
  } catch (error: any) {
    logger.error('发送验证码失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '发送验证码失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

// 验证码验证
router.post('/verify-code', async (req: Request, res: Response) => {
  try {
    const { phone, code, openid } = req.body;

    // 1. 验证验证码
    const [codes] = await pool.query(
      'SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND expired_at > NOW() AND is_used = FALSE ORDER BY created_at DESC LIMIT 1',
      [phone, code]
    );

    if ((codes as any[]).length === 0) {
      return res.status(400).json({
        code: 400,
        message: '验证码错误或已过期',
        timestamp: Date.now(),
      });
    }

    // 2. 标记验证码已使用
    await pool.query(
      'UPDATE verification_codes SET is_used = TRUE, used_at = NOW() WHERE id = ?',
      [(codes as any)[0].id]
    );

    // 3. 查找对应的员工
    const [employees] = await pool.query(
      'SELECT employee_id, name FROM employees WHERE phone = ? AND status = 1',
      [phone]
    );

    const employee = (employees as any[])[0];

    // 4. 创建绑定关系
    await pool.query(
      `INSERT INTO employee_bindings (employee_id, openid, is_verified, verification_method, verified_at)
       VALUES (?, ?, TRUE, 'sms', NOW())
       ON DUPLICATE KEY UPDATE
       employee_id = VALUES(employee_id),
       is_verified = TRUE,
       verification_method = 'sms',
       verified_at = NOW()`,
      [employee.employee_id, openid]
    );

    // 5. 记录验证日志
    await pool.query(
      'INSERT INTO employee_verification_logs (employee_id, openid, verification_method, verification_data, is_success) VALUES (?, ?, ?, ?, TRUE)',
      [employee.employee_id, openid, 'sms', phone]
    );

    logger.info('验证码验证成功', { employee_id: employee.employee_id, openid });

    res.json({
      code: 200,
      message: '验证成功',
      timestamp: Date.now(),
      data: {
        employee_id: employee.employee_id,
        name: employee.name,
        is_verified: true,
      },
    });
  } catch (error: any) {
    logger.error('验证码验证失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '验证失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

// 获取员工绑定状态
router.get('/status/:openid', async (req: Request, res: Response) => {
  try {
    const { openid } = req.params;

    const [bindings] = await pool.query(
      `SELECT eb.*, e.name, e.department, e.phone, e.status
       FROM employee_bindings eb
       LEFT JOIN employees e ON eb.employee_id = e.employee_id
       WHERE eb.openid = ?`,
      [openid]
    );

    if ((bindings as any[]).length === 0) {
      return res.json({
        code: 200,
        message: '未绑定',
        timestamp: Date.now(),
        data: {
          is_bound: false,
          is_verified: false,
        },
      });
    }

    const binding = (bindings as any[])[0];

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: {
        is_bound: true,
        is_verified: binding.is_verified,
        employee: binding.is_verified ? {
          employee_id: binding.employee_id,
          name: binding.name,
          department: binding.department,
        } : null,
      },
    });
  } catch (error: any) {
    logger.error('获取绑定状态失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '获取绑定状态失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

// 解除绑定
router.delete('/unbind', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { openid } = req.body;

    await pool.query('DELETE FROM employee_bindings WHERE openid = ?', [openid]);

    logger.info('解除员工绑定', { openid });

    res.json({
      code: 200,
      message: '解除绑定成功',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error('解除绑定失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '解除绑定失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

// 管理员手动绑定员工
router.post('/admin/bind', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employee_id, openid, admin_note } = req.body;

    // 1. 验证员工是否存在
    const [employees] = await pool.query(
      'SELECT employee_id, name FROM employees WHERE employee_id = ? AND status = 1',
      [employee_id]
    );

    if ((employees as any[]).length === 0) {
      return res.status(404).json({
        code: 404,
        message: '员工不存在',
        timestamp: Date.now(),
      });
    }

    // 2. 创建绑定关系
    await pool.query(
      `INSERT INTO employee_bindings (employee_id, openid, is_verified, verification_method, verified_at)
       VALUES (?, ?, TRUE, 'manual', NOW())
       ON DUPLICATE KEY UPDATE
       employee_id = VALUES(employee_id),
       is_verified = TRUE,
       verification_method = 'manual',
       verified_at = NOW()`,
      [employee_id, openid]
    );

    // 3. 记录日志
    logger.info('管理员手动绑定员工', { employee_id, openid, admin_note });

    res.json({
      code: 200,
      message: '绑定成功',
      timestamp: Date.now(),
      data: {
        employee_id,
        name: (employees as any[])[0].name,
      },
    });
  } catch (error: any) {
    logger.error('管理员绑定失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '绑定失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

export default router;
