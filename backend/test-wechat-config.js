require('dotenv').config();
const axios = require('axios');

console.log('=== 微信配置测试 ===\n');

const appId = process.env.WECHAT_APP_ID;
const appSecret = process.env.WECHAT_APP_SECRET;
const token = process.env.WECHAT_TOKEN;

console.log('1. 检查环境变量配置...');
if (appId && appSecret && token) {
  console.log(`✅ AppID: ${appId}`);
  console.log(`✅ AppSecret: ${appSecret.substring(0, 10)}... (已隐藏)`);
  console.log(`✅ Token: ${token}\n`);
} else {
  console.log('❌ 配置不完整');
  console.log(`   AppID: ${appId || '(未配置)'}`);
  console.log(`   AppSecret: ${appSecret ? '(已配置)' : '(未配置)'}`);
  console.log(`   Token: ${token || '(未配置)'}`);
  process.exit(1);
}

console.log('2. 测试微信 API 连接...');
axios.get('https://api.weixin.qq.com/cgi-bin/token', {
  params: {
    grant_type: 'client_credential',
    appid: appId,
    secret: appSecret,
  }
})
.then(response => {
  if (response.data.errcode) {
    console.log(`❌ 获取 access_token 失败`);
    console.log(`   错误码: ${response.data.errcode}`);
    console.log(`   错误信息: ${response.data.errmsg}\n`);
    process.exit(1);
  } else {
    console.log(`✅ access_token: ${response.data.access_token.substring(0, 20)}... (已隐藏)`);
    console.log(`✅ 有效期: ${response.data.expires_in} 秒\n`);

    console.log('3. 测试生成二维码...');
    const testScene = `test_${Date.now()}`;
    return axios.post(
      `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${response.data.access_token}`,
      {
        expire_seconds: 3600,
        action_name: 'QR_STR_SCENE',
        action_info: {
          scene: {
            scene_str: testScene,
          },
        },
      }
    );
  }
})
.then(response => {
  if (response.data.errcode) {
    console.log(`❌ 生成二维码失败`);
    console.log(`   错误码: ${response.data.errcode}`);
    console.log(`   错误信息: ${response.data.errmsg}\n`);
    process.exit(1);
  } else {
    const ticket = response.data.ticket;
    const qrCodeUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket)}`;
    console.log(`✅ 场景值: ${testScene}`);
    console.log(`✅ Ticket: ${ticket.substring(0, 30)}...`);
    console.log(`✅ 二维码 URL: ${qrCodeUrl.substring(0, 80)}...\n`);

    console.log('4. 测试二维码图片是否可访问...');
    return axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
  }
})
.then(response => {
  if (response.status === 200 && response.headers['content-type']?.includes('image')) {
    console.log(`✅ 二维码图片可访问`);
    console.log(`✅ 图片大小: ${response.data.byteLength} bytes\n`);
    console.log('=== 所有测试通过！微信 API 对接成功 ===\n');
    console.log('下一步：');
    console.log('1. 在微信公众平台配置服务器 URL');
    console.log('   URL: https://x-bussiness.online/api/wechat/webhook');
    console.log(`   Token: ${token}`);
    console.log('2. 点击"提交"进行验证');
  } else {
    console.log('❌ 二维码图片访问失败\n');
    process.exit(1);
  }
})
.catch(error => {
  console.log('❌ 测试失败:', error.message);
  if (error.response?.data) {
    console.log('错误详情:', JSON.stringify(error.response.data, null, 2));
  }
  console.log('\n常见问题：');
  console.log('1. AppID 或 AppSecret 配置错误');
  console.log('2. 网络连接问题（可能需要科学上网）');
  console.log('3. 微信公众号未认证（某些功能需要认证账号）');
  process.exit(1);
});
