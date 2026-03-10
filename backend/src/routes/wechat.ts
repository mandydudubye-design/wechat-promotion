import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';
import crypto from 'crypto';

const router = Router();

// 微信服务器验证
router.get('/callback', (req: Request, res: Response) => {
  try {
    const { signature, timestamp, nonce, echostr } = req.query;

    // 你的Token（需要在微信公众号后台配置）
    const token = process.env.WECHAT_TOKEN || 'your_token_here';

    if (!signature || !timestamp || !nonce || !echostr) {
      return res.status(400).send('Missing required parameters');
    }

    // 将token、timestamp、nonce三个参数进行字典序排序
    const arr = [token, timestamp, nonce].sort();
    const str = arr.join('');

    // 进行sha1加密
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    const hash = sha1.digest('hex');

    // 加密后的字符串与signature对比
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

// 微信消息和事件推送
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { signature, timestamp, nonce } = req.query;
    const body = req.body;

    // 验证签名
    const token = process.env.WECHAT_TOKEN || 'your_token_here';
    
    if (signature && timestamp && nonce) {
      const arr = [token, timestamp, nonce].sort();
      const str = arr.join('');
      const sha1 = crypto.createHash('sha1');
      sha1.update(str);
      const hash = sha1.digest('hex');

      if (hash !== signature) {
        logger.warn('微信回调签名验证失败');
        return res.status(403).send('Invalid signature');
      }
    }

    // 解析XML消息（这里简化处理，实际需要使用xml2js等库）
    logger.info('收到微信推送', { body });

    // TODO: 解析XML获取消息类型和事件
    // const xml = await parseXML(body);
    
    // 模拟处理不同事件
    const mockEvent = {
      ToUserName: 'gh_xxxxx',
      FromUserName: 'openid_xxxxx',
      CreateTime: Math.floor(Date.now() / 1000),
      MsgType: 'event',
      Event: 'subscribe', // subscribe(订阅), unsubscribe(取消订阅), SCAN(扫描带参数二维码)
      EventKey: 'qrscene_EMP001_1234567890' // 场景值
    };

    const eventType = mockEvent.Event;
    const openid = mockEvent.FromUserName;
    const eventKey = mockEvent.EventKey || '';

    await handleWechatEvent(eventType, openid, eventKey);

    // 返回成功响应
    res.send('success');
  } catch (error) {
    logger.error('处理微信回调错误', error);
    res.status(500).send('Internal Server Error');
  }
});

