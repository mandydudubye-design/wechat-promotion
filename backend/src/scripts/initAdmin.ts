import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

async function initAdminUser() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // 检查管理员是否已存在
      const [existing] = await connection.query(
        'SELECT * FROM admins WHERE username = ?',
        ['admin']
      );

      if ((existing as any[]).length > 0) {
        console.log('✅ 管理员账号已存在');
        return;
      }

      // 生成密码哈希
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // 创建管理员账号
      await connection.query(
        'INSERT INTO admins (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, '系统管理员', 'admin']
      );

      console.log('✅ 管理员账号创建成功');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      console.log('   ⚠️  请在生产环境中修改默认密码');
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ 初始化管理员账号失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initAdminUser()
    .then(() => {
      console.log('✅ 初始化完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 初始化失败:', error);
      process.exit(1);
    });
}

export { initAdminUser };
