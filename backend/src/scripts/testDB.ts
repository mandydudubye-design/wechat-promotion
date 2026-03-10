import { pool } from '../config/database';

async function testDB() {
  try {
    console.log('测试数据库连接...');
    
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 测试查询
    const [rows] = await connection.query('SELECT * FROM admins');
    console.log('✅ 查询成功，结果：', rows);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
    process.exit(1);
  }
}

testDB();
