import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  errcode?: number;
  errmsg?: string;
}

interface QrCodeResponse {
  errcode: number;
  errmsg: string;
  ticket?: string;
  expire_seconds?: number;
  url?: string;
}

interface UserInfoResponse {
  subscribe: number;
  openid: string;
  nickname?: string;
  sex?: number;
  language?: string;
  city?: string;
  province?: string;
  country?: string;
  headimgurl?: string;
  subscribe_time?: number;
  unionid?: string;
  remark?: string;
  groupid?: number;
  errcode?: number;
  errmsg?: string;
}

interface FollowerListResponse {
  total: number;
  count: number;
  data: {
    openid: string[];
  };
  next_openid: string;
  errcode?: number;
  errmsg?: string;
}

export class WechatService {
  private appId: string;
  private appSecret: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;
  private apiClient: AxiosInstance;

  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    
    this.apiClient = axios.create({
      baseURL: 'https://api.weixin.qq.com/cgi-bin',
      timeout: 30000
    });
  }

  /**
   * 获取access_token
   */
  async getAccessToken(): Promise<string> {
    // 如果token未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await this.apiClient.get<AccessTokenResponse>(
        `/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
      );

      if (response.data.errcode) {
        throw new Error(`获取access_token失败: ${response.data.errmsg}`);
      }

      this.accessToken = response.data.access_token;
      // 提前5分钟过期，避免临界点问题
      this.tokenExpireTime = Date.now() + (response.data.expires_in - 300) * 1000;

      logger.info('获取access_token成功');
      return this.accessToken;
    } catch (error) {
      logger.error('获取access_token失败', error);
      throw error;
    }
  }

  /**
   * 创建带参数二维码
   * @param sceneStr 场景值ID（字符串形式的ID，字符串类型，长度限制为1到64）
   * @param expireSeconds 二维码有效期（秒），最大30天，默认30天
   */
  async createQrCode(sceneStr: string, expireSeconds: number = 2592000): Promise<QrCodeResponse> {
    try {
      const token = await this.getAccessToken();

      const response = await this.apiClient.post<QrCodeResponse>(
        `/qrcode/create?access_token=${token}`,
        {
          expire_seconds: expireSeconds,
          action_name: 'QR_STR_SCENE',
          action_info: {
            scene: {
              scene_str: sceneStr
            }
          }
        }
      );

      if (response.data.errcode !== 0) {
        throw new Error(`创建二维码失败: ${response.data.errmsg}`);
      }

      logger.info('创建二维码成功', { sceneStr });
      return response.data;
    } catch (error) {
      logger.error('创建二维码失败', error);
      throw error;
    }
  }

  /**
   * 获取用户基本信息
   * @param openid 用户唯一标识
   * @param lang 返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语
   */
  async getUserInfo(openid: string, lang: string = 'zh_CN'): Promise<UserInfoResponse> {
    try {
      const token = await this.getAccessToken();

      const response = await this.apiClient.get<UserInfoResponse>(
        `/user/info?access_token=${token}&openid=${openid}&lang=${lang}`
      );

      if (response.data.errcode && response.data.errcode !== 0) {
        throw new Error(`获取用户信息失败: ${response.data.errmsg}`);
      }

      logger.info('获取用户信息成功', { openid });
      return response.data;
    } catch (error) {
      logger.error('获取用户信息失败', error);
      throw error;
    }
  }

  /**
   * 获取关注者列表
   * @param nextOpenid 第一个拉取的OPENID，不填默认从头开始拉取
   */
  async getFollowerList(nextOpenid: string = ''): Promise<FollowerListResponse> {
    try {
      const token = await this.getAccessToken();

      const url = nextOpenid 
        ? `/user/get?access_token=${token}&next_openid=${nextOpenid}`
        : `/user/get?access_token=${token}`;

      const response = await this.apiClient.get<FollowerListResponse>(url);

      if (response.data.errcode && response.data.errcode !== 0) {
        throw new Error(`获取关注者列表失败: ${response.data.errmsg}`);
      }

      logger.info('获取关注者列表成功', { count: response.data.count });
      return response.data;
    } catch (error) {
      logger.error('获取关注者列表失败', error);
      throw error;
    }
  }

  /**
   * 批量获取用户基本信息
   * @param userList 用户列表，最多100个
   */
  async batchGetUserInfo(userList: { openid: string; lang?: string }[]): Promise<UserInfoResponse[]> {
    try {
      const token = await this.getAccessToken();

      const response = await this.apiClient.post<{ user_info_list: UserInfoResponse[] }>(
        `/user/info/batchget?access_token=${token}`,
        {
          user_list: userList
        }
      );

      if (response.data.errcode && response.data.errcode !== 0) {
        throw new Error(`批量获取用户信息失败: ${response.data.errmsg}`);
      }

      logger.info('批量获取用户信息成功', { count: userList.length });
      return response.data.user_info_list;
    } catch (error) {
      logger.error('批量获取用户信息失败', error);
      throw error;
    }
  }

  /**
   * 发送客服消息
   * @param openid 用户openid
   * @param msgType 消息类型：text, image, voice, video, news, mpnews
   * @param data 消息数据
   */
  async sendCustomMessage(openid: string, msgType: string, data: any): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.apiClient.post(
        `/message/custom/send?access_token=${token}`,
        {
          touser: openid,
          msgtype: msgType,
          [msgType]: data
        }
      );

      if (response.data.errcode && response.data.errcode !== 0) {
        throw new Error(`发送客服消息失败: ${response.data.errmsg}`);
      }

      logger.info('发送客服消息成功', { openid, msgType });
      return response.data;
    } catch (error) {
      logger.error('发送客服消息失败', error);
      throw error;
    }
  }

  /**
   * 刷新access_token
   */
  async refreshToken(): Promise<void> {
    this.accessToken = null;
    this.tokenExpireTime = 0;
    await this.getAccessToken();
  }
}

// 创建微信服务实例
export function createWechatService(appId: string, appSecret: string): WechatService {
  return new WechatService(appId, appSecret);
}

// 导出类型
export type { AccessTokenResponse, QrCodeResponse, UserInfoResponse, FollowerListResponse };
