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
    console.log('✓ 成功连接到MySQL');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'sql/employee_binding.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL文件不存在: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✓ 读取SQL文件');

    // 分割SQL语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // 逐条执行
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log('✓ 执行成功');
      } catch (error) {
        // 忽略"已存在"错误
        if (error.message.includes('already exists')) {
          console.log('⊙ 表已存在，跳过');
        } else {
          console.error('✗ 错误:', error.message);
        }
      }
    }

    console.log('\n✅ 数据库迁移完成！');

    // 验证表是否创建成功
    const [tables1] = await connection.query("SHOW TABLES LIKE 'employee_bindings'");
    if (tables1.length > 0) {
      console.log('✓ employee_bindings 表已创建');
    } else {
      console.log('✗ employee_bindings 表创建失败');
    }

    const [tables2] = await connection.query("SHOW TABLES LIKE 'employee_verification_logs'");
    if (tables2.length > 0) {
      console.log('✓ employee_verification_logs 表已创建');
    } else {
      console.log('✗ employee_verification_logs 表创建失败');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
