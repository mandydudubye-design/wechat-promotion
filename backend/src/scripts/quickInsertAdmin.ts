import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

async function insertAdmin() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // 删除可能存在的测试管理员
      await connection.query(
        'DELETE FROM admins WHERE username IN (?, ?)',
        ['admin', 'test']
      );
      console.log('✅ 清理旧管理员数据');

      // 生成密码哈希
      const passwordHash = bcrypt.hashSync('admin123', 10);
      console.log('✅ 密码哈希生成成功');

      // 插入管理员账号
      await connection.query(
        'INSERT INTO admins (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', passwordHash, '系统管理员', 'admin']
      );
      console.log('✅ 管理员账号创建成功');
      console.log('');
      console.log('登录信息：');
      console.log('  用户名: admin');
      console.log('  密码: admin123');
      console.log('');

      // 查询验证
      const [rows] = await connection.query('SELECT * FROM admins');
      console.log('当前管理员列表：');
      console.table(rows);

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ 创建管理员失败:', error);
    process.exit(1);
  }
}

insertAdmin()
  .then(() => {
    console.log('');
    console.log('✅ 管理员初始化完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 错误:', error);
    process.exit(1);
  });
