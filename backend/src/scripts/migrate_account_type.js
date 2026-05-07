const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'wechat_promotion'
  });

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

    // 逐条执行
    for (const stmt of statements) {
      try {
        await connection.execute(stmt);
        console.log('✅ 执行成功');
      } catch (error) {
        // 忽略"字段已存在"错误
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_COLUMN_EXISTS') {
          console.log('⚠️  字段已存在，跳过');
        } else {
          console.error('❌ 执行失败:', error.message);
        }
      }
    }

    // 查询结果
    const [rows] = await connection.execute(`
      SELECT id, account_name, account_id, account_type, status
      FROM wechat_accounts
    `);

    console.log('\n📊 当前公众号数据:');
    console.table(rows);

    console.log('\n✅ 数据库迁移完成！');
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await connection.end();
  }
}

migrate();
