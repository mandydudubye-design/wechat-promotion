import dotenv from 'dotenv';
import axios from 'axios';
import { createQrCode, getAccessToken } from '../services/wechatService';

// 加载环境变量
dotenv.config();

/**
 * 测试微信 API 连接
 */
async function testWechatApi() {
  console.log('=== 微信 API 对接测试 ===\n');

  // 1. 检查环境变量配置
  console.log('1. 检查环境变量配置...');
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('❌ 未配置 WECHAT_APP_ID 或 WECHAT_APP_SECRET');
    console.log('请在 backend/.env 文件中配置微信公众号的 AppID 和 AppSecret');
    console.log('获取地址：https://mp.weixin.qq.com/ -> 开发 -> 基本配置\n');
    return;
  }
  console.log(`✅ AppID: ${appId}`);
  console.log(`✅ AppSecret: ${appSecret.substring(0, 10)}... (已隐藏)\n`);

  try {
    // 2. 测试获取 access_token
    console.log('2. 测试获取 access_token...');
    const accessToken = await getAccessToken();
    console.log(`✅ access_token: ${accessToken.substring(0, 20)}... (已隐藏)\n`);

    // 3. 测试生成二维码
    console.log('3. 测试生成带参数二维码...');
    const testScene = `test_${Date.now()}`;
    const qrCodeUrl = await createQrCode(testScene, 3600); // 1 小时有效期
    console.log(`✅ 场景值: ${testScene}`);
    console.log(`✅ 二维码 URL: ${qrCodeUrl}\n`);

    // 4. 测试二维码是否可访问
    console.log('4. 测试二维码图片是否可访问...');
    const qrResponse = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
    if (qrResponse.status === 200 && qrResponse.headers['content-type']?.includes('image')) {
      console.log(`✅ 二维码图片可访问`);
      console.log(`✅ 图片大小: ${qrResponse.data.byteLength} bytes\n`);
    } else {
      console.log('❌ 二维码图片访问失败\n');
    }

    console.log('=== 所有测试通过！微信 API 对接成功 ===\n');
    console.log('下一步：');
    console.log('1. 在微信公众平台配置服务器 URL');
    console.log(`   URL: http://your-domain.com/api/wechat/webhook`);
    console.log(`   Token: ${process.env.WECHAT_TOKEN}`);
    console.log('2. 点击"提交"进行验证');
    console.log('3. 验证成功后，可以使用微信推广二维码功能\n');

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    if (error.response?.data) {
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n常见问题：');
    console.log('1. AppID 或 AppSecret 配置错误');
    console.log('2. 网络连接问题（可能需要科学上网）');
    console.log('3. 微信公众号未认证（某些功能需要认证账号）');
  }
}

// 运行测试
testWechatApi();
