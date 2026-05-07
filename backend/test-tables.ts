import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wechat_promotion',
});

async function testTables() {
  try {
    console.log('🔍 检查数据库表...\n');

    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = (tables as any[]).map(t => Object.values(t)[0]);

    console.log('✅ 现有表：');
    tableNames.forEach((name: string) => console.log(`  - ${name}`));

    const requiredTables = ['wechat_account_configs', 'poster_templates', 'circle_texts', 'promotion_kits'];
    console.log('\n📋 需要的表：');
    requiredTables.forEach(name => {
      const exists = tableNames.includes(name);
      console.log(`  ${exists ? '✅' : '❌'} ${name}`);
    });

    console.log('\n🎉 检查完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

testTables();
