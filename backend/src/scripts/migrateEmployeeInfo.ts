import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

export async function migrateEmployeeInfo() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 开始迁移员工信息表...');

    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../../sql/create_employee_info.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // 分割SQL语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }
      
      try {
        await connection.query(statement);
        console.log('✅ 执行成功:', statement.substring(0, 50) + '...');
      } catch (error: any) {
        // 忽略已存在的表错误
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('✅ 员工信息表迁移完成！');
    
    // 显示统计信息
    const [stats] = await connection.query('SELECT * FROM v_employee_follow_summary');
    console.log('📊 当前统计:', (stats as any[])[0]);

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  migrateEmployeeInfo()
    .then(() => {
      console.log('✅ 迁移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 迁移失败:', error);
      process.exit(1);
    });
}
