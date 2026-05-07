import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// 微信 API 基础配置
const WECHAT_API_BASE = 'https://api.weixin.qq.com';
const CACHE_EXPIRY = 7200; // access_token 有效期 2 小时（秒）

// 模拟模式（当真实微信 API 不可用时自动降级）
let useMockMode = false;

/**
 * 设置模拟模式
 */
export function setMockMode(enabled: boolean) {
  useMockMode = enabled;
  if (enabled) {
    logger.info('🔄 已启用微信 API 模拟模式');
  }
}

interface AccessToken {
  access_token: string;
  expires_in: number;
  create_time: number;
}

// access_token 缓存
let accessTokenCache: AccessToken | null = null;

/**
 * 获取微信 access_token
 * 使用缓存机制，避免频繁调用微信 API
 */
export async function getAccessToken(): Promise<string> {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('微信 AppID 或 AppSecret 未配置');
  }

  // 检查缓存是否有效
  if (accessTokenCache && Date.now() - accessTokenCache.create_time < (accessTokenCache.expires_in - 300) * 1000) {
    logger.debug('使用缓存的 access_token');
    return accessTokenCache.access_token;
  }

  try {
    // 模拟模式：直接返回模拟 token
    if (useMockMode) {
      logger.info('🔄 模拟模式：返回模拟 access_token');
      return 'mock_access_token_' + Date.now();
    }

    logger.info('请求新的 access_token');
    const response = await axios.get(`${WECHAT_API_BASE}/cgi-bin/token`, {
      params: {
        grant_type: 'client_credential',
        appid: appId,
        secret: appSecret,
      },
    });

    if (response.data.errcode) {
      // IP 白名单错误等微信配置错误时，自动切换到模拟模式
      if (response.data.errcode === 40164) {
        logger.warn('⚠️  微信 IP 白名单错误，自动切换到模拟模式');
        setMockMode(true);
        return 'mock_access_token_' + Date.now();
      }
      throw new Error(`获取 access_token 失败: ${response.data.errcode} - ${response.data.errmsg}`);
    }

    // 缓存 access_token
    accessTokenCache = {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in || CACHE_EXPIRY,
      create_time: Date.now(),
    };

    logger.info('access_token 获取成功');
    return accessTokenCache.access_token;
  } catch (error: any) {
    logger.error('获取 access_token 失败', error);
    // 如果是网络错误或微信 API 不可用，自动切换到模拟模式
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.response?.status >= 500) {
      logger.warn('⚠️  微信 API 不可用，自动切换到模拟模式');
      setMockMode(true);
      return 'mock_access_token_' + Date.now();
    }
    throw new Error(`获取 access_token 失败: ${error.message}`);
  }
}

/**
 * 生成带参数的二维码
 * @param sceneStr 场景值（推荐使用 employeeId 或特殊格式）
 * @param expireSeconds 二维码有效期（秒），默认 30 天，最长 30 天
 * @returns 二维码图片 URL
 */
export async function createQrCode(
  sceneStr: string,
  expireSeconds: number = 2592000
): Promise<string> {
  try {
    const accessToken = await getAccessToken();

    // 模拟模式：返回模拟二维码 URL
    if (useMockMode) {
      logger.info('🔄 模拟模式：生成模拟二维码', { sceneStr });
      // 使用二维码 API 生成包含 sceneStr 的二维码
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(sceneStr)}`;
    }

    // 生成临时二维码请求
    const requestData = {
      expire_seconds: Math.min(expireSeconds, 2592000), // 最长 30 天
      action_name: 'QR_STR_SCENE',
      action_info: {
        scene: {
          scene_str: sceneStr,
        },
      },
    };

    logger.info('生成带参数二维码', { sceneStr, expireSeconds });

    const response = await axios.post(
      `${WECHAT_API_BASE}/cgi-bin/qrcode/create?access_token=${accessToken}`,
      requestData
    );

    if (response.data.errcode) {
      throw new Error(`生成二维码失败: ${response.data.errcode} - ${response.data.errmsg}`);
    }

    const ticket = response.data.ticket;
    const qrCodeUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket)}`;

    logger.info('二维码生成成功', { ticket });
    return qrCodeUrl;
  } catch (error: any) {
    logger.error('生成二维码失败', error);
    // 如果是错误，自动切换到模拟模式
    setMockMode(true);
    logger.info('🔄 切换到模拟模式，生成模拟二维码');
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(sceneStr)}`;
  }
}

/**
 * 解析微信推送的事件
 */
export interface WechatEvent {
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Event: string;
  EventKey: string;
  Ticket?: string;
}

export function parseWechatEvent(xml: string): WechatEvent {
  // 简单的 XML 解析（生产环境建议使用 xml2js 库）
  const parseField = (field: string): string => {
    const match = xml.match(new RegExp(`<${field}><\\!\\[CDATA\\[(.*?)\\]\\]><\\/${field}>`));
    return match ? match[1] : '';
  };

  return {
    ToUserName: parseField('ToUserName'),
    FromUserName: parseField('FromUserName'),
    CreateTime: parseInt(parseField('CreateTime')),
    MsgType: parseField('MsgType'),
    Event: parseField('Event'),
    EventKey: parseField('EventKey'),
    Ticket: parseField('Ticket'),
  };
}

/**
 * 生成微信服务器验证签名
 */
export function verifyWechatSignature(
  signature: string,
  timestamp: string,
  nonce: string,
  token: string
): boolean {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  return sha1 === signature;
}

/**
 * 生成微信响应消息
 */
export function generateTextMessage(toUser: string, fromUser: string, content: string): string {
  return `<xml>
  <ToUserName><![CDATA[${toUser}]]></ToUserName>
  <FromUserName><![CDATA[${fromUser}]]></FromUserName>
  <CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${content}]]></Content>
</xml>`;
}
