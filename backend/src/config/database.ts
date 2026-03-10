import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wechat_promotion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
};

// 创建连接池
export const pool = mysql.createPool(dbConfig);

// 测试数据库连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
};

// 初始化数据库表
export const initDatabase = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'manager') DEFAULT 'manager',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createEmployeesTable = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      department VARCHAR(100),
      position VARCHAR(100),
      status ENUM('active', 'inactive') DEFAULT 'active',
      join_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createWechatAccountsTable = `
    CREATE TABLE IF NOT EXISTS wechat_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nickname VARCHAR(100),
      openid VARCHAR(100) UNIQUE NOT NULL,
      avatar VARCHAR(500),
      subscribe_status ENUM('subscribed', 'unsubscribed') DEFAULT 'subscribed',
      subscribe_time INT,
      unsubscribe_time INT,
      tags JSON,
      remark VARCHAR(200),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_openid (openid),
      INDEX idx_subscribe (subscribe_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createPromotionRecordsTable = `
    CREATE TABLE IF NOT EXISTS promotion_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      wechat_id INT NOT NULL,
      promoted_count INT DEFAULT 0,
      last_promotion_time TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (wechat_id) REFERENCES wechat_accounts(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_wechat (employee_id, wechat_id),
      INDEX idx_employee (employee_id),
      INDEX idx_wechat (wechat_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createFollowRecordsTable = `
    CREATE TABLE IF NOT EXISTS follow_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      wechat_id INT NOT NULL,
      status ENUM('pending', 'contacted', 'interested', 'converted', 'lost') DEFAULT 'pending',
      notes TEXT,
      contact_time TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (wechat_id) REFERENCES wechat_accounts(id) ON DELETE CASCADE,
      INDEX idx_employee (employee_id),
      INDEX idx_wechat (wechat_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createEmployeeBindingTable = `
    CREATE TABLE IF NOT EXISTS employee_binding (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      wechat_id INT NOT NULL,
      binding_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (wechat_id) REFERENCES wechat_accounts(id) ON DELETE CASCADE,
      UNIQUE KEY unique_binding (employee_id, wechat_id),
      INDEX idx_employee (employee_id),
      INDEX idx_wechat (wechat_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createEmployeeInfoTable = `
    CREATE TABLE IF NOT EXISTS employee_info (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL UNIQUE,
      total_followers INT DEFAULT 0,
      active_followers INT DEFAULT 0,
      total_promotions INT DEFAULT 0,
      total_contacts INT DEFAULT 0,
      total_conversions INT DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      INDEX idx_employee (employee_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.execute(createUsersTable);
    console.log('✅ users表创建成功');

    await pool.execute(createEmployeesTable);
    console.log('✅ employees表创建成功');

    await pool.execute(createWechatAccountsTable);
    console.log('✅ wechat_accounts表创建成功');

    await pool.execute(createPromotionRecordsTable);
    console.log('✅ promotion_records表创建成功');

    await pool.execute(createFollowRecordsTable);
    console.log('✅ follow_records表创建成功');

    await pool.execute(createEmployeeBindingTable);
    console.log('✅ employee_binding表创建成功');

    await pool.execute(createEmployeeInfoTable);
    console.log('✅ employee_info表创建成功');
  } catch (error) {
    console.error('❌ 数据库表创建失败:', error);
    throw error;
  }
};

export default pool;
