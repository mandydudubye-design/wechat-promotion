import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import smsService from '../services/smsService';
import crypto from 'crypto';
import QRCode from 'qrcode';
import axios from 'axios';
import { createQrCode as createWechatQrCode } from '../services/wechatService';

const router = Router();

/**
 * H5 端获取公众号列表（无需认证）
 * GET /api/employee-binding/accounts
 */
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, account_name, wechat_id, account_type, verified, qr_code_url, avatar, description FROM wechat_account_configs WHERE status = 1 ORDER BY created_at DESC'
    );

    const accounts = (rows as any[]).map((acc: any) => ({
      id: acc.id.toString(),
      name: acc.account_name,
      wechatId: acc.wechat_id,
      appId: '',
      appSecret: '',
      accountType: acc.account_type === 'service' ? 'service' : 'subscription',
      verified: acc.verified === 1,
      qrCodeUrl: acc.qr_code_url || '',
      avatar: acc.avatar || '',
      totalFollowers: 0,
      todayNewFollows: 0,
      isPrimary: false,
    }));

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: accounts
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '获取失败',
      timestamp: Date.now(),
      error: error.message
    });
  }
});

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
router.delete('/unbind', authenticate, async (req: Request, res: Response) => {
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
router.post('/admin/bind', authenticate, async (req: Request, res: Response) => {
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

// 存储绑定码的内存缓存（生产环境应使用Redis）
const bindingCodes = new Map<string, {
  type: 'universal' | 'personal';
  employeeId?: string;
  employeeName?: string;
  accountId?: string;
  createdAt?: number;
  expiresAt: number;
}>();

/**
 * 测试接口：生成模拟二维码（不需要数据库）
 * 用于前端测试 - 生成本地base64二维码图片
 */
router.post('/qrcode/test', async (req: Request, res: Response) => {
  try {
    const { type = 'universal', employeeId, employeeName, accountId = '1' } = req.body;

    // 生成唯一的场景值
    const sceneStr = type === 'personal' && employeeId
      ? `bind_personal_${employeeId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      : `bind_universal_test_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // 模拟微信二维码ticket
    const ticket = `TICKET_${crypto.randomBytes(16).toString('hex')}`;

    const expiresAt = Date.now() + (type === 'personal' ? 24 : 7 * 24) * 60 * 60 * 1000;

    // 存储绑定码信息，使用传入的 accountId
    bindingCodes.set(sceneStr, {
      type: type === 'personal' ? 'personal' : 'universal',
      employeeId: type === 'personal' ? employeeId : undefined,
      employeeName: type === 'personal' ? employeeName : undefined,
      accountId: accountId.toString(), // 使用传入的公众号ID
      createdAt: Date.now(),
      expiresAt,
    });

    // 生成本地二维码图片（base64）
    // 直接跳转到 H5 员工端绑定页面，使用局域网地址（微信浏览器可以访问）
    const scanUrl = `http://192.168.100.200:5174/bind?scene=${sceneStr}&type=${type}`;

    const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    logger.info('生成测试绑定码', { type, employeeId, accountId, sceneStr });

    res.json({
      code: 200,
      message: '生成成功（测试模式）',
      timestamp: Date.now(),
      data: {
        sceneStr,
        scanUrl, // 返回绑定链接
        qrCodeUrl: qrCodeDataUrl, // 返回base64图片
        ticket,
        expireSeconds: type === 'personal' ? 86400 : 604800,
        expiresAt,
        accountId: accountId.toString(), // 返回公众号ID
        employee: type === 'personal' && employeeId ? {
          employeeId,
          name: employeeName || '测试员工',
          phone: '138****8888',
          department: '测试部门',
        } : undefined,
      },
    });
  } catch (error: any) {
    logger.error('生成测试绑定码失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '生成绑定码失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

/**
 * 生成微信推广二维码（使用真实微信 API）
 * POST /api/employee-binding/qrcode/wechat
 */
router.post('/qrcode/wechat', async (req: Request, res: Response) => {
  try {
    const { type = 'universal', employeeId, employeeName, accountId = 1 } = req.body;
    
    // 验证微信公众号配置
    if (!process.env.WECHAT_APP_ID || !process.env.WECHAT_APP_SECRET) {
      return res.status(500).json({
        code: 500,
        message: '微信 API 未配置，请配置 WECHAT_APP_ID 和 WECHAT_APP_SECRET',
        timestamp: Date.now(),
      });
    }

    // 生成唯一的场景值（用于追踪推广人）
    const sceneStr = type === 'personal' && employeeId
      ? `qrscene_${employeeId}_${Date.now()}`
      : `qrscene_universal_${Date.now()}`;
    
    logger.info('生成微信推广二维码', { type, employeeId, sceneStr });

    // 调用微信 API 生成二维码
    const qrCodeUrl = await createWechatQrCode(sceneStr, 2592000); // 30 天有效期

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    // 存储绑定码信息（用于后续验证）
    bindingCodes.set(sceneStr, {
      type: type === 'personal' ? 'personal' : 'universal',
      employeeId: type === 'personal' ? employeeId : undefined,
      employeeName: type === 'personal' ? employeeName : undefined,
      accountId: accountId.toString(),
      createdAt: Date.now(),
      expiresAt,
    });

    logger.info('微信推广二维码生成成功', { sceneStr, qrCodeUrl });

    res.json({
      code: 200,
      message: '生成成功',
      timestamp: Date.now(),
      data: {
        sceneStr,
        qrCodeUrl, // 微信二维码图片 URL
        expireSeconds: 2592000, // 30 天
        expiresAt,
        employee: type === 'personal' && employeeId ? {
          employeeId,
          name: employeeName || '员工',
        } : undefined,
      },
    });
  } catch (error: any) {
    logger.error('生成微信推广二维码失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '生成二维码失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

/**
 * 生成通用绑定码
 * 员工扫码后自助填写信息完成绑定
 * 临时：不需要认证，方便测试
 */
router.post('/qrcode/universal', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({
        code: 400,
        message: '缺少公众号ID',
        timestamp: Date.now(),
      });
    }

    // 获取公众号信息
    const [accounts] = await pool.query(
      'SELECT app_id, app_secret FROM wechat_accounts WHERE id = ? AND status = 1',
      [accountId]
    );

    const account = (accounts as any[])[0];
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: '公众号不存在或已停用',
        timestamp: Date.now(),
      });
    }

    // 生成唯一的场景值
    const sceneStr = `bind_universal_${accountId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // 存储绑定码信息（7天有效）
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    bindingCodes.set(sceneStr, {
      type: 'universal',
      accountId,
      createdAt: Date.now(),
      expiresAt,
    });

    // 调用微信API生成二维码
    const qrCodeUrl = await createWechatQrCode(sceneStr, 7 * 24 * 60 * 60);

    logger.info('生成通用绑定码成功', { accountId, sceneStr });

    res.json({
      code: 200,
      message: '生成成功',
      timestamp: Date.now(),
      data: {
        sceneStr,
        qrCodeUrl,
        expireSeconds: 7 * 24 * 60 * 60,
        expiresAt,
      },
    });
  } catch (error: any) {
    logger.error('生成通用绑定码失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '生成绑定码失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

/**
 * 生成员工专属绑定码
 * 为已录入的员工生成专属码，扫码即绑定
 * 临时：不需要认证，方便测试
 */
router.post('/qrcode/personal', async (req: Request, res: Response) => {
  try {
    const { employeeId, accountId } = req.body;
    
    if (!employeeId || !accountId) {
      return res.status(400).json({
        code: 400,
        message: '缺少员工ID或公众号ID',
        timestamp: Date.now(),
      });
    }

    // 获取员工信息
    const [employees] = await pool.query(
      'SELECT employee_id, name, phone, department FROM employees WHERE employee_id = ? AND status = 1',
      [employeeId]
    );

    const employee = (employees as any[])[0];
    if (!employee) {
      return res.status(404).json({
        code: 404,
        message: '员工不存在或已离职',
        timestamp: Date.now(),
      });
    }

    // 检查是否已绑定
    const [bindings] = await pool.query(
      'SELECT id FROM employee_bindings WHERE employee_id = ? AND is_verified = TRUE',
      [employeeId]
    );

    if ((bindings as any[]).length > 0) {
      return res.status(400).json({
        code: 400,
        message: '该员工已绑定微信',
        timestamp: Date.now(),
      });
    }

    // 获取公众号信息
    const [accounts] = await pool.query(
      'SELECT app_id, app_secret FROM wechat_accounts WHERE id = ? AND status = 1',
      [accountId]
    );

    const account = (accounts as any[])[0];
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: '公众号不存在或已停用',
        timestamp: Date.now(),
      });
    }

    // 生成唯一的场景值
    const sceneStr = `bind_personal_${employeeId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // 存储绑定码信息（24小时有效）
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    bindingCodes.set(sceneStr, {
      type: 'personal',
      employeeId,
      accountId,
      createdAt: Date.now(),
      expiresAt,
    });

    // 调用微信API生成二维码
    const qrCodeUrl = await createWechatQrCode(sceneStr, 24 * 60 * 60);

    logger.info('生成员工专属绑定码成功', { employeeId, sceneStr });

    res.json({
      code: 200,
      message: '生成成功',
      timestamp: Date.now(),
      data: {
        sceneStr,
        qrCodeUrl,
        expireSeconds: 24 * 60 * 60,
        expiresAt,
        employee: {
          employeeId: employee.employee_id,
          name: employee.name,
          phone: employee.phone,
          department: employee.department,
        },
      },
    });
  } catch (error: any) {
    logger.error('生成专属绑定码失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '生成绑定码失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

/**
 * 处理微信扫码事件（供wechat.ts调用）
 */
export async function handleBindingScanEvent(
  sceneStr: string,
  openid: string,
  accountId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // 查找绑定码信息
    const codeInfo = bindingCodes.get(sceneStr);
    
    if (!codeInfo) {
      return { success: false, message: '绑定码不存在或已过期' };
    }

    // 检查是否过期
    if (Date.now() > codeInfo.expiresAt) {
      bindingCodes.delete(sceneStr);
      return { success: false, message: '绑定码已过期' };
    }

    // 检查公众号是否匹配
    if (codeInfo.accountId !== accountId) {
      return { success: false, message: '公众号不匹配' };
    }

    if (codeInfo.type === 'personal') {
      // 专属绑定码：直接绑定员工
      const employeeId = codeInfo.employeeId!;
      
      // 创建绑定关系
      await pool.query(
        `INSERT INTO employee_bindings (employee_id, openid, is_verified, verification_method, verified_at)
         VALUES (?, ?, TRUE, 'qrcode', NOW())
         ON DUPLICATE KEY UPDATE
         employee_id = VALUES(employee_id),
         is_verified = TRUE,
         verification_method = 'qrcode',
         verified_at = NOW()`,
        [employeeId, openid]
      );

      // 获取员工信息
      const [employees] = await pool.query(
        'SELECT employee_id, name, department FROM employees WHERE employee_id = ?',
        [employeeId]
      );
      const employee = (employees as any[])[0];

      // 删除已使用的绑定码
      bindingCodes.delete(sceneStr);

      logger.info('员工扫码绑定成功', { employeeId, openid });

      return {
        success: true,
        message: `绑定成功！欢迎您，${employee?.name}`,
        data: { employee },
      };
    } else {
      // 通用绑定码：返回需要填写信息的提示
      return {
        success: true,
        message: '请填写您的员工信息完成绑定',
        data: {
          needFillInfo: true,
          sceneStr,
        },
      };
    }
  } catch (error: any) {
    logger.error('处理扫码绑定失败', { error: error.message });
    return { success: false, message: '绑定失败，请稍后重试' };
  }
}

/**
 * 通用绑定码 - 员工填写信息后提交绑定
 * 支持有码模式（sceneStr验证）和无码模式（直接绑定，用于测试）
 */
router.post('/bind/universal', async (req: Request, res: Response) => {
  try {
    const { sceneStr, openid, employeeNo, name, department, phone } = req.body;

    // 如果有 sceneStr，尝试验证绑定码
    if (sceneStr) {
      const codeInfo = bindingCodes.get(sceneStr);
      if (!codeInfo || codeInfo.type !== 'universal') {
        // 绑定码无效但不清空表单，让用户可以重试或跳过
        logger.warn('绑定码验证未通过，降级为无码模式', { sceneStr });
      } else if (Date.now() > codeInfo.expiresAt) {
        bindingCodes.delete(sceneStr);
        logger.warn('绑定码已过期，降级为无码模式', { sceneStr });
      }
    }

    // 检查工号是否已存在
    const [existing] = await pool.query(
      'SELECT employee_id FROM employees WHERE employee_id = ?',
      [employeeNo]
    );

    let dbEmployeeId: string;

    if ((existing as any[]).length > 0) {
      // 更新现有员工
      dbEmployeeId = (existing as any[])[0].employee_id;
      await pool.query(
        'UPDATE employees SET name = ?, department = ?, phone = ? WHERE employee_id = ?',
        [name, department, phone, dbEmployeeId]
      );
    } else {
      // 创建新员工
      const [result] = await pool.query(
        'INSERT INTO employees (employee_id, name, department, phone, status, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
        [employeeNo, name, department, phone]
      );
      dbEmployeeId = (result as any).insertId.toString();
    }

    // 使用绑定码时删除（防止重复使用）
    if (sceneStr && bindingCodes.has(sceneStr)) {
      bindingCodes.delete(sceneStr);
    }

    logger.info('员工绑定成功', { dbEmployeeId, openid, employeeNo, name, mode: sceneStr ? 'qrcode' : 'direct' });

    res.json({
      code: 200,
      message: '绑定成功',
      timestamp: Date.now(),
      data: {
        employeeId: dbEmployeeId,
        name,
        department,
      },
    });
  } catch (error: any) {
    logger.error('通用绑定失败', { error: error.message });
    res.status(500).json({
      code: 500,
      message: '绑定失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

// 定期清理过期的绑定码
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of bindingCodes.entries()) {
    if (now > value.expiresAt) {
      bindingCodes.delete(key);
    }
  }
}, 60 * 60 * 1000); // 每小时清理一次

// 微信OAuth回调处理
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send(`
        <html>
          <head><title>绑定失败</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #e74c3c;">❌ 绑定失败</h2>
            <p>缺少必要的参数，请重新扫描二维码。</p>
            <script>setTimeout(() => { if (typeof WeixinJSBridge !== 'undefined') { WeixinJSBridge.call('closeWindow'); } }, 2000);</script>
          </body>
        </html>
      `);
    }

    // 检查绑定码是否存在
    const bindingData = bindingCodes.get(state as string);
    if (!bindingData) {
      return res.status(400).send(`
        <html>
          <head><title>绑定失败</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #e74c3c;">❌ 二维码已过期</h2>
            <p>请重新获取二维码后扫码。</p>
            <script>setTimeout(() => { if (typeof WeixinJSBridge !== 'undefined') { WeixinJSBridge.call('closeWindow'); } }, 2000);</script>
          </body>
        </html>
      `);
    }

    // 使用环境变量中的微信配置
    const appId = process.env.WECHAT_APP_ID || '';
    const appSecret = process.env.WECHAT_APP_SECRET || '';

    // 通过code换取网页授权access_token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;
    const tokenResponse = await axios.get(tokenUrl);
    const tokenData = tokenResponse.data as any;

    if (tokenData.errcode) {
      logger.error('获取access_token失败', { error: tokenData });
      return res.status(500).send(`
        <html>
          <head><title>绑定失败</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #e74c3c;">❌ 微信授权失败</h2>
            <p>${tokenData.errmsg || '请稍后重试'}</p>
            <script>setTimeout(() => { if (typeof WeixinJSBridge !== 'undefined') { WeixinJSBridge.call('closeWindow'); } }, 2000);</script>
          </body>
        </html>
      `);
    }

    const { access_token, openid } = tokenData;

    // 获取用户信息
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    const userInfoResponse = await axios.get(userInfoUrl);
    const userInfo = userInfoResponse.data as any;

    // 根据绑定类型处理
    if (bindingData.type === 'universal') {
      // 通用绑定码 - 显示员工信息填写页面
      return res.send(`
        <html>
          <head>
            <title>员工绑定</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
              .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h2 { color: #333; margin-bottom: 20px; text-align: center; }
              .form-group { margin-bottom: 16px; }
              label { display: block; margin-bottom: 6px; color: #666; font-size: 14px; }
              input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 16px; }
              button { width: 100%; padding: 14px; background: #07c160; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 10px; }
              button:hover { background: #06ad56; }
              .user-info { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: #f9f9f9; border-radius: 8px; }
              .user-info img { width: 48px; height: 48px; border-radius: 50%; }
              .user-info span { color: #333; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>员工身份绑定</h2>
              <div class="user-info">
                <img src="${userInfo.headimgurl || 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUqQZEZmtsTgiaFaI9Uj1WqEnB0J7YcNnicicPEdDg8sNqPvJvI3hRtVQ3xCTyA/132'}" alt="avatar">
                <span>${userInfo.nickname || '微信用户'}，请填写员工信息</span>
              </div>
              <form id="bindForm">
                <input type="hidden" name="openid" value="${openid}">
                <input type="hidden" name="nickname" value="${userInfo.nickname || ''}">
                <input type="hidden" name="avatar" value="${userInfo.headimgurl || ''}">
                <input type="hidden" name="sceneStr" value="${state}">
                <div class="form-group">
                  <label>员工工号</label>
                  <input type="text" name="employeeNo" placeholder="请输入员工工号" required>
                </div>
                <div class="form-group">
                  <label>姓名</label>
                  <input type="text" name="name" placeholder="请输入姓名" required>
                </div>
                <div class="form-group">
                  <label>部门</label>
                  <input type="text" name="department" placeholder="请输入部门">
                </div>
                <div class="form-group">
                  <label>手机号</label>
                  <input type="tel" name="phone" placeholder="请输入手机号" required>
                </div>
                <button type="submit">确认绑定</button>
              </form>
            </div>
            <script>
              document.getElementById('bindForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                try {
                  const res = await fetch('/api/employee-binding/bind-universal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  const result = await res.json();
                  
                  if (result.code === 200) {
                    document.body.innerHTML = '<div class="container" style="text-align: center; padding: 50px;"><h2 style="color: #07c160;">✅ 绑定成功</h2><p>您已成功绑定员工身份</p><p>员工：' + (result.data.name || '') + '</p></div>';
                  } else {
                    alert(result.message || '绑定失败');
                  }
                } catch (err) {
                  alert('网络错误，请重试');
                }
              });
            </script>
          </body>
        </html>
      `);
    } else if (bindingData.type === 'personal') {
      // 个人专属绑定码 - 直接绑定
      const employeeId = bindingData.employeeId;
      const employeeName = bindingData.employeeName;

      // 创建绑定关系
      await pool.query(
        `INSERT INTO employee_bindings (employee_id, openid, is_verified, verification_method, verified_at)
         VALUES (?, ?, TRUE, 'qrcode', NOW())
         ON DUPLICATE KEY UPDATE
         employee_id = VALUES(employee_id),
         is_verified = TRUE,
         verification_method = 'qrcode',
         verified_at = NOW()`,
        [employeeId, openid]
      );

      // 删除绑定码
      bindingCodes.delete(state as string);

      logger.info('员工扫码绑定成功', { employeeId, openid });

      return res.send(`
        <html>
          <head><title>绑定成功</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #07c160;">✅ 绑定成功</h2>
            <p>您已成功绑定员工身份</p>
            <p>员工：${employeeName}</p>
            <script>
              setTimeout(() => { 
                if (typeof WeixinJSBridge !== 'undefined') { 
                  WeixinJSBridge.call('closeWindow'); 
                } 
              }, 2000);
            </script>
          </body>
        </html>
      `);
    }

  } catch (error: any) {
    logger.error('OAuth回调处理失败', { error: error.message });
    return res.status(500).send(`
      <html>
        <head><title>绑定失败</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #e74c3c;">❌ 系统错误</h2>
          <p>${error.message}</p>
          <script>setTimeout(() => { if (typeof WeixinJSBridge !== 'undefined') { WeixinJSBridge.call('closeWindow'); } }, 2000);</script>
        </body>
      </html>
    `);
  }
});

export default router;
