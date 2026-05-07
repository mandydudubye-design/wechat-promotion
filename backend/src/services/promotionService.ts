import { pool } from '../config/database';
import { createQrCode } from './wechatService';
import { logger } from '../utils/logger';

/**
 * 推广模式类型
 */
export enum PromotionMode {
  QR_CODE = 'qr_code',           // 二维码模式（已认证公众号）
  VERIFICATION_CODE = 'verification_code', // 验证码模式（未认证订阅号）
}

/**
 * 公众号推广配置
 */
export interface PromotionConfig {
  accountId: number;
  accountName: string;
  accountType: 'service' | 'subscription';
  verified: boolean;
  promotionMode: PromotionMode;
  canGeneratePersonalQr: boolean;
}

/**
 * 根据公众号类型判断推广模式
 * @param accountType 公众号类型
 * @param verified 是否已认证
 * @returns 推广模式
 */
export function determinePromotionMode(
  accountType: 'service' | 'subscription',
  verified: boolean
): PromotionMode {
  // 服务号或已认证订阅号：使用二维码模式
  if (accountType === 'service' || verified) {
    return PromotionMode.QR_CODE;
  }
  // 未认证订阅号：使用验证码模式
  return PromotionMode.VERIFICATION_CODE;
}

/**
 * 获取公众号的推广配置
 * @param accountId 公众号ID
 * @returns 推广配置
 */
export async function getPromotionConfig(
  accountId: number
): Promise<PromotionConfig | null> {
  try {
    const [rows] = await pool.query(
      'SELECT id, account_name, account_type, verified FROM wechat_account_configs WHERE id = ? AND status = 1',
      [accountId]
    );

    const account = (rows as any[])[0];
    if (!account) {
      return null;
    }

    const promotionMode = determinePromotionMode(
      account.account_type,
      account.verified === 1
    );

    return {
      accountId: account.id,
      accountName: account.account_name,
      accountType: account.account_type,
      verified: account.verified === 1,
      promotionMode,
      canGeneratePersonalQr: promotionMode === PromotionMode.QR_CODE,
    };
  } catch (error: any) {
    logger.error('获取推广配置失败', { error: error.message, accountId });
    return null;
  }
}

/**
 * 生成员工专属推广码
 * @param employeeId 员工ID
 * @param employeeName 员工姓名
 * @param accountId 公众号ID
 * @returns 推广码信息
 */
export async function generateEmployeePromotionCode(
  employeeId: string,
  employeeName: string,
  accountId: number
): Promise<{
  success: boolean;
  mode: string;
  landingPageUrl?: string;
  qrCodeUrl?: string;
  accountId: number;
  employeeId: string;
  employeeName: string;
  accountName: string;
  accountType: string;
  verified: boolean;
  message: string;
}> {
  try {
    // 获取公众号配置
    const [rows] = await pool.query(
      'SELECT account_name, account_type, verified FROM wechat_account_configs WHERE id = ? AND status = 1',
      [accountId]
    );

    const account = (rows as any[])[0];
    if (!account) {
      return {
        success: false,
        mode: 'error',
        accountId: 0,
        employeeId,
        employeeName,
        accountName: '',
        accountType: '',
        verified: false,
        message: '公众号不存在或已停用',
      };
    }

    // 生成 H5 落地页 URL
    const baseUrl = process.env.H5_BASE_URL 
      || (process.env.NODE_ENV === 'production' 
        ? (process.env.SERVER_URL || 'https://x-bussiness.online')
        : 'http://192.168.100.200:5174');
    
    const landingPageUrl = `${baseUrl}/landing?accountId=${accountId}&employeeId=${encodeURIComponent(employeeId)}&employeeName=${encodeURIComponent(employeeName)}`;
    
    // 使用第三方 API 生成 H5 落地页的二维码
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(landingPageUrl)}`;

    logger.info('生成员工专属推广码', {
      employeeId,
      employeeName,
      accountId,
      landingPageUrl,
      mode: 'landing_page',
    });

    return {
      success: true,
      mode: 'landing_page',
      landingPageUrl,
      qrCodeUrl,
      accountId,
      employeeId,
      employeeName,
      accountName: account.account_name,
      accountType: account.account_type,
      verified: account.verified === 1,
      message: 'H5落地页模式：扫码打开推广落地页，展示公众号二维码和关注引导',
    };
  } catch (error: any) {
    logger.error('生成推广码失败', { error: error.message });
    return {
      success: false,
      mode: 'error',
      accountId: 0,
      employeeId,
      employeeName,
      accountName: '',
      accountType: '',
      verified: false,
      message: '生成推广码失败',
    };
  }
}

/**
 * 批量获取员工的推广配置
 * @param employeeIds 员工ID列表
 * @param accountId 公众号ID
 * @returns 员工推广配置列表
 */
export async function getEmployeesPromotionConfigs(
  employeeIds: string[],
  accountId: number
): Promise<Array<{
  employeeId: string;
  employeeName: string;
  mode: PromotionMode;
  qrCodeUrl?: string;
  verificationCode?: string;
  canGeneratePersonalQr: boolean;
}>> {
  try {
    const [employees] = await pool.query(
      `SELECT employee_id, name, verification_code
       FROM employees
       WHERE employee_id IN (${employeeIds.map(() => '?').join(',')}) AND status = 1`,
      employeeIds
    );

    const config = await getPromotionConfig(accountId);
    if (!config) {
      throw new Error('公众号不存在或已停用');
    }

    return (employees as any[]).map((employee) => ({
      employeeId: employee.employee_id,
      employeeName: employee.name,
      mode: config.promotionMode,
      verificationCode: employee.verification_code,
      canGeneratePersonalQr: config.canGeneratePersonalQr,
    }));
  } catch (error: any) {
    logger.error('批量获取员工推广配置失败', { error: error.message });
    throw error;
  }
}

/**
 * 说明：此服务需要在 employee_bindings 表中添加 verification_code 字段
 * ALTER TABLE employee_bindings ADD COLUMN verification_code VARCHAR(10) DEFAULT NULL;
 */
