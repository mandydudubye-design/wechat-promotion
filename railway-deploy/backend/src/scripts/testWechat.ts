import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
let authToken = '';

/**
 * 微信API测试脚本
 * 用于测试微信相关接口功能
 */

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

/**
 * 1. 管理员登录
 */
async function testLogin() {
  logSection('1. 管理员登录');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });

    if (response.data.code === 200) {
      authToken = response.data.data.token;
      logSuccess('登录成功');
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError('登录失败');
      return false;
    }
  } catch (error: any) {
    logError(`登录请求失败: ${error.message}`);
    return false;
  }
}

/**
 * 2. 检查微信配置
 */
async function testWechatConfig() {
  logSection('2. 检查微信配置');

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || appId === 'wx1234567890abcdef') {
    logError('微信AppID未配置，请在.env文件中设置WECHAT_APP_ID');
    logInfo('获取测试号：https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login');
    return false;
  }

  if (!appSecret || appSecret === 'your_app_secret_here') {
    logError('微信AppSecret未配置，请在.env文件中设置WECHAT_APP_SECRET');
    return false;
  }

  logSuccess('微信配置检查通过');
  logInfo(`AppID: ${appId}`);
  return true;
}

/**
 * 3. 查看公众号列表
 */
async function testGetAccounts() {
  logSection('3. 查看公众号列表');

  try {
    const response = await axios.get(`${BASE_URL}/api/accounts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      const accounts = response.data.data;
      logSuccess(`获取成功，共 ${accounts.length} 个公众号`);
      
      if (accounts.length > 0) {
        accounts.forEach((account: any, index: number) => {
          logInfo(`公众号${index + 1}: ${account.account_name} (ID: ${account.id})`);
        });
        return accounts[0].id; // 返回第一个公众号ID
      } else {
        logInfo('暂无公众号，需要先添加公众号');
        return null;
      }
    } else {
      logError('获取公众号列表失败');
      return null;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    return null;
  }
}

/**
 * 4. 添加测试公众号
 */
async function testAddAccount() {
  logSection('4. 添加测试公众号');

  try {
    const response = await axios.post(`${BASE_URL}/api/accounts`, {
      account_name: '测试公众号',
      app_id: process.env.WECHAT_APP_ID,
      app_secret: process.env.WECHAT_APP_SECRET,
      description: '用于测试的公众号'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      logSuccess('添加公众号成功');
      return response.data.data.insertId || 1;
    } else {
      logError('添加公众号失败');
      return null;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    return null;
  }
}

/**
 * 5. 添加测试员工
 */
async function testAddEmployee() {
  logSection('5. 添加测试员工');

  try {
    const response = await axios.post(`${BASE_URL}/api/employees`, {
      employee_id: 'EMP_TEST_001',
      name: '测试员工',
      phone: '13800138000',
      department: '技术部',
      position: '测试工程师'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      logSuccess('添加员工成功');
      return 'EMP_TEST_001';
    } else {
      // 员工可能已存在，尝试使用
      if (response.data.message && response.data.message.includes('已存在')) {
        logInfo('员工已存在，使用现有员工');
        return 'EMP_TEST_001';
      }
      logError('添加员工失败');
      return null;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    return null;
  }
}

/**
 * 6. 创建推广（生成二维码）
 */
async function testCreatePromotion(accountId: number | null, employeeId: string | null) {
  logSection('6. 创建推广记录（生成二维码）');

  if (!accountId || !employeeId) {
    logError('缺少公众号ID或员工ID，跳过此测试');
    return null;
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/promotion/create`, {
      employee_id: employeeId,
      account_id: accountId,
      description: '测试推广记录'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      const promotion = response.data.data;
      logSuccess('创建推广成功');
      logInfo(`推广ID: ${promotion.id}`);
      logInfo(`场景值: ${promotion.scene_str}`);
      logInfo(`二维码URL: ${promotion.qr_image}`);
      
      return promotion;
    } else {
      logError('创建推广失败');
      return null;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    if (error.response && error.response.data) {
      logInfo(`错误详情: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

/**
 * 7. 查询推广列表
 */
async function testGetPromotionRecords() {
  logSection('7. 查询推广记录列表');

  try {
    const response = await axios.get(`${BASE_URL}/api/promotion/records`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      const records = response.data.data;
      logSuccess(`获取成功，共 ${records.list.length} 条记录`);
      
      if (records.list.length > 0) {
        records.list.slice(0, 3).forEach((record: any, index: number) => {
          logInfo(`推广${index + 1}: ID=${record.id}, 员工=${record.employee_id}, 扫码=${record.scan_count}, 关注=${record.follow_count}`);
        });
      }
      return true;
    } else {
      logError('查询失败');
      return false;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    return false;
  }
}

/**
 * 8. 模拟扫码（更新推广数据）
 */
async function testUpdatePromotionStats(promotionId: number | null) {
  logSection('8. 更新推广数据（模拟扫码）');

  if (!promotionId) {
    logError('缺少推广ID，跳过此测试');
    return false;
  }

  try {
    const response = await axios.put(`${BASE_URL}/api/promotion/records/${promotionId}/stats`, {
      scan_count: 10,
      follow_count: 5
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      logSuccess('更新推广数据成功');
      return true;
    } else {
      logError('更新失败');
      return false;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    return false;
  }
}

/**
 * 9. 查询关注记录
 */
async function testGetFollowRecords() {
  logSection('9. 查询关注记录');

  try {
    const response = await axios.get(`${BASE_URL}/api/follow/records`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      const records = response.data.data;
      logSuccess(`获取成功，共 ${records.list.length} 条记录`);
      
      if (records.list.length > 0) {
        records.list.slice(0, 3).forEach((record: any, index: number) => {
          logInfo(`关注${index + 1}: openid=${record.openid}, 员工=${record.employee_id}, 状态=${record.status === 1 ? '已关注' : '已取关'}`);
        });
      }
      return true;
    } else {
      logError('查询失败');
      return false;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    return false;
  }
}

/**
 * 10. 获取统计数据
 */
async function testGetStats() {
  logSection('10. 获取统计数据');

  try {
    const response = await axios.get(`${BASE_URL}/api/stats/overview`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.code === 200) {
      const stats = response.data.data;
      logSuccess('获取统计成功');
      
      logInfo(`员工统计: 总数=${stats.employees.total}, 活跃=${stats.employees.active}`);
      logInfo(`公众号统计: 总数=${stats.accounts.total}, 活跃=${stats.accounts.active}`);
      logInfo(`推广统计: 记录=${stats.promotions.total_records}, 扫码=${stats.promotions.total_scans}, 关注=${stats.promotions.total_follows}`);
      logInfo(`关注统计: 总关注=${stats.follows.total_follows}, 当前关注=${stats.follows.current_follows}`);
      
      return true;
    } else {
      logError('查询失败');
      return false;
    }
  } catch (error: any) {
    logError(`请求失败: ${error.message}`);
    return false;
  }
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log('\n' + '█'.repeat(60));
  log('  微信公众号推广系统 - API测试', colors.bright + colors.yellow);
  console.log('█'.repeat(60));
  logInfo(`测试服务器: ${BASE_URL}`);
  
  let successCount = 0;
  let failCount = 0;

  // 1. 登录
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    logError('登录失败，终止测试');
    return;
  }
  successCount++;

  // 2. 检查微信配置
  const configOk = await testWechatConfig();
  if (!configOk) {
    logError('微信配置检查失败，继续测试其他功能');
    failCount++;
  } else {
    successCount++;
  }

  // 3. 获取公众号列表
  let accountId = await testGetAccounts();
  if (!accountId) {
    // 如果没有公众号，尝试添加
    accountId = await testAddAccount();
    if (accountId) {
      successCount++;
    } else {
      failCount++;
    }
  } else {
    successCount++;
  }

  // 4. 添加测试员工
  const employeeId = await testAddEmployee();
  if (employeeId) {
    successCount++;
  } else {
    failCount++;
  }

  // 5. 创建推广
  const promotion = await testCreatePromotion(accountId, employeeId);
  if (promotion) {
    successCount++;
  } else {
    failCount++;
  }

  // 6. 查询推广列表
  const getPromotionsOk = await testGetPromotionRecords();
  if (getPromotionsOk) {
    successCount++;
  } else {
    failCount++;
  }

  // 7. 更新推广数据
  const updateOk = await testUpdatePromotionStats(promotion?.id || null);
  if (updateOk) {
    successCount++;
  } else {
    failCount++;
  }

  // 8. 查询关注记录
  const getFollowsOk = await testGetFollowRecords();
  if (getFollowsOk) {
    successCount++;
  } else {
    failCount++;
  }

  // 9. 获取统计
  const statsOk = await testGetStats();
  if (statsOk) {
    successCount++;
  } else {
    failCount++;
  }

  // 测试总结
  console.log('\n' + '█'.repeat(60));
  log('  测试完成', colors.bright + colors.cyan);
  console.log('█'.repeat(60));
  logSuccess(`成功: ${successCount} 项`);
  if (failCount > 0) {
    logError(`失败: ${failCount} 项`);
  }
  
  console.log('\n');
  
  if (configOk && promotion) {
    log('📱 下一步：使用微信扫描二维码测试关注功能', colors.bright + colors.yellow);
    logInfo(`二维码URL: ${promotion.qr_image}`);
    logInfo(`确保已配置服务器URL: ${BASE_URL}/api/wechat/callback`);
    logInfo('微信测试号地址: https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login');
  } else if (!configOk) {
    log('⚠️  请先配置微信AppID和AppSecret', colors.bright + colors.yellow);
    logInfo('1. 访问 https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login');
    logInfo('2. 扫码登录获取测试号');
    logInfo('3. 更新.env文件中的WECHAT_APP_ID和WECHAT_APP_SECRET');
    logInfo('4. 重新运行测试脚本');
  }
}

// 运行测试
runTests().catch(error => {
  logError(`测试运行失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});
