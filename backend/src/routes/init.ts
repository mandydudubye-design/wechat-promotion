import { Router, Request, Response } from 'express';
import { initDatabase } from '../config/database';
import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

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

/**
 * 执行数据库迁移（添加公众号类型字段）
 * POST /api/init/migrate-account-type
 */
router.post('/migrate-account-type', async (req: Request, res: Response) => {
  try {
    console.log('开始执行数据库迁移...');

    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, '../../sql/add_account_type.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // 拆分 SQL 语句（按分号分割）
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results = [];

    // 逐条执行
    for (const stmt of statements) {
      try {
        const [result] = await pool.execute(stmt);
        results.push({ statement: stmt.substring(0, 50) + '...', status: 'success' });
      } catch (error: any) {
        // 忽略"字段已存在"错误
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_COLUMN_EXISTS') {
          results.push({ statement: stmt.substring(0, 50) + '...', status: 'skipped', reason: '字段已存在' });
        } else {
          results.push({ statement: stmt.substring(0, 50) + '...', status: 'error', error: error.message });
        }
      }
    }

    // 查询当前数据
    const [rows] = await pool.execute(`
      SELECT id, account_name, account_id, account_type, status
      FROM wechat_accounts
    `);

    res.json({
      code: 200,
      message: '数据库迁移完成',
      data: {
        results,
        accounts: rows
      }
    });
  } catch (error: any) {
    console.error('迁移失败:', error);
    res.status(500).json({
      code: 500,
      message: '数据库迁移失败',
      error: error.message
    });
  }
});

export default router;
