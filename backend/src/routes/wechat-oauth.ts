import { Router, Request, Response } from 'express';
import { WechatService } from '../services/wechat';
import { logger } from '../utils/logger';

const router = Router();

// 微信API返回的数据类型
interface WechatAccessTokenResponse {
  errcode?: number;
  errmsg?: string;
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  openid?: string;
  scope?: string;
}

interface WechatUserInfoResponse {
  errcode?: number;
  errmsg?: string;
  openid?: string;
  nickname?: string;
  sex?: number;
  province?: string;
  city?: string;
  country?: string;
  headimgurl?: string;
  privilege?: string[];
  unionid?: string;
}

/**
 * 微信H5网页授权 - 获取OpenID
 *
 * 使用流程：
 * 1. 前端调用 /auth 接口获取授权URL
 * 2. 用户跳转到授权URL，微信会自动跳转回 /callback
 * 3. 后端用code换取access_token和openid
 * 4. 返回openid给前端
 */

// 1. 生成授权URL
router.get('/auth', (req: Request, res: Response) => {
  const { redirect_uri, scope = 'snsapi_base', state = '' } = req.query;

  if (!redirect_uri) {
    return res.status(400).json({
      success: false,
      message: '缺少redirect_uri参数'
    });
  }

  const appId = process.env.WECHAT_APP_ID;
  if (!appId) {
    return res.status(500).json({
      success: false,
      message: '未配置WECHAT_APP_ID'
    });
  }

  // 构造授权URL
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodeURIComponent(redirect_uri as string)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

  res.json({
    success: true,
    data: {
      auth_url: authUrl
    }
  });
});

// 2. 处理授权回调，获取OpenID
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少code参数'
      });
    }

    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      return res.status(500).json({
        success: false,
        message: '未配置微信公众号参数'
      });
    }

    // 调用微信API，用code换取access_token和openid
    const response = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
    );

    const data = await response.json() as WechatAccessTokenResponse;

    if (data.errcode) {
      logger.error('获取access_token失败', data);
      return res.status(500).json({
        success: false,
        message: data.errmsg || '获取access_token失败',
        error: data
      });
    }

    const { access_token, openid } = data;

    logger.info('获取openid成功', { openid });

    // 如果是snsapi_userinfo授权，可以获取用户信息
    if (req.query.scope === 'snsapi_userinfo') {
      const userInfoResponse = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
      );
      const userInfo = await userInfoResponse.json() as WechatUserInfoResponse;

      if (userInfo.errcode) {
        logger.warn('获取用户信息失败', userInfo);
      } else {
        return res.json({
          success: true,
          data: {
            openid: openid,
            nickname: userInfo.nickname,
            headimgurl: userInfo.headimgurl,
            sex: userInfo.sex,
            province: userInfo.province,
            city: userInfo.city,
            country: userInfo.country
          }
        });
      }
    }

    // 返回openid
    res.json({
      success: true,
      data: {
        openid: openid,
        access_token: access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token
      }
    });

  } catch (error) {
    logger.error('微信授权回调处理失败', error);
    res.status(500).json({
      success: false,
      message: '授权回调处理失败'
    });
  }
});

// 3. 刷新access_token（可选）
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: '缺少refresh_token参数'
      });
    }

    const appId = process.env.WECHAT_APP_ID;

    const response = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refresh_token}`
    );

    const data = await response.json() as WechatAccessTokenResponse;

    if (data.errcode) {
      return res.status(500).json({
        success: false,
        message: data.errmsg || '刷新access_token失败'
      });
    }

    res.json({
      success: true,
      data: {
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
        openid: data.openid
      }
    });

  } catch (error) {
    logger.error('刷新access_token失败', error);
    res.status(500).json({
      success: false,
      message: '刷新access_token失败'
    });
  }
});

export default router;
