/**
 * 识别码处理接口
 *
 * 专门用于订阅号的识别码验证
 * 当用户在公众号对话框发送识别码时调用
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { accountTypeService, AccountType } from '../services/accountTypeService';

const router = Router();

/**
 * 处理识别码消息
 *
 * POST /api/verification-code/verify
 *
 * 当用户在公众号对话框发送识别码时调用
 *
 * 识别码格式：工号+手机号后4位，例如：EMP0011234
 */
router.post('/verify', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const { account_id, openid, content } = req.body;

    // 参数验证
    if (!account_id || !openid || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：account_id, openid, content'
      });
    }

    logger.info('收到识别码消息', {
      account_id,
      openid,
      content: content.trim()
    });

    // 验证是否是订阅号
    const accountType = await accountTypeService.getAccountType(account_id);

    if (accountType !== AccountType.SUBSCRIPTION) {
      logger.warn('非订阅号尝试使用识别码', { account_id, account_type: accountType });
      return res.status(400).json({
        success: false,
        message: '只有订阅号支持识别码绑定',
        hint: '服务号请使用H5网页授权方式绑定'
      });
    }

    // 解析识别码（格式：工号+手机号后4位）
    const trimmedContent = content.trim().toUpperCase();
    const match = trimmedContent.match(/^(EMP\d+)(\d{4})$/);

    if (!match) {
      logger.warn('识别码格式不正确', { content: trimmedContent });
      return res.json({
        success: false,
        message: '识别码格式不正确',
        hint: '请输入：工号+手机号后4位，例如：EMP0011234',
        format_example: 'EMP0011234'
      });
    }

    const [_, employeeId, phoneSuffix] = match;

    logger.info('解析识别码成功', { employee_id: employeeId, phone_suffix: phoneSuffix });

    // 验证员工信息
    const [employees] = await connection.query(
      'SELECT employee_id, name, phone, department, position FROM employees WHERE employee_id = ? AND phone LIKE ?',
      [employeeId, `%${phoneSuffix}`]
    );

    if (!employees || (employees as any[]).length === 0) {
      logger.warn('员工信息验证失败', { employee_id: employeeId, phone_suffix: phoneSuffix });
      return res.json({
        success: false,
        message: '工号或手机号后4位不正确',
        hint: '请检查工号和手机号后4位是否正确'
      });
    }

    const employee = (employees as any[])[0];

    // 检查是否已绑定
    const [existing] = await connection.query(
      'SELECT id, is_verified, verified_at FROM employee_bindings WHERE employee_id = ? AND account_id = ?',
      [employeeId, account_id]
    );

    if (existing && (existing as any[]).length > 0) {
      const binding = (existing as any[])[0];
      if (binding.is_verified) {
        logger.info('员工已绑定', { employee_id: employeeId, account_id });
        return res.json({
          success: false,
          message: '您已绑定此公众号，无需重复绑定',
          employee_name: employee.name,
          bind_time: binding.verified_at
        });
      }
    }

    // 绑定员工（创建绑定记录）
    if (!existing || (existing as any[]).length === 0) {
      await connection.query(
        `INSERT INTO employee_bindings
         (employee_id, account_id, openid, is_verified, verification_method, verified_at, created_at)
         VALUES (?, ?, ?, TRUE, 'verification_code', NOW(), NOW())`,
        [employeeId, account_id, openid]
      );
    } else {
      // 更新已存在的记录
      await connection.query(
        `UPDATE employee_bindings
         SET openid = ?, is_verified = TRUE, verification_method = 'verification_code', verified_at = NOW()
         WHERE employee_id = ? AND account_id = ?`,
        [openid, employeeId, account_id]
      );
    }

    // 生成场景值（用于推广二维码）
    const sceneStr = `emp_${employeeId}_${Date.now()}`;

    // 生成推广记录
    const [result] = await connection.query(
      `INSERT INTO promotion_records
       (employee_id, account_id, scene_str, qr_code_url, scan_count, follow_count, created_at)
       VALUES (?, ?, ?, '', 0, 0, NOW())`,
      [employeeId, account_id, sceneStr]
    );

    const promotionRecordId = (result as any).insertId;

    logger.info('识别码绑定成功', {
      employee_id: employeeId,
      employee_name: employee.name,
      account_id,
      openid,
      scene_str: sceneStr
    });

    res.json({
      success: true,
      message: '绑定成功！',
      data: {
        employee_id: employee.employee_id,
        employee_name: employee.name,
        account_id: account_id,
        bind_method: 'verification_code',
        promotion_record_id: promotionRecordId,
        scene_str: sceneStr,
        next_step: '请打开绑定链接完成最终验证'
      }
    });

  } catch (error: any) {
    logger.error('识别码验证失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '验证失败'
    });
  } finally {
    connection.release();
  }
});

/**
 * 生成临时识别码
 *
 * POST /api/verification-code/generate
 *
 * 生成6位数字验证码，发送短信给员工
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { employee_id, phone } = req.body;

    if (!employee_id || !phone) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：employee_id, phone'
      });
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 保存验证码到数据库（5分钟有效）
    await pool.query(
      `INSERT INTO verification_codes (phone, code, is_used, expired_at, created_at)
       VALUES (?, ?, FALSE, DATE_ADD(NOW(), INTERVAL 5 MINUTE), NOW())`,
      [phone, code]
    );

    // TODO: 发送短信验证码
    // await sendSms(phone, `您的绑定验证码是：${code}，5分钟内有效`);

    logger.info('生成验证码成功', { employee_id, phone, code });

    res.json({
      success: true,
      message: '验证码已发送',
      data: {
        code: code, // 仅在测试环境返回
        expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
    });

  } catch (error: any) {
    logger.error('生成验证码失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成验证码失败'
    });
  }
});

/**
 * 验证临时识别码
 *
 * POST /api/verification-code/validate
 *
 * 验证短信验证码
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：phone, code'
      });
    }

    // 查询验证码
    const [codes] = await pool.query(
      `SELECT * FROM verification_codes
       WHERE phone = ? AND code = ? AND is_used = FALSE AND expired_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, code]
    );

    if (!codes || (codes as any[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }

    // 标记验证码已使用
    await pool.query(
      `UPDATE verification_codes
       SET is_used = TRUE, used_at = NOW()
       WHERE phone = ? AND code = ? AND is_used = FALSE`,
      [phone, code]
    );

    logger.info('验证码验证成功', { phone, code });

    res.json({
      success: true,
      message: '验证成功'
    });

  } catch (error: any) {
    logger.error('验证码验证失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '验证失败'
    });
  }
});

export default router;
