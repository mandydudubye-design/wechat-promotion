/**
 * API测试脚本
 * 测试所有主要接口
 */

const BASE_URL = 'http://localhost:3000';
let authToken = '';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
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

// 发送请求
async function request(endpoint: string, options: any = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken && !endpoint.includes('/login')) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    logError(`请求失败: ${endpoint}`);
    console.error(error);
    return { status: 0, data: { message: '网络错误' } };
  }
}

// 测试序列
async function runTests() {
  log('\n🚀 开始API测试...\n', colors.yellow);

  // 1. 健康检查
  logInfo('测试健康检查接口...');
  const health = await request('/health');
  if (health.status === 200) {
    logSuccess('健康检查通过');
  } else {
    logError('健康检查失败');
  }

  // 2. 管理员登录
  logInfo('\n测试管理员登录...');
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });

  if (login.status === 200 && login.data.code === 200) {
    authToken = login.data.data.token;
    logSuccess('登录成功');
  } else {
    logError('登录失败');
    return;
  }

  // 3. 获取当前用户信息
  logInfo('\n测试获取当前用户信息...');
  const me = await request('/api/auth/me');
  if (me.status === 200 && me.data.code === 200) {
    logSuccess('获取用户信息成功');
  } else {
    logError('获取用户信息失败');
  }

  // 4. 获取员工列表
  logInfo('\n测试获取员工列表...');
  const employees = await request('/api/employees?page=1&pageSize=10');
  if (employees.status === 200 && employees.data.code === 200) {
    logSuccess(`获取员工列表成功，共 ${employees.data.data.total} 条记录`);
  } else {
    logError('获取员工列表失败');
  }

  // 5. 添加员工
  logInfo('\n测试添加员工...');
  const addEmployee = await request('/api/employees', {
    method: 'POST',
    body: JSON.stringify({
      employee_id: 'TEST001',
      name: '测试员工',
      phone: '13800138000',
      department: '技术部',
      position: '工程师'
    })
  });

  if (addEmployee.status === 200 && addEmployee.data.code === 200) {
    logSuccess('添加员工成功');
  } else if (addEmployee.data.code === 400 && addEmployee.data.message.includes('已存在')) {
    logSuccess('员工已存在（正常）');
  } else {
    logError('添加员工失败');
  }

  // 6. 获取公众号列表
  logInfo('\n测试获取公众号列表...');
  const accounts = await request('/api/accounts');
  if (accounts.status === 200 && accounts.data.code === 200) {
    logSuccess(`获取公众号列表成功，共 ${accounts.data.data.length} 个公众号`);
  } else {
    logError('获取公众号列表失败');
  }

  // 7. 获取推广记录列表
  logInfo('\n测试获取推广记录列表...');
  const promotions = await request('/api/promotion/records?page=1&pageSize=10');
  if (promotions.status === 200 && promotions.data.code === 200) {
    logSuccess(`获取推广记录成功，共 ${promotions.data.data.total} 条记录`);
  } else {
    logError('获取推广记录失败');
  }

  // 8. 获取关注记录列表
  logInfo('\n测试获取关注记录列表...');
  const follows = await request('/api/follow/records?page=1&pageSize=10');
  if (follows.status === 200 && follows.data.code === 200) {
    logSuccess(`获取关注记录成功，共 ${follows.data.data.total} 条记录`);
  } else {
    logError('获取关注记录失败');
  }

  // 9. 获取统计数据
  logInfo('\n测试获取统计数据...');
  const stats = await request('/api/stats/overview');
  if (stats.status === 200 && stats.data.code === 200) {
    logSuccess('获取统计数据成功');
  } else {
    logError('获取统计数据失败');
  }

  // 10. 获取排行榜
  logInfo('\n测试获取员工排行榜...');
  const ranking = await request('/api/stats/ranking/employees?type=follow&limit=10');
  if (ranking.status === 200 && ranking.data.code === 200) {
    logSuccess(`获取排行榜成功，共 ${ranking.data.data.length} 个员工`);
  } else {
    logError('获取排行榜失败');
  }

  log('\n✅ 测试完成！\n', colors.green);
}

// 运行测试
runTests().catch(error => {
  logError('测试过程中发生错误:');
  console.error(error);
  process.exit(1);
});
