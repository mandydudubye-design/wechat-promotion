import express from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import {
  parseWechatEvent,
  verifyWechatSignature,
  generateTextMessage,
} from '../services/wechatService';

const router = express.Router();

/**
 * 解析微信推送的 XML 中的文本消息内容
 */
function parseTextContent(xml: string): string {
  const match = xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/);
  return match ? match[1].trim() : '';
}

/**
 * 微信服务器验证接口
 * GET /api/wechat/webhook?signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx
 */
router.get('/webhook', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  const token = process.env.WECHAT_TOKEN;

  if (!token) {
    logger.error('WECHAT_TOKEN 未配置');
    return res.status(500).send('服务器配置错误');
  }

  if (!verifyWechatSignature(signature as string, timestamp as string, nonce as string, token)) {
    logger.warn('微信签名验证失败', { signature, timestamp, nonce });
    return res.status(403).send('签名验证失败');
  }

  logger.info('微信服务器验证成功');
  res.send(echostr);
});

/**
 * 接收微信推送事件和消息
 * POST /api/wechat/webhook
 *
 * 支持的事件类型：
 * - subscribe: 用户关注
 * - SCAN: 扫描带参数二维码（已关注用户）
 * - unsubscribe: 用户取消关注
 * - 文本消息: 用户发送推广码（员工工号）
 */
router.post('/webhook', async (req, res) => {
  try {
    const xml = req.body;
    logger.info('收到微信推送');

    const event = parseWechatEvent(xml);
    const msgType = event.MsgType;

    logger.info('解析推送', {
      msgType,
      eventType: event.Event,
      fromUser: event.FromUserName,
      eventKey: event.EventKey,
    });

    let replyContent = '感谢关注！';

    // 处理事件消息
    if (msgType === 'event') {
      if (event.Event === 'subscribe') {
        replyContent = await handleSubscribeEvent(event);
      } else if (event.Event === 'SCAN') {
        await handleScanEvent(event);
      } else if (event.Event === 'unsubscribe') {
        await handleUnsubscribeEvent(event);
        // 取关不回复消息
        return res.send('success');
      }
    }

    // 处理文本消息（推广码识别）
    if (msgType === 'text') {
      const textContent = parseTextContent(xml);
      replyContent = await handleTextMessage(event.FromUserName, textContent);
    }

    const reply = generateTextMessage(event.FromUserName, event.ToUserName, replyContent);
    res.set('Content-Type', 'application/xml');
    res.send(reply);
  } catch (error: any) {
    logger.error('处理微信推送失败', error);
    res.send('success');
  }
});

/**
 * 处理关注事件
 * 订阅号关注事件不携带 scene 信息（没有带参数二维码），
 * 所以只记录用户关注，不创建推广归因。
 * 推广归因通过用户回复推广码（文本消息）来实现。
 */
async function handleSubscribeEvent(event: any): Promise<string> {
  try {
    const { FromUserName: openid } = event;

    logger.info('用户关注公众号', { openid });

    // 保存或更新用户信息
    await pool.query(
      `INSERT INTO wechat_users (openid, is_subscribed, subscribe_time, updated_at)
       VALUES (?, TRUE, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
       is_subscribed = TRUE,
       subscribe_time = NOW(),
       updated_at = NOW()`,
      [openid]
    );

    return '感谢关注！回复员工推广码即可完成推广归因~';
  } catch (error: any) {
    logger.error('处理关注事件失败', error);
    return '感谢关注！';
  }
}

/**
 * 处理扫描带参数二维码事件（服务号场景，订阅号不适用）
 */
async function handleScanEvent(event: any) {
  try {
    const { FromUserName: openid, EventKey: eventKey } = event;

    logger.info('用户扫描二维码', { openid, eventKey });

    if (eventKey) {
      const parts = eventKey.split('_');
      const promoterId = parts[0];

      if (promoterId) {
        await pool.query(
          `INSERT INTO promotion_records (promoter_id, follower_openid, follow_time, source)
           VALUES (?, ?, NOW(), 'qrcode')
           ON DUPLICATE KEY UPDATE follow_time = NOW()`,
          [promoterId, openid]
        );

        await pool.query(
          `UPDATE employees SET promotion_count = COALESCE(promotion_count, 0) + 1 WHERE employee_id = ?`,
          [promoterId]
        );

        logger.info('创建推广记录成功（扫描事件）', { promoterId, openid });
      }
    }
  } catch (error: any) {
    logger.error('处理扫描事件失败', error);
  }
}

/**
 * 处理取消关注事件
 * 同时更新 follow_records 中该用户的关注状态
 */
async function handleUnsubscribeEvent(event: any) {
  try {
    const { FromUserName: openid } = event;

    logger.info('用户取消关注', { openid });

    // 更新 wechat_users 关注状态
    await pool.query(
      `UPDATE wechat_users
       SET is_subscribed = FALSE, unsubscribe_time = NOW(), updated_at = NOW()
       WHERE openid = ?`,
      [openid]
    );

    // 更新 follow_records 中该用户的所有记录为已取关
    await pool.query(
      `UPDATE follow_records
       SET subscribe_status = 'unsubscribed', last_event_at = NOW()
       WHERE wechat_openid = ? AND subscribe_status = 'subscribed'`,
      [openid]
    );

    logger.info('用户取关状态更新完成', { openid });
  } catch (error: any) {
    logger.error('处理取消关注事件失败', error);
  }
}

