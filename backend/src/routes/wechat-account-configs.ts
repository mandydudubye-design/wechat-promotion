/**
 * 公众号配置管理路由
 *
 * 提供订阅号/服务号配置的增删改查接口
 */

import { Router, Request, Response } from 'express';
import { wechatAccountConfigService } from '../services/wechatAccountConfigService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * 获取所有公众号配置
 * GET /api/wechat-configs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const configs = await wechatAccountConfigService.getAllActiveConfigs();

    res.json({
      code: 200,
      message: '获取成功',
      data: configs
    });
  } catch (error: any) {
    logger.error('获取公众号配置失败', error);
    res.status(500).json({
      code: 500,
      message: '获取公众号配置失败',
      error: error.message
    });
  }
});

/**
 * 根据 AppID 获取公众号配置
 * GET /api/wechat-configs/:appId
 */
router.get('/:appId', async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const config = await wechatAccountConfigService.getConfigByAppId(appId);

    if (!config) {
      return res.status(404).json({
        code: 404,
        message: '公众号配置不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: config
    });
  } catch (error: any) {
    logger.error('获取公众号配置失败', error);
    res.status(500).json({
      code: 500,
      message: '获取公众号配置失败',
      error: error.message
    });
  }
});

/**
 * 根据类型获取公众号配置
 * GET /api/wechat-configs/type/:type
 */
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    if (type !== 'subscription' && type !== 'service') {
      return res.status(400).json({
        code: 400,
        message: '无效的公众号类型，必须是 subscription 或 service'
      });
    }

    const configs = await wechatAccountConfigService.getConfigsByType(
      type as 'subscription' | 'service'
    );

    res.json({
      code: 200,
      message: '获取成功',
      data: configs
    });
  } catch (error: any) {
    logger.error('获取公众号配置失败', error);
    res.status(500).json({
      code: 500,
      message: '获取公众号配置失败',
      error: error.message
    });
  }
});

/**
 * 创建或更新公众号配置
 * POST /api/wechat-configs
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      account_name,
      account_id,
      app_id,
      app_secret,
      account_type,
      qr_code_url,
      status = 'active'
    } = req.body;

    // 验证必填字段
    if (!account_name || !app_id || !app_secret || !account_type) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段：account_name, app_id, app_secret, account_type'
      });
    }

    // 验证公众号类型
    if (account_type !== 'subscription' && account_type !== 'service') {
      return res.status(400).json({
        code: 400,
        message: '无效的公众号类型，必须是 subscription 或 service'
      });
    }

    const success = await wechatAccountConfigService.saveConfig({
      account_name,
      account_id,
      app_id,
      app_secret,
      account_type,
      qr_code_url,
      status
    });

    if (success) {
      const config = await wechatAccountConfigService.getConfigByAppId(app_id);
      res.json({
        code: 200,
        message: '保存成功',
        data: config
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '保存公众号配置失败'
      });
    }
  } catch (error: any) {
    logger.error('保存公众号配置失败', error);
    res.status(500).json({
      code: 500,
      message: '保存公众号配置失败',
      error: error.message
    });
  }
});

/**
 * 删除公众号配置
 * DELETE /api/wechat-configs/:appId
 */
router.delete('/:appId', async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const success = await wechatAccountConfigService.deleteConfig(appId);

    if (success) {
      res.json({
        code: 200,
        message: '删除成功'
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '删除公众号配置失败'
      });
    }
  } catch (error: any) {
    logger.error('删除公众号配置失败', error);
    res.status(500).json({
      code: 500,
      message: '删除公众号配置失败',
      error: error.message
    });
  }
});

export default router;
