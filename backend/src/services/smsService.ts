/**
 * 短信服务 - 阿里云短信
 * 文档：https://help.aliyun.com/document_detail/101414.html
 */

import Dysmsapi from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import { logger } from '../utils/logger';

interface SendSmsOptions {
  phone: string;
  code: string;
}

export class SmsService {
  private client: Dysmsapi;
  private signName: string;
  private templateCode: string;

  constructor() {
    // 检查环境变量
    if (!process.env.ALIYUN_ACCESS_KEY_ID || !process.env.ALIYUN_ACCESS_KEY_SECRET) {
      logger.warn('阿里云短信配置未找到，短信功能将不可用');
    }

    const config = new $OpenApi.Config({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    });
    config.endpoint = 'dysmsapi.aliyuncs.com';
    this.client = new Dysmsapi(config);
    
    this.signName = process.env.ALIYUN_SMS_SIGN_NAME || '你的签名';
    this.templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_123456789';
  }

  /**
   * 发送验证码短信
   * @param phone 手机号
   * @param code 验证码
   * @returns 是否发送成功
   */
  async sendCode(phone: string, code: string): Promise<boolean> {
    try {
      // 检查配置
      if (!process.env.ALIYUN_ACCESS_KEY_ID) {
        logger.error('阿里云短信未配置');
        return false;
      }

      const request = new Dysmsapi.SendSmsRequest({
        phoneNumbers: phone,
        signName: this.signName,
        templateCode: this.templateCode,
        templateParam: JSON.stringify({ code }),
      });

      const response = await this.client.sendSms(request);
      
      if (response.body?.code === 'OK') {
        logger.info('短信发送成功', { phone, code });
        return true;
      } else {
        logger.error('短信发送失败', {
          phone,
          code: response.body?.code,
          message: response.body?.message,
        });
        return false;
      }
    } catch (error: any) {
      logger.error('短信发送异常', { error: error.message, phone });
      return false;
    }
  }

  /**
   * 发送通知短信（自定义模板）
   * @param phone 手机号
   * @param templateCode 模板代码
   * @param params 模板参数
   * @returns 是否发送成功
   */
  async sendNotification(
    phone: string,
    templateCode: string,
    params: Record<string, string>
  ): Promise<boolean> {
    try {
      const request = new Dysmsapi.SendSmsRequest({
        phoneNumbers: phone,
        signName: this.signName,
        templateCode: templateCode,
        templateParam: JSON.stringify(params),
      });

      const response = await this.client.sendSms(request);
      
      if (response.body?.code === 'OK') {
        logger.info('通知短信发送成功', { phone, templateCode });
        return true;
      } else {
        logger.error('通知短信发送失败', {
          phone,
          code: response.body?.code,
          message: response.body?.message,
        });
        return false;
      }
    } catch (error: any) {
      logger.error('通知短信发送异常', { error: error.message, phone });
      return false;
    }
  }

  /**
   * 批量发送短信
   * @param phones 手机号数组
   * @param code 验证码
   * @returns 发送结果
   */
  async sendBatchCode(phones: string[], code: string): Promise<{
    success: number;
    failed: number;
    details: Array<{ phone: string; success: boolean }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      details: [] as Array<{ phone: string; success: boolean }>,
    };

    for (const phone of phones) {
      const success = await this.sendCode(phone, code);
      results.details.push({ phone, success });
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    return results;
  }
}

// 导出单例
export default new SmsService();
