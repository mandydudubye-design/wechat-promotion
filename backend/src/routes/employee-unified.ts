/**
 * 统一员工绑定接口
 *
 * 支持订阅号和服务号两种模式
 * 根据公众号类型自动选择绑定方式
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { accountTypeService, AccountType, BindMethod } from '../services/accountTypeService';

const router = Router();

/**
 * 获取公众号绑定配置
 *
 * GET /api/employee/bind-config?account_id=1
 *
 * 返回该公众号支持的绑定方式和功能特性
 */
router.get('/bind-config', async (req: Request, res: Response) => {
  try {
    const accountId = parseInt(req.query.account_id as string);

    if (!accountId || isNaN(accountId)) {
      return res.status(400).json({
        success: false,
        message: '缺少有效的account_id参数'
      });
    }

    logger.info('获取公众号绑定配置', { accountId });

    // 获取公众号信息
    const accountInfo = await accountTypeService.getAccountInfo(accountId);

    res.json({
      success: true,
      data: accountInfo
    });

  } catch (error: any) {
    logger.error('获取绑定配置失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取绑定配置失败'
    });
  }
});

/**
 * 统一员工绑定接口
 *
 * POST /api/employee/bind
 *
 * 根据公众号类型自动选择绑定方式：
 * - 服务号：需要openid（通过H5网页授权获取）
 * - 订阅号：需要openid（通过识别码消息获取）
 */
router.post('/bind', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { account_id, employee_id, phone_suffix, openid, bind_method } = req.body;

    // 参数验证
    if (!account_id || !employee_id || !phone_suffix) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：account_id, employee_id, phone_suffix'
      });
    }

    // 获取公众号类型
    const accountType = await accountTypeService.getAccountType(account_id);

    logger.info('开始员工绑定', {
      account_id,
      employee_id,
      account_type: accountType,
      has_openid: !!openid
    });

    // 根据公众号类型验证参数
    if (accountType === AccountType.SERVICE && !openid) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '服务号需要先进行H5网页授权获取OpenID',
        hint: '请先完成微信授权'
      });
    }

    if (accountType === AccountType.SUBSCRIPTION && !openid) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '订阅号需要先在公众号对话框发送识别码',
        hint: '请先在公众号对话框发送识别码（格式：工号+手机号后4位）'
      });
    }

    // 验证员工信息
    const [employees] = await connection.query(
      'SELECT employee_id, name, phone, department, position FROM employees WHERE employee_id = ? AND phone LIKE ?',
      [employee_id, `%${phone_suffix}`]
    );

    if (!employees || (employees as any[]).length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '工号或手机号后4位不正确',
        hint: '请检查工号和手机号后4位'
      });
    }

    const employee = (employees as any[])[0];

    // 检查是否已绑定
    const [existing] = await connection.query(
      'SELECT id FROM employee_bindings WHERE employee_id = ? AND account_id = ?',
      [employee_id, account_id]
    );

    if (existing && (existing as any[]).length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '该员工已绑定此公众号'
      });
    }

    // 绑定员工
    await connection.query(
      `INSERT INTO employee_bindings
       (employee_id, account_id, openid, is_verified, verification_method, verified_at, created_at)
       VALUES (?, ?, ?, TRUE, ?, NOW(), NOW())`,
      [
        employee_id,
        account_id,
        openid || null,
        bind_method || (accountType === AccountType.SERVICE ? 'web_auth' : 'verification_code')
      ]
    );

    // 生成场景值（用于推广二维码）
    const sceneStr = `emp_${employee_id}_${Date.now()}`;

    // 生成推广记录
    const [result] = await connection.query(
      `INSERT INTO promotion_records
       (employee_id, account_id, scene_str, qr_code_url, scan_count, follow_count, created_at)
       VALUES (?, ?, ?, ?, 0, 0, NOW())`,
      [employee_id, account_id, sceneStr, '', 0, 0]
    );

    const promotionRecordId = (result as any).insertId;

    await connection.commit();

    logger.info('员工绑定成功', {
      employee_id,
      account_id,
      account_type: accountType,
      bind_method: bind_method || (accountType === AccountType.SERVICE ? 'web_auth' : 'verification_code')
    });

    res.json({
      success: true,
      message: '绑定成功',
      data: {
        employee_id: employee.employee_id,
        employee_name: employee.name,
        account_id: account_id,
        account_type: accountType,
        bind_method: bind_method || (accountType === AccountType.SERVICE ? 'web_auth' : 'verification_code'),
        promotion_record_id: promotionRecordId,
        scene_str: sceneStr
      }
    });

  } catch (error: any) {
    await connection.rollback();
    logger.error('员工绑定失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '绑定失败'
    });
  } finally {
    connection.release();
  }
});

/**
 * 获取员工绑定状态
 *
 * GET /api/employee/bind-status?employee_id=EMP001&account_id=1
 */
router.get('/bind-status', async (req: Request, res: Response) => {
  try {
    const { employee_id, account_id } = req.query;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: '缺少employee_id参数'
      });
    }

    let query = `
      SELECT
        eb.id,
        eb.employee_id,
        eb.account_id,
        eb.openid,
        eb.is_verified,
        eb.verification_method,
        eb.verified_at,
        wa.account_name,
        wa.account_type,
        e.name as employee_name
      FROM employee_bindings eb
      JOIN wechat_accounts wa ON eb.account_id = wa.id
      JOIN employees e ON eb.employee_id = e.employee_id
      WHERE eb.employee_id = ?
    `;

    const params: any[] = [employee_id];

    if (account_id) {
      query += ' AND eb.account_id = ?';
      params.push(account_id);
    }

    const [bindings] = await pool.query(query, params);

    res.json({
      success: true,
      data: bindings
    });

  } catch (error: any) {
    logger.error('获取绑定状态失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取绑定状态失败'
    });
  }
});

export default router;
