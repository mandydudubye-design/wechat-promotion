import { pool } from '../src/config/database';

async function initTestAccounts() {
  try {
    console.log('开始初始化测试公众号数据...');

    // 检查是否已有数据
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM wechat_accounts');
    const count = (existing as any)[0].count;

    if (count > 0) {
      console.log(`数据库中已有 ${count} 条公众号数据，跳过初始化`);
      return;
    }

    // 插入测试数据
    const testAccounts = [
      {
        account_name: '企业官方号',
        wechat_id: 'gh_company_official',
        app_id: 'wx1234567890abcdef',
        app_secret: 'secret1234567890abcdef',
        account_type: 'service',
        verified: 1,
        qr_code_url: '',
        description: '企业官方公众号',
        avatar: '',
        status: 1,
      },
      {
        account_name: '产品服务号',
        wechat_id: 'gh_product_service',
        app_id: 'wxabcdef1234567890',
        app_secret: 'secretabcdef1234567890',
        account_type: 'service',
        verified: 1,
        qr_code_url: '',
        description: '产品与服务推广',
        avatar: '',
        status: 1,
      },
      {
        account_name: '招聘订阅号',
        wechat_id: 'gh_recruit_sub',
        app_id: 'wx1111222233334444',
        app_secret: 'secret1111222233334444',
        account_type: 'subscription',
        verified: 0,
        qr_code_url: '',
        description: '招聘信息发布',
        avatar: '',
        status: 1,
      },
    ];

    for (const account of testAccounts) {
      await pool.query(
        `INSERT INTO wechat_accounts
         (account_name, wechat_id, app_id, app_secret, account_type, verified, qr_code_url, description, avatar, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          account.account_name,
          account.wechat_id,
          account.app_id,
          account.app_secret,
          account.account_type,
          account.verified,
          account.qr_code_url,
          account.description,
          account.avatar,
          account.status,
        ]
      );
      console.log(`✓ 已添加公众号: ${account.account_name}`);
    }

    console.log(`✅ 成功初始化 ${testAccounts.length} 条测试公众号数据`);
  } catch (error) {
    console.error('初始化测试数据失败:', error);
    process.exit(1);
  }
}

initTestAccounts().then(() => {
  console.log('初始化完成');
  process.exit(0);
});
