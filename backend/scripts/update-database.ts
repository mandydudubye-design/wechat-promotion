import { pool } from '../src/config/database';
import { logger } from '../src/utils/logger';
import fs from 'fs';
import path from 'path';

async function runUpdate() {
  try {
    logger.info('开始更新数据库表结构...');

    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, '../sql/update_accounts_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // 分割 SQL 语句（按分号分割）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // 执行每个 SQL 语句
    for (const statement of statements) {
      try {
        await pool.query(statement);
        logger.info(`执行成功: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        // 忽略 "Duplicate column" 或 "already exists" 错误
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
          logger.warn(`跳过（已存在）: ${error.message}`);
        } else {
          throw error;
        }
      }
    }

    logger.info('数据库表结构更新完成！');
    process.exit(0);
  } catch (error) {
    logger.error('数据库更新失败:', error);
    process.exit(1);
  }
}

runUpdate();
