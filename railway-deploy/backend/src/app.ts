import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// 路由导入
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import accountRoutes from './routes/accounts';
import promotionRoutes from './routes/promotion';
import followRoutes from './routes/follow';
import wechatRoutes from './routes/wechat';
import statsRoutes from './routes/stats';
import employeeBindingRoutes from './routes/employeeBinding';
import employeeInfoRoutes from './routes/employeeInfo';
import initRoutes from './routes/init';

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
app.use('/api/follow', followRoutes);
app.use('/api/wechat', wechatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/employee-binding', employeeBindingRoutes);
app.use('/api/employee-info', employeeInfoRoutes);
app.use('/api/init', initRoutes);

// 静态文件服务（前端）
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

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
    await testConnection();
    
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
