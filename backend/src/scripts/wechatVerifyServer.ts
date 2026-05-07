/**
 * 微信公众号服务器验证服务
 * 用于微信公众号服务器配置验证，不依赖数据库
 */

import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const app = express();
const PORT = 3000;

// 微信公众号配置
const WECHAT_TOKEN = process.env.WECHAT_TOKEN || 'wechatpromotion2024';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 微信服务器验证接口
app.get('/api/wechat/message', (req, res) => {
  console.log('收到微信验证请求:', req.query);
  
  const { signature, timestamp, nonce, echostr } = req.query;
  
  if (!signature || !timestamp || !nonce || !echostr) {
    console.log('缺少必要参数');
    return res.status(400).send('缺少必要参数');
  }
  
  // 验证签名
  const token = WECHAT_TOKEN;
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  
  console.log('计算签名:', sha1, '微信签名:', signature);
  
  if (sha1 === signature) {
    console.log('✅ 验证成功，返回 echostr');
    return res.send(echostr);
  } else {
    console.log('❌ 验证失败');
    return res.status(403).send('验证失败');
  }
});

// 接收微信消息
app.post('/api/wechat/message', (req, res) => {
  console.log('收到微信消息:', req.body);
  
  // TODO: 处理微信消息
  
  res.send('success');
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'Server is running',
    timestamp: Date.now(),
    data: {
      uptime: process.uptime(),
      environment: 'development',
      version: '1.0.0'
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('===========================================');
  console.log('  微信公众号验证服务器已启动');
  console.log('===========================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📋 Token: ${WECHAT_TOKEN}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Wechat endpoint: http://localhost:${PORT}/api/wechat/message`);
  console.log('===========================================');
});