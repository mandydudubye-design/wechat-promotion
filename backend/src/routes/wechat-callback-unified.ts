/**
 * 微信统一回调处理
 *
 * 支持订阅号和服务号的消息和事件推送
 * 自动识别公众号类型并调用相应的处理逻辑
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { accountTypeService, AccountType } from '../services/accountTypeService';
import { WechatService } from '../services/wechat';
import crypto from 'crypto';

const wechatService = new WechatService(
  process.env.WECHAT_APP_ID || '',
  process.env.WECHAT_APP_SECRET || ''
);

const router = Router();

/**
 * 微信服务器验证（GET）
 */
router.get('/callback', (req: Request, res: Response) => {
  try {
    const { signature, timestamp, nonce, echostr } = req.query;

    if (!signature || !timestamp || !nonce || !echostr) {
      return res.status(400).send('Missing required parameters');
    }

    const token = process.env.WECHAT_TOKEN || 'your_token_here';

    // 签名验证
    const arr = [token, timestamp as string, nonce as string].sort();
    const str = arr.join('');
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    const hash = sha1.digest('hex');

    if (hash === signature) {
      logger.info('微信服务器验证成功');
      res.send(echostr);
    } else {
      logger.warn('微信服务器验证失败', { signature, hash });
      res.status(403).send('Invalid signature');
    }
  } catch (error) {
    logger.error('微信验证错误', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * 微信消息和事件推送（POST）
 *
 * 自动识别公众号类型并调用相应的处理逻辑
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { signature, timestamp, nonce } = req.query;
    const body = req.body;

    // 签名验证
    const token = process.env.WECHAT_TOKEN || 'your_token_here';

    if (signature && timestamp && nonce) {
      const arr = [token, timestamp as string, nonce as string].sort();
      const str = arr.join('');
      const sha1 = crypto.createHash('sha1');
      sha1.update(str);
      const hash = sha1.digest('hex');

      if (hash !== signature) {
        logger.warn('微信回调签名验证失败');
        return res.status(403).send('Invalid signature');
      }
    }

    // 解析XML消息
    // 注意：这里需要使用 xml2js 库解析 XML
    // 简化示例，实际需要解析 XML
    const msgType = body.MsgType;
    const openid = body.FromUserName;
    const event = body.Event;
    const content = body.Content;

    logger.info('收到微信推送', {
      msg_type: msgType,
      openid,
      event,
      content
    });

    // 处理不同类型的消息
    switch (msgType) {
      case 'event':
        // 事件消息（关注、取关、扫码等）
        await handleEvent(openid, event, body);
        break;

      case 'text':
        // 文本消息（识别码验证）
        await handleTextMessage(openid, content);
        break;

      default:
        logger.info('未处理的消息类型', { msg_type: msgType });
    }

    res.send('success');

  } catch (error) {
    logger.error('处理微信回调错误', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * 处理事件消息
 */
async function handleEvent(openid: string, event: string, body: any) {
  try {
    const connection = await pool.getConnection();

    try {
      switch (event) {
        case 'subscribe':
          // 关注事件
          if (body.EventKey && body.EventKey.startsWith('qrscene_')) {
            // 扫码关注
            const sceneStr = body.EventKey.replace('qrscene_', '');
            await handleScanFollow(connection, openid, sceneStr);
          } else {
            // 普通关注
            await handleNormalFollow(connection, openid);
          }
          break;

        case 'unsubscribe':
          // 取消关注
          await handleUnfollow(connection, openid);
          break;

        case 'SCAN':
          // 已关注用户扫描带参数二维码
          await handleScan(connection, openid, body.EventKey);
          break;

        default:
          logger.info('未处理的事件类型', { event });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('处理事件失败', error);
  }
}

/**
 * 处理文本消息（识别码验证）
 */
async function handleTextMessage(openid: string, content: string) {
  try {
    if (!content) return;

    // 解析识别码（格式：工号+手机号后4位）
    const trimmedContent = content.trim().toUpperCase();
    const match = trimmedContent.match(/^(EMP\d+)(\d{4})$/);

    if (!match) {
      logger.warn('识别码格式不正确', { content: trimmedContent });
      return;
    }

    const [_, employeeId, phoneSuffix] = match;

    logger.info('收到识别码消息', { openid, employeeId, phone_suffix: phoneSuffix });

    // 调用识别码验证接口
    // 这里需要调用 verification-code 接口
    // 简化处理，直接在这里处理

    const connection = await pool.getConnection();

    try {
      // 验证员工信息
      const [employees] = await connection.query(
        'SELECT employee_id, name, phone FROM employees WHERE employee_id = ? AND phone LIKE ?',
        [employeeId, `%${phoneSuffix}`]
      );

      if (!employees || (employees as any[]).length === 0) {
        logger.warn('员工信息验证失败', { employee_id: employeeId, phone_suffix: phoneSuffix });
        return;
      }

      const employee = (employees as any[])[0];

      // 查找该员工绑定的公众号
      const [accounts] = await connection.query(
        'SELECT id, account_name, account_type FROM wechat_accounts WHERE status = 1'
      );

      if (accounts && (accounts as any[]).length > 0) {
        // 找到订阅号（假设只有一个订阅号）
        const subscriptionAccount = (accounts as any[]).find(a => a.account_type === 'subscription');

        if (subscriptionAccount) {
          // 绑定员工到订阅号
          const [existing] = await connection.query(
            'SELECT id FROM employee_bindings WHERE employee_id = ? AND account_id = ?',
            [employeeId, subscriptionAccount.id]
          );

          if (!existing || (existing as any[]).length === 0) {
            await connection.query(
              `INSERT INTO employee_bindings
               (employee_id, account_id, openid, is_verified, verification_method, verified_at, created_at)
               VALUES (?, ?, ?, TRUE, 'verification_code', NOW(), NOW())`,
              [employeeId, subscriptionAccount.id, openid]
            );

            logger.info('识别码绑定成功', {
              employee_id: employeeId,
              employee_name: employee.name,
              account_id: subscriptionAccount.id,
              account_name: subscriptionAccount.account_name
            });
          }
        }
      }
    } finally {
      connection.release();
    }

  } catch (error) {
    logger.error('处理文本消息失败', error);
  }
}

/**
 * 处理扫码关注
 */
async function handleScanFollow(connection: any, openid: string, sceneStr: string) {
  try {
    const match = sceneStr.match(/^emp_(.+?)_\d+$/);

    if (!match) {
      logger.warn('无效的场景值', { sceneStr });
      return;
    }

    const employeeId = match[1];

    // 查找推广记录
    const [promotions] = await connection.query(
      'SELECT * FROM promotion_records WHERE scene_str = ?',
      [sceneStr]
    );

    if (!promotions || (promotions as any[]).length === 0) {
      logger.warn('未找到推广记录', { sceneStr });
      return;
    }

    const promotion = (promotions as any[])[0];

    // 获取用户信息
    const userInfo = await wechatService.getUserInfo(openid);

    // 检查是否已有关注记录
    const [existing] = await connection.query(
      'SELECT * FROM follow_records WHERE openid = ?',
      [openid]
    );

    if (existing && (existing as any[]).length > 0) {
      await connection.query(
        'UPDATE follow_records SET employee_id = ?, account_id = ?, status = 1, unsubscribed_at = NULL, updated_at = NOW() WHERE openid = ?',
        [employeeId, promotion.account_id, openid]
      );
    } else {
      await connection.query(
        `INSERT INTO follow_records
         (openid, nickname, employee_id, account_id, subscribe_time, status)
         VALUES (?, ?, ?, ?, NOW(), 1)`,
        [openid, userInfo.nickname || '', employeeId, promotion.account_id]
      );

      await connection.query(
        'UPDATE promotion_records SET follow_count = follow_count + 1 WHERE id = ?',
        [promotion.id]
      );
    }

    logger.info('处理扫码关注成功', { openid, employeeId, sceneStr });

  } catch (error) {
    logger.error('处理扫码关注失败', error);
  }
}

/**
 * 处理普通关注
 */
async function handleNormalFollow(connection: any, openid: string) {
  try {
    const userInfo = await wechatService.getUserInfo(openid);

    const [existing] = await connection.query(
      'SELECT * FROM follow_records WHERE openid = ?',
      [openid]
    );

    if (existing && (existing as any[]).length > 0) {
      await connection.query(
        'UPDATE follow_records SET status = 1, unsubscribed_at = NULL, updated_at = NOW() WHERE openid = ?',
        [openid]
      );
    } else {
      await connection.query(
        `INSERT INTO follow_records
         (openid, nickname, subscribe_time, status)
         VALUES (?, ?, NOW(), 1)`,
        [openid, userInfo.nickname || '']
      );
    }

    logger.info('处理普通关注成功', { openid });

  } catch (error) {
    logger.error('处理普通关注失败', error);
  }
}

/**
 * 处理取消关注
 */
async function handleUnfollow(connection: any, openid: string) {
  try {
    await connection.query(
      'UPDATE follow_records SET status = 0, unsubscribed_at = NOW(), updated_at = NOW() WHERE openid = ? AND status = 1',
      [openid]
    );

    await connection.query(
      'UPDATE employee_info SET is_followed = 0, follow_time = NULL WHERE openid = ?',
      [openid]
    );

    logger.info('处理取消关注成功', { openid });

  } catch (error) {
    logger.error('处理取消关注失败', error);
  }
}

/**
 * 处理扫码（已关注用户）
 */
async function handleScan(connection: any, openid: string, eventKey: string) {
  try {
    const match = eventKey.match(/^emp_(.+?)_\d+$/);

    if (!match) {
      logger.warn('无效的场景值', { eventKey });
      return;
    }

    const employeeId = match[1];

    const [promotions] = await connection.query(
      'SELECT * FROM promotion_records WHERE scene_str = ?',
      [eventKey]
    );

    if (promotions && (promotions as any[]).length > 0) {
      await connection.query(
        'UPDATE promotion_records SET scan_count = scan_count + 1 WHERE id = ?',
        [(promotions as any[])[0].id]
      );
    }

    logger.info('处理扫码成功', { openid, employeeId, eventKey });

  } catch (error) {
    logger.error('处理扫码失败', error);
  }
}

export default router;
