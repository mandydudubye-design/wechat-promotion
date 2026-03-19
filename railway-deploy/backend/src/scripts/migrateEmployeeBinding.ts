import { pool } from '../config/database';
import { logger } from '../utils/logger';

/**
 * 员工身份识别系统数据库迁移
 */
async function migrateEmployeeBinding() {
  const connection = await pool.getConnection();

  try {
    console.log('🔄 开始执行员工身份识别系统数据库迁移...\n');

    // 1. 添加 is_employee 字段到 follow_records 表
    console.log('1️⃣ 添加 is_employee 字段到 follow_records 表...');
    try {
      await connection.query(`
        ALTER TABLE follow_records 
        ADD COLUMN IF NOT EXISTS is_employee BOOLEAN DEFAULT FALSE COMMENT '是否是员工' AFTER status
      `);
      await connection.query(`
        ALTER TABLE follow_records 
        ADD INDEX IF NOT EXISTS idx_is_employee (is_employee)
      `);
      console.log('✅ is_employee 字段添加成功\n');
    } catch (error: any) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⊙ is_employee 字段已存在，跳过\n');
      } else {
        throw error;
      }
    }

    // 2. 创建 employee_bindings 表
    console.log('2️⃣ 创建 employee_bindings 表...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS employee_bindings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
          openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信OpenID',
          unionid VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID（企业微信才有）',
          is_verified BOOLEAN DEFAULT FALSE COMMENT '是否已验证',
          verification_method VARCHAR(20) DEFAULT NULL COMMENT '验证方式：phone/sms/card/manual',
          verification_code VARCHAR(20) DEFAULT NULL COMMENT '验证码',
          verified_at TIMESTAMP NULL DEFAULT NULL COMMENT '验证时间',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_employee_id (employee_id),
          INDEX idx_openid (openid),
          INDEX idx_unionid (unionid),
          INDEX idx_is_verified (is_verified),
          FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工微信身份绑定表'
      `);
      console.log('✅ employee_bindings 表创建成功\n');
    } catch (error: any) {
      console.log('⊙ employee_bindings 表已存在或创建失败:', error.message, '\n');
    }

    // 3. 创建 employee_verification_logs 表
    console.log('3️⃣ 创建 employee_verification_logs 表...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS employee_verification_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
          openid VARCHAR(100) NOT NULL COMMENT '微信OpenID',
          verification_method VARCHAR(20) NOT NULL COMMENT '验证方式',
          verification_data VARCHAR(255) DEFAULT NULL COMMENT '验证数据（脱敏）',
          is_success BOOLEAN DEFAULT FALSE COMMENT '是否成功',
          failure_reason VARCHAR(255) DEFAULT NULL COMMENT '失败原因',
          ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_employee_id (employee_id),
          INDEX idx_openid (openid),
          INDEX idx_created_at (created_at),
          FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工身份验证日志'
      `);
      console.log('✅ employee_verification_logs 表创建成功\n');
    } catch (error: any) {
      console.log('⊙ employee_verification_logs 表已存在或创建失败:', error.message, '\n');
    }

    // 4. 创建或更新 verification_codes 表
    console.log('4️⃣ 创建 verification_codes 表...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS verification_codes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          phone VARCHAR(20) NOT NULL COMMENT '手机号',
          code VARCHAR(10) NOT NULL COMMENT '验证码',
          is_used BOOLEAN DEFAULT FALSE COMMENT '是否已使用',
          used_at TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
          expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_phone_code (phone, code),
          INDEX idx_expired_at (expired_at),
          INDEX idx_is_used (is_used)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码表'
      `);
      console.log('✅ verification_codes 表创建成功\n');
    } catch (error: any) {
      console.log('⊙ verification_codes 表已存在或创建失败:', error.message, '\n');
    }

    // 5. 创建视图：员工关注统计
    console.log('5️⃣ 创建视图：员工关注统计...');
    try {
      await connection.query(`
        CREATE OR REPLACE VIEW v_employee_follow_stats AS
        SELECT 
          e.employee_id,
          e.name AS employee_name,
          e.department,
          COUNT(DISTINCT fr.id) AS total_follows,
          COUNT(DISTINCT CASE WHEN fr.is_employee = TRUE THEN fr.id END) AS employee_follows,
          COUNT(DISTINCT CASE WHEN fr.is_employee = FALSE THEN fr.id END) AS customer_follows,
          MIN(fr.subscribe_time) AS first_follow_time,
          MAX(fr.subscribe_time) AS last_follow_time
        FROM employees e
        LEFT JOIN promotion_records pr ON e.employee_id = pr.employee_id
        LEFT JOIN follow_records fr ON pr.id = fr.promotion_record_id
        WHERE e.status = 1
        GROUP BY e.employee_id, e.name, e.department
      `);
      console.log('✅ 视图创建成功\n');
    } catch (error: any) {
      console.log('⊙ 视图创建失败:', error.message, '\n');
    }

    // 6. 验证表是否创建成功
    console.log('6️⃣ 验证数据库结构...');
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'employee_bindings'
    `);
    if ((tables as any[]).length > 0) {
      console.log('✅ employee_bindings 表已创建\n');
    } else {
      console.log('❌ employee_bindings 表创建失败\n');
    }

    const [followColumns] = await connection.query(`
      SHOW COLUMNS FROM follow_records LIKE 'is_employee'
    `);
    if ((followColumns as any[]).length > 0) {
      console.log('✅ follow_records.is_employee 字段已添加\n');
    } else {
      console.log('❌ follow_records.is_employee 字段添加失败\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 员工身份识别系统数据库迁移完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 可用的统计查询：');
    console.log('  • 查询员工绑定状态');
    console.log('  • 统计员工vs客户关注数');
    console.log('  • 查看员工推广效果对比\n');

  } catch (error: any) {
    console.error('❌ 迁移失败:', error.message);
    logger.error('数据库迁移失败', { error: error.message });
    throw error;
  } finally {
    connection.release();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  migrateEmployeeBinding()
    .then(() => {
      console.log('✅ 迁移成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 迁移失败:', error);
      process.exit(1);
    });
}

export default migrateEmployeeBinding;
