import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection, pool } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// 路由导入
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import accountRoutes from './routes/accounts';
import promotionRoutes from './routes/promotion';
import smartPromotionRoutes from './routes/smart-promotion';
import followRoutes from './routes/follow';
import wechatRoutes from './routes/wechat';
import statsRoutes from './routes/stats';
import employeeBindingRoutes from './routes/employeeBinding';
import employeeInfoRoutes from './routes/employeeInfo';
import initRoutes from './routes/init';
import employeeUnifiedRoutes from './routes/employee-unified';
import verificationCodeRoutes from './routes/verification-code';
import wechatCallbackUnifiedRoutes from './routes/wechat-callback-unified';
import wechatOAuthRoutes from './routes/wechat-oauth';
import wechatAccountConfigRoutes from './routes/wechat-account-configs';
import posterTemplatesRoutes from './routes/poster-templates';
import circleTextsRoutes from './routes/circle-texts';
import promotionKitsRoutes from './routes/promotion-kits';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';
import promotionStatsRoutes from './routes/promotion-stats';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({
    code: 200,
    message: 'Server is running',
    timestamp: Date.now(),
    data: {
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/smart-promotion', smartPromotionRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/wechat', wechatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/employee-binding', employeeBindingRoutes);
app.use('/api/employee-info', employeeInfoRoutes);
app.use('/api/init', initRoutes);
app.use('/api/employee-unified', employeeUnifiedRoutes);
app.use('/api/verification-code', verificationCodeRoutes);
app.use('/api/wechat-callback', wechatCallbackUnifiedRoutes);
app.use('/api/wechat-oauth', wechatOAuthRoutes);
app.use('/api/wechat-configs', wechatAccountConfigRoutes);
app.use('/api/poster-templates', posterTemplatesRoutes);
app.use('/api/circle-texts', circleTextsRoutes);
app.use('/api/promotion-kits', promotionKitsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/promotion-stats', promotionStatsRoutes);

// 静态文件服务（前端）+ 上传文件
const publicPath = path.join(process.cwd(), 'public');
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
app.use(express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));

// SPA 路由支持（所有非 API 请求返回 index.html）
app.get('*', (req: Request, res: Response) => {
  // 如果是 API 请求，返回 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      code: 404,
      message: 'API not found',
      timestamp: Date.now()
    });
  }
  
  // 其他请求返回前端 index.html
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 删除重复的 404 处理（已在上面处理）

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (dbConnected) {
      // 创建公众号配置表（如果不存在）
      try {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS wechat_account_configs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_name VARCHAR(100) NOT NULL COMMENT '公众号名称',
            wechat_id VARCHAR(100) COMMENT '微信号（gh_xxxxxxxx）',
            app_id VARCHAR(100) NOT NULL COMMENT 'AppID',
            app_secret VARCHAR(255) NOT NULL COMMENT 'AppSecret',
            account_type ENUM('subscription', 'service') NOT NULL DEFAULT 'subscription' COMMENT '公众号类型: subscription-订阅号, service-服务号',
            verified TINYINT(1) DEFAULT 0 COMMENT '是否已认证: 0-否, 1-是',
            qr_code_url VARCHAR(500) COMMENT '二维码URL',
            description TEXT COMMENT '描述',
            avatar VARCHAR(500) COMMENT '头像URL',
            total_followers INT DEFAULT 0 COMMENT '总关注数',
            employee_followers INT DEFAULT 0 COMMENT '员工关注数',
            today_new_follows INT DEFAULT 0 COMMENT '今日新增',
            month_new_follows INT DEFAULT 0 COMMENT '本月新增',
            status TINYINT(1) DEFAULT 1 COMMENT '状态: 0-停用, 1-正常',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
            UNIQUE KEY uk_app_id (app_id),
            INDEX idx_account_type (account_type),
            INDEX idx_status (status)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公众号配置表'
        `);
        logger.info('✅ 公众号配置表检查完成');

        // 检查是否有测试数据，如果没有则插入
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM wechat_account_configs');
        const count = (rows as any)[0].count;

        if (count === 0) {
          await pool.execute(`
            INSERT INTO wechat_account_configs (account_name, wechat_id, app_id, app_secret, account_type, verified, description, status) VALUES
            ('企业官方号', 'gh_company_official', 'wx1234567890abcdef', 'secret1234567890abcdef', 'service', 1, '企业官方公众号', 1),
            ('产品服务号', 'gh_product_service', 'wxabcdef1234567890', 'secretabcdef1234567890', 'service', 1, '产品与服务推广', 1),
            ('招聘订阅号', 'gh_recruit_sub', 'wx1111222233334444', 'secret1111222233334444', 'subscription', 0, '招聘信息发布', 1)
          `);
          logger.info('✅ 已插入测试公众号数据');
        }
      } catch (error) {
        logger.warn('⚠️  公众号配置表创建失败:', error);
      }

      // 创建海报模板表
      try {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS poster_templates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL COMMENT '模板名称',
            description TEXT COMMENT '描述',
            account_id INT COMMENT '所属公众号ID',
            image_url VARCHAR(500) NOT NULL COMMENT '海报图片URL',
            width INT DEFAULT 1080 COMMENT '海报宽度(px)',
            height INT DEFAULT 1920 COMMENT '海报高度(px)',
            qr_code_x INT DEFAULT 0 COMMENT '二维码X坐标(px)',
            qr_code_y INT DEFAULT 0 COMMENT '二维码Y坐标(px)',
            qr_code_width INT DEFAULT 200 COMMENT '二维码宽度(px)',
            qr_code_height INT DEFAULT 200 COMMENT '二维码高度(px)',
            status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
            INDEX idx_account_id (account_id),
            INDEX idx_status (status)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='海报模板表'
        `);
        logger.info('✅ 海报模板表检查完成');
      } catch (error) {
        logger.warn('⚠️  海报模板表创建失败:', error);
      }

      // 创建朋友圈文案表
      try {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS circle_texts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL COMMENT '文案名称',
            category VARCHAR(50) DEFAULT 'general' COMMENT '分类',
            content TEXT NOT NULL COMMENT '文案内容',
            variables VARCHAR(500) COMMENT '变量（逗号分隔）',
            status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
            INDEX idx_category (category),
            INDEX idx_status (status)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='朋友圈文案表'
        `);
        logger.info('✅ 朋友圈文案表检查完成');
      } catch (error) {
        logger.warn('⚠️  朋友圈文案表创建失败:', error);
      }

      // 创建推广套装表
      try {
        // 先检查表是否存在
        const [tables] = await pool.execute(`
          SELECT TABLE_NAME FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = 'wechat_promotion' AND TABLE_NAME = 'promotion_kits'
        `);

        if ((tables as any[]).length === 0) {
          // 表不存在，直接创建
          await pool.execute(`
            CREATE TABLE promotion_kits (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(100) NOT NULL COMMENT '套装名称',
              account_id INT COMMENT '所属公众号ID',
              poster_template_id INT COMMENT '海报模板ID',
              text_template_id INT COMMENT '文案模板ID',
              is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认套装: 0-否, 1-是',
              status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
              INDEX idx_account_id (account_id),
              INDEX idx_is_default (is_default),
              INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推广套装表'
          `);
          logger.info('✅ promotion_kits 表已创建');
        } else {
          // 表已存在，检查 circle_text_id 字段是否存在，存在才重命名
          try {
            const [columns] = await pool.execute(`
              SELECT COLUMN_NAME FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = 'wechat_promotion' AND TABLE_NAME = 'promotion_kits' AND COLUMN_NAME = 'circle_text_id'
            `);
            if ((columns as any[]).length > 0) {
              await pool.execute(`
                ALTER TABLE promotion_kits
                CHANGE COLUMN circle_text_id text_template_id INT COMMENT '文案模板ID'
              `);
              logger.info('✅ promotion_kits 表字段 circle_text_id 已重命名为 text_template_id');
            } else {
              logger.info('✅ promotion_kits 表字段已是最新，无需修改');
            }
          } catch (err) {
            logger.warn('⚠️  promotion_kits 字段检查异常:', err);
          }
        }
        logger.info('✅ 推广套装表检查完成');
      } catch (error) {
        logger.warn('⚠️  推广套装表创建失败:', error);
      }

      // 创建关注归因记录表（推广码模式）
      try {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS follow_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id VARCHAR(50) NOT NULL COMMENT '推广员工ID',
            promotion_code VARCHAR(50) NOT NULL COMMENT '推广码（=员工工号）',
            wechat_openid VARCHAR(100) NOT NULL COMMENT '微信用户OpenID',
            wechat_nickname VARCHAR(100) DEFAULT NULL COMMENT '微信昵称',
            subscribe_status ENUM('subscribed', 'unsubscribed') NOT NULL DEFAULT 'subscribed' COMMENT '关注状态',
            first_reply_at DATETIME NOT NULL COMMENT '首次回复推广码时间',
            last_event_at DATETIME DEFAULT NULL COMMENT '最近事件时间',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
            UNIQUE KEY uk_openid_code (wechat_openid, promotion_code),
            INDEX idx_employee_id (employee_id),
            INDEX idx_wechat_openid (wechat_openid),
            INDEX idx_subscribe_status (subscribe_status),
            INDEX idx_first_reply_at (first_reply_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注归因记录表'
        `);
        logger.info('✅ 关注归因记录表检查完成');

        // 检查必要字段是否存在（兼容旧表），不存在则添加
        try {
          await pool.execute(`
            ALTER TABLE follow_records
            ADD COLUMN IF NOT EXISTS promotion_code VARCHAR(50) NOT NULL DEFAULT '' COMMENT '推广码' AFTER employee_id,
            ADD COLUMN IF NOT EXISTS subscribe_status ENUM('subscribed', 'unsubscribed') NOT NULL DEFAULT 'subscribed' COMMENT '关注状态' AFTER wechat_nickname,
            ADD COLUMN IF NOT EXISTS first_reply_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '归因时间' AFTER subscribe_status,
            ADD COLUMN IF NOT EXISTS last_event_at DATETIME DEFAULT NULL COMMENT '最近事件时间' AFTER first_reply_at
          `);
        } catch (alterErr) {
          // 字段已存在或其他问题，忽略
        }
      } catch (error) {
        logger.warn('⚠️  关注归因记录表创建失败:', error);
      }

      // 确保 employees 表有 promotion_count 和 last_promotion_time 字段
      try {
        await pool.execute(`
          ALTER TABLE employees
          ADD COLUMN IF NOT EXISTS promotion_count INT DEFAULT 0 COMMENT '推广数量',
          ADD COLUMN IF NOT EXISTS last_promotion_time DATETIME DEFAULT NULL COMMENT '最后推广时间'
        `);
        logger.info('✅ employees 表推广字段检查完成');
      } catch (error) {
        // 忽略
      }
    } else {
      logger.warn('⚠️  数据库连接失败，部分功能可能不可用');
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
      logger.info(`📦 Static files served from: ${publicPath}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
