import { Router, Request, Response } from 'express';
import { initDatabase } from '../config/database';

const router = Router();

/**
 * 初始化数据库
 * POST /api/init
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    await initDatabase();
    
    res.json({
      code: 200,
      message: '数据库初始化成功',
      data: {
        tables: ['users', 'employees', 'wechat_accounts', 'promotion_records', 'follow_records', 'employee_binding', 'employee_info']
      }
    });
  } catch (error: any) {
    console.error('数据库初始化失败:', error);
    res.status(500).json({
      code: 500,
      message: '数据库初始化失败',
      error: error.message
    });
  }
});

export default router;
