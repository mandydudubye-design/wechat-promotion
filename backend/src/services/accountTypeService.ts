/**
 * 公众号类型服务
 *
 * 负责判断公众号类型并返回相应的绑定方式
 */

import { pool } from '../config/database';
import { logger } from '../utils/logger';

export enum AccountType {
  SUBSCRIPTION = 'subscription', // 订阅号
  SERVICE = 'service'           // 服务号
}

export enum BindMethod {
  WEB_AUTH = 'web_auth',                    // H5网页授权
  VERIFICATION_CODE = 'verification_code',  // 识别码验证
}

export interface AccountTypeInfo {
  account_id: number;
  account_name: string;
  account_type: AccountType;
  app_id: string | null;
  bind_method: BindMethod;
  bind_method_description: string;
  is_web_auth_supported: boolean;
  features: {
    web_auth: boolean;
    verification_code: boolean;
    auto_get_openid: boolean;
    manual_send_code: boolean;
  };
}

export class AccountTypeService {
  /**
   * 获取公众号类型
   */
  async getAccountType(accountId: number): Promise<AccountType> {
    try {
      const [accounts] = await pool.query(
        'SELECT account_type FROM wechat_accounts WHERE id = ?',
        [accountId]
      );

      if (!accounts || (accounts as any[]).length === 0) {
        throw new Error('公众号不存在');
      }

      return (accounts as any[])[0].account_type as AccountType;
    } catch (error) {
      logger.error('获取公众号类型失败', error);
      throw error;
    }
  }

  /**
   * 获取公众号完整信息
   */
  async getAccountInfo(accountId: number): Promise<AccountTypeInfo> {
    try {
      const [accounts] = await pool.query(
        'SELECT id, account_name, account_type, app_id FROM wechat_accounts WHERE id = ? AND status = 1',
        [accountId]
      );

      if (!accounts || (accounts as any[]).length === 0) {
        throw new Error('公众号不存在或已停用');
      }

      const account = (accounts as any[])[0];
      const accountType = account.account_type as AccountType;

      // 根据类型返回不同的配置
      const bindMethod = this.getRecommendedBindMethod(accountType);
      const isWebAuthSupported = this.isWebAuthSupported(accountType);

      return {
        account_id: account.id,
        account_name: account.account_name,
        account_type: accountType,
        app_id: account.app_id,
        bind_method: bindMethod,
        bind_method_description: this.getBindMethodDescription(accountType),
        is_web_auth_supported: isWebAuthSupported,
        features: {
          web_auth: isWebAuthSupported,              // H5网页授权
          verification_code: true,                  // 识别码验证（两种类型都支持）
          auto_get_openid: isWebAuthSupported,      // 自动获取OpenID
          manual_send_code: true,                   // 手动发送识别码
        }
      };
    } catch (error) {
      logger.error('获取公众号信息失败', error);
      throw error;
    }
  }

  /**
   * 判断是否支持H5网页授权
   */
  isWebAuthSupported(accountType: AccountType): boolean {
    return accountType === AccountType.SERVICE;
  }

  /**
   * 获取推荐绑定方式
   */
  getRecommendedBindMethod(accountType: AccountType): BindMethod {
    return accountType === AccountType.SERVICE
      ? BindMethod.WEB_AUTH
      : BindMethod.VERIFICATION_CODE;
  }

  /**
   * 获取绑定方式描述
   */
  getBindMethodDescription(accountType: AccountType): string {
    if (accountType === AccountType.SERVICE) {
      return 'H5网页授权（自动获取，无需操作）';
    } else {
      return '识别码验证（在公众号对话框发送识别码）';
    }
  }

  /**
   * 判断绑定方式是否可用
   */
  isBindMethodAvailable(accountType: AccountType, method: BindMethod): boolean {
    if (method === BindMethod.WEB_AUTH) {
      return this.isWebAuthSupported(accountType);
    }

    if (method === BindMethod.VERIFICATION_CODE) {
      // 两种类型都支持识别码
      return true;
    }

    return false;
  }

  /**
   * 获取公众号类型名称
   */
  getAccountTypeName(accountType: AccountType): string {
    return accountType === AccountType.SERVICE ? '服务号' : '订阅号';
  }
}

// 导出单例
export const accountTypeService = new AccountTypeService();
