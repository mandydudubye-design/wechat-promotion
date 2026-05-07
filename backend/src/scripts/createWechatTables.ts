import dotenv from 'dotenv';
import { pool } from '../config/database';

// 加载环境变量
dotenv.config();

async function createWechatTables() {
  console.log('=== 创建微信相关数据库表 ===\n');

  try {
    // 1. 创建微信用户表
    console.log('1. 创建 wechat_users 表...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS wechat_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信 OpenID',
        unionid VARCHAR(100) DEFAULT NULL COMMENT '微信 UnionID',
        nickname VARCHAR(100) DEFAULT NULL COMMENT '昵称',
        avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像 URL',
        is_subscribed TINYINT(1) DEFAULT TRUE COMMENT '是否关注',
        subscribe_time DATETIME DEFAULT NULL COMMENT '关注时间',
        unsubscribe_time DATETIME DEFAULT NULL COMMENT '取消关注时间',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_openid (openid),
        INDEX idx_subscribed (is_subscribed)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信用户表'
    `);
    console.log('✅ wechat_users 表创建成功\n');

    // 2. 创建推广记录表
    console.log('2. 创建 promotion_records 表...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS promotion_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        promoter_id VARCHAR(50) NOT NULL COMMENT '推广人工号',
        follower_openid VARCHAR(100) NOT NULL COMMENT '关注者 OpenID',
        follow_time DATETIME NOT NULL COMMENT '关注时间',
        source VARCHAR(20) DEFAULT 'qrcode' COMMENT '推广来源：qrcode/link/other',
        account_id INT DEFAULT NULL COMMENT '公众号 ID',
        status TINYINT(1) DEFAULT 1 COMMENT '状态：1-有效，0-无效',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_promoter (promoter_id),
        INDEX idx_follower (follower_openid),
        INDEX idx_follow_time (follow_time),
        INDEX idx_account (account_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推广记录表'
    `);
    console.log('✅ promotion_records 表创建成功\n');

    // 3. 更新 employees 表，添加推广统计字段
    console.log('3. 更新 employees 表...');
    try {
      await pool.execute(`
        ALTER TABLE employees
        ADD COLUMN IF NOT EXISTS promotion_count INT DEFAULT 0 COMMENT '推广数量',
        ADD COLUMN IF NOT EXISTS last_promotion_time DATETIME DEFAULT NULL COMMENT '最后推广时间'
      `);
      console.log('✅ employees 表更新成功\n');
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  字段已存在，跳过\n');
      } else {
        throw err;
      }
    }

    // 4. 更新 employee_bindings 表，添加微信 openid 字段
    console.log('4. 更新 employee_bindings 表...');
    try {
      await pool.execute(`
        ALTER TABLE employee_bindings
        ADD COLUMN IF NOT EXISTS wechat_openid VARCHAR(100) DEFAULT NULL COMMENT '微信 OpenID',
        ADD INDEX idx_wechat_openid (wechat_openid)
      `);
      console.log('✅ employee_bindings 表更新成功\n');
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  字段已存在，跳过\n');
      } else {
        throw err;
      }
    }

    console.log('=== 所有表创建成功！ ===\n');
  } catch (error: any) {
    console.error('❌ 创建表失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行
createWechatTables();
