/**
 * 公众号配置服务
 * 管理订阅号/服务号的配置信息
 */

import { pool } from '../config/database';

export interface WechatAccountConfig {
  id?: number;
  account_name: string;
  account_id?: string;
  app_id: string;
  app_secret: string;
  account_type: 'subscription' | 'service';
  qr_code_url?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

export class WechatAccountConfigService {
  /**
   * 根据 AppID 获取公众号配置
   */
  async getConfigByAppId(appId: string): Promise<WechatAccountConfig | null> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM wechat_account_configs WHERE app_id = ? AND status = ?',
        [appId, 'active']
      );

      const configs = rows as any[];
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error('获取公众号配置失败:', error);
      return null;
    }
  }

  /**
   * 获取所有启用的公众号配置
   */
  async getAllActiveConfigs(): Promise<WechatAccountConfig[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM wechat_account_configs WHERE status = ? ORDER BY id',
        ['active']
      );

      return rows as WechatAccountConfig[];
    } catch (error) {
      console.error('获取公众号配置列表失败:', error);
      return [];
    }
  }

  /**
   * 根据类型获取公众号配置
   */
  async getConfigsByType(accountType: 'subscription' | 'service'): Promise<WechatAccountConfig[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM wechat_account_configs WHERE account_type = ? AND status = ?',
        [accountType, 'active']
      );

      return rows as WechatAccountConfig[];
    } catch (error) {
      console.error('获取公众号配置失败:', error);
      return [];
    }
  }

  /**
   * 创建或更新公众号配置
   */
  async saveConfig(config: WechatAccountConfig): Promise<boolean> {
    try {
      const existing = await this.getConfigByAppId(config.app_id);

      if (existing) {
        // 更新
        await pool.execute(
          `UPDATE wechat_account_configs
           SET account_name = ?, account_id = ?, app_secret = ?, account_type = ?,
               qr_code_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE app_id = ?`,
          [
            config.account_name,
            config.account_id || null,
            config.app_secret,
            config.account_type,
            config.qr_code_url || null,
            config.status,
            config.app_id
          ]
        );
      } else {
        // 创建
        await pool.execute(
          `INSERT INTO wechat_account_configs
           (account_name, account_id, app_id, app_secret, account_type, qr_code_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            config.account_name,
            config.account_id || null,
            config.app_id,
            config.app_secret,
            config.account_type,
            config.qr_code_url || null,
            config.status
          ]
        );
      }

      return true;
    } catch (error) {
      console.error('保存公众号配置失败:', error);
      return false;
    }
  }

  /**
   * 删除公众号配置（软删除）
   */
  async deleteConfig(appId: string): Promise<boolean> {
    try {
      await pool.execute(
        'UPDATE wechat_account_configs SET status = ? WHERE app_id = ?',
        ['inactive', appId]
      );
      return true;
    } catch (error) {
      console.error('删除公众号配置失败:', error);
      return false;
    }
  }
}

export const wechatAccountConfigService = new WechatAccountConfigService();