/**
 * 处理文本消息 —— 推广码识别
 * 用户在公众号对话框回复员工工号（推广码），系统：
 * 1. 查找匹配的员工
 * 2. 创建 follow_record（推广归因）
 * 3. 更新员工推广计数
 *
 * @returns 回复给用户的文本消息
 */
async function handleTextMessage(openid: string, content: string): Promise<string> {
  try {
    if (!content) return '请输入推广码';

    // 查找推广码对应的员工（推广码 = 员工工号）
    const [employees] = await pool.query(
      'SELECT employee_id, name FROM employees WHERE employee_id = ? AND status = 1',
      [content]
    );

    if ((employees as any[]).length === 0) {
      logger.info('推广码未匹配到员工', { openid, content });
      return '推广码无效，请确认后重新输入。';
    }

    const employee = (employees as any[])[0];

    // 检查是否已经通过该推广码归因过
    const [existing] = await pool.query(
      `SELECT id FROM follow_records
       WHERE wechat_openid = ? AND promotion_code = ? AND employee_id = ?`,
      [openid, content, employee.employee_id]
    );

    if ((existing as any[]).length > 0) {
      return `您已通过 ${employee.name} 的推广码归因，无需重复操作。`;
    }

    // 获取用户昵称
    const [users] = await pool.query(
      'SELECT nickname FROM wechat_users WHERE openid = ?',
      [openid]
    );
    const nickname = (users as any[]).length > 0 ? (users as any[])[0].nickname : null;

    // 创建 follow_record
    await pool.query(
      `INSERT INTO follow_records
       (employee_id, promotion_code, wechat_openid, wechat_nickname, subscribe_status, first_reply_at, last_event_at, created_at)
       VALUES (?, ?, ?, ?, 'subscribed', NOW(), NOW(), NOW())`,
      [employee.employee_id, content, openid, nickname]
    );

    // 更新员工推广计数
    await pool.query(
      `UPDATE employees SET promotion_count = COALESCE(promotion_count, 0) + 1, last_promotion_time = NOW()
       WHERE employee_id = ?`,
      [employee.employee_id]
    );

    // 同步更新 wechat_users 的 promoter_id
    await pool.query(
      `UPDATE wechat_users SET promoter_id = ?, scene_str = ? WHERE openid = ?`,
      [employee.employee_id, content, openid]
    );

    logger.info('推广码归因成功', {
      openid,
      promotionCode: content,
      employeeId: employee.employee_id,
      employeeName: employee.name,
    });

    return `归因成功！您已通过 ${employee.name} 的推广关注本公众号。`;
  } catch (error: any) {
    logger.error('处理推广码失败', { openid, content, error: error.message });
    return '系统繁忙，请稍后重试。';
  }
}

/**
 * 模拟关注事件（用于测试）
 * POST /api/wechat/simulate/subscribe
 */
router.post('/simulate/subscribe', async (req, res) => {
  try {
    const { openid, promoterId, sceneStr } = req.body;

    if (!openid) {
      return res.status(400).json({
        code: 400,
        message: 'openid 参数必填',
        timestamp: Date.now(),
      });
    }

    logger.info('模拟关注事件', { openid, promoterId, sceneStr });

    // 保存或更新用户信息
    await pool.query(
      `INSERT INTO wechat_users (openid, is_subscribed, subscribe_time, updated_at, promoter_id, scene_str)
       VALUES (?, TRUE, NOW(), NOW(), ?, ?)
       ON DUPLICATE KEY UPDATE
       is_subscribed = TRUE,
       subscribe_time = NOW(),
       updated_at = NOW(),
       promoter_id = ?,
       scene_str = ?`,
      [openid, promoterId || null, sceneStr || null, promoterId || null, sceneStr || null]
    );

    // 如果有推广人，创建推广记录
    if (promoterId) {
      await pool.query(
        `INSERT INTO promotion_records (promoter_id, follower_openid, follow_time, source)
         VALUES (?, ?, NOW(), 'qrcode')
         ON DUPLICATE KEY UPDATE
         follow_time = NOW()`,
        [promoterId, openid]
      );

      // 更新推广人的推广数量
      await pool.query(
        `UPDATE employees
         SET promotion_count = promotion_count + 1
         WHERE employee_id = ?`,
        [promoterId]
      );

      logger.info('创建推广记录成功（模拟）', { promoterId, openid });
    }

    res.json({
      code: 200,
      message: '模拟关注成功',
      timestamp: Date.now(),
      data: {
        openid,
        promoterId,
        sceneStr,
      },
    });
  } catch (error: any) {
    logger.error('模拟关注失败', error);
    res.status(500).json({
      code: 500,
      message: '模拟关注失败',
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

export default router;
