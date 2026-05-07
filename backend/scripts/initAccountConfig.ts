import { pool } from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function initAccountConfig() {
  try {
    console.log('开始创建公众号配置表...');

    // 读取 SQL 文件
    const sqlFilePath = path.join(__dirname, '../sql/create_wechat_configs_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // 执行 SQL
    await pool.execute(sqlContent);

    console.log('✅ 公众号配置表创建成功！');

    // 查询数据
    const [rows] = await pool.query('SELECT id, account_name, account_id, app_id, account_type, status FROM wechat_account_configs');
    console.log('公众号配置数据:', rows);
  } catch (error) {
    console.error('❌ 创建公众号配置表失败:', error);
    throw error;
  }
}

initAccountConfig().then(() => {
  console.log('初始化完成');
  process.exit(0);
}).catch((error) => {
  console.error('初始化失败:', error);
  process.exit(1);
});