// 处理微信事件
async function handleWechatEvent(eventType: string, openid: string, eventKey: string) {
  try {
    const connection = await pool.getConnection();

    try {
      switch (eventType) {
        case 'subscribe':
          // 关注事件
          if (eventKey.startsWith('qrscene_')) {
            // 扫码关注
            const sceneStr = eventKey.replace('qrscene_', '');
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
          await handleScan(connection, openid, eventKey);
          break;

        default:
          logger.info('未处理的事件类型', { eventType });
      }

      // 记录事件日志
      await connection.query(
        'INSERT INTO follow_events (openid, event_type, event_key, created_at) VALUES (?, ?, ?, NOW())',
        [openid, eventType, eventKey]
      );

    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('处理微信事件失败', error);
  }
}

// 处理扫码关注
async function handleScanFollow(connection: any, openid: string, sceneStr: string) {
  try {
    // 解析场景值获取员工ID
    // 格式: emp_{employee_id}_{timestamp}
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

    const promoList = promotions as any[];
    if (promoList.length === 0) {
      logger.warn('未找到推广记录', { sceneStr });
      return;
    }

    const promotion = (promoList as any)[0];

    // 1. 获取用户信息
    const userInfo = await getUserInfo(openid);
    
    // 2. 检查是否已有关注记录
    const [existing] = await connection.query(
      'SELECT * FROM follow_records WHERE openid = ?',
      [openid]
    );

    if ((existing as any[]).length > 0) {
      // 更新现有记录
      await connection.query(
        'UPDATE follow_records SET employee_id = ?, account_id = ?, status = 1, unsubscribed_at = NULL, updated_at = NOW() WHERE openid = ?',
        [employeeId, promotion.account_id, openid]
      );
    } else {
      // 3. 创建新的关注记录
      await connection.query(
        `INSERT INTO follow_records 
        (openid, nickname, employee_id, account_id, subscribe_time, status) 
        VALUES (?, ?, ?, ?, NOW(), 1)`,
        [openid, userInfo.nickname || '', employeeId, promotion.account_id]
      );

      // 4. 更新推广记录的关注数
      await connection.query(
        'UPDATE promotion_records SET follow_count = follow_count + 1 WHERE id = ?',
        [promotion.id]
      );
    }

    // 5. 检查扫码者是否是已登记的员工（双重身份）
    const [employee] = await connection.query(
      'SELECT employee_id, name FROM employee_info WHERE openid = ?',
      [openid]
    );

    if ((employee as any[]).length > 0) {
      const emp = (employee as any[])[0];
      
      // 6. 更新关注记录为员工
      await connection.query(
        `UPDATE follow_records 
        SET is_employee = 1, 
            employee_name = ?
        WHERE openid = ?`,
        [emp.name, openid]
      );

      // 7. 更新员工信息表的关注状态
      await connection.query(
        'UPDATE employee_info SET is_followed = 1, follow_time = NOW() WHERE openid = ?',
        [openid]
      );

      logger.info('扫码关注：识别为已登记员工（双重身份）', { 
        openid, 
        promoter: employeeId,
        self: emp.employee_id,
        name: emp.name 
      });
    }

    logger.info('处理扫码关注成功', { openid, employeeId, sceneStr });

  } catch (error) {
    logger.error('处理扫码关注失败', error);
  }
}

// 处理普通关注
async function handleNormalFollow(connection: any, openid: string) {
  try {
    // 1. 获取用户信息
    const userInfo = await getUserInfo(openid);
    
    // 2. 检查是否已有关注记录
    const [existing] = await connection.query(
      'SELECT * FROM follow_records WHERE openid = ?',
      [openid]
    );

    if ((existing as any[]).length > 0) {
      // 重新关注，更新状态
      await connection.query(
        'UPDATE follow_records SET status = 1, unsubscribed_at = NULL, updated_at = NOW() WHERE openid = ?',
        [openid]
      );
    } else {
      // 3. 创建新的关注记录（先创建）
      await connection.query(
        `INSERT INTO follow_records 
        (openid, nickname, subscribe_time, status) 
        VALUES (?, ?, NOW(), 1)`,
        [openid, userInfo.nickname || '']
      );
    }

    // 4. 检查是否是已登记的员工（场景B：先登记，后关注）
    const [employee] = await connection.query(
      'SELECT employee_id, name, phone, department, position FROM employee_info WHERE openid = ?',
      [openid]
    );

    if ((employee as any[]).length > 0) {
      const emp = (employee as any[])[0];
      
      // 5. 是员工，更新关注记录
      await connection.query(
        `UPDATE follow_records 
        SET is_employee = 1, 
            employee_id = ?,
            employee_name = ?
        WHERE openid = ?`,
        [emp.employee_id, emp.name, openid]
      );

      // 6. 更新员工信息表的关注状态
      await connection.query(
        'UPDATE employee_info SET is_followed = 1, follow_time = NOW() WHERE openid = ?',
        [openid]
      );

      logger.info('关注事件：识别为已登记员工', { 
        openid, 
        employee_id: emp.employee_id,
        name: emp.name 
      });
    }

    logger.info('处理普通关注成功', { openid });

  } catch (error) {
    logger.error('处理普通关注失败', error);
  }
}

// 处理取消关注
async function handleUnfollow(connection: any, openid: string) {
  try {
    // 1. 更新关注记录状态
    await connection.query(
      'UPDATE follow_records SET status = 0, unsubscribed_at = NOW(), updated_at = NOW() WHERE openid = ? AND status = 1',
      [openid]
    );

    // 2. 如果是员工，更新员工信息表
    await connection.query(
      'UPDATE employee_info SET is_followed = 0, follow_time = NULL WHERE openid = ?',
      [openid]
    );

    logger.info('处理取消关注成功', { openid });

  } catch (error) {
    logger.error('处理取消关注失败', error);
  }
}

// 处理扫码（已关注用户）
async function handleScan(connection: any, openid: string, eventKey: string) {
  try {
    // 解析场景值
    const match = eventKey.match(/^emp_(.+?)_\d+$/);
    
    if (!match) {
      logger.warn('无效的场景值', { eventKey });
      return;
    }

    const employeeId = match[1];

    // 查找推广记录
    const [promotions] = await connection.query(
      'SELECT * FROM promotion_records WHERE scene_str = ?',
      [eventKey]
    );

    const promoList = promotions as any[];
    if (promoList.length > 0) {
      // 更新推广记录的扫码数
      await connection.query(
        'UPDATE promotion_records SET scan_count = scan_count + 1 WHERE id = ?',
        [(promoList as any)[0].id]
      );
    }

    logger.info('处理扫码成功', { openid, employeeId, eventKey });

  } catch (error) {
    logger.error('处理扫码失败', error);
  }
}

// 创建员工登记菜单
router.post('/create-employee-menu', async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    
    const menu = {
      button: [
        {
          name: "员工服务",
          sub_button: [
            {
              type: "view",
              name: "员工登记",
              url: `${process.env.H5_URL || 'http://your-domain.com'}/register.html?openid={openid}`,
            },
            {
              type: "view",
              name: "我的推广",
              url: `${process.env.H5_URL || 'http://your-domain.com'}/my-promotion.html?openid={openid}`,
            },
          ]
        },
      ]
    };

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`,
      menu
    );

    res.json({
      code: 200,
      message: '菜单创建成功',
      data: response.data
    });
  } catch (error: any) {
    logger.error('创建菜单失败', error);
    res.status(500).json({
      code: 500,
      message: '创建菜单失败',
      error: error.message
    });
  }
});

export default router;

