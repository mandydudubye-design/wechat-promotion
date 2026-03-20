import type { Employee, PromotionStats, PromotionRecord, RankingItem, OfficialAccount, PosterTemplate, EmployeePromotionCode, EmployeeAccountFollow, AccountPromotionStats } from '../types';

// 模拟公众号列表
export const mockAccounts: OfficialAccount[] = [
  {
    id: 'acc001',
    name: '品牌官方号',
    avatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx1/0',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=acc001',
    isPrimary: true,
    order: 1,
  },
  {
    id: 'acc002',
    name: '活动专号',
    avatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx2/0',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=acc002',
    isPrimary: false,
    order: 2,
  },
  {
    id: 'acc003',
    name: '客户服务号',
    avatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx3/0',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=acc003',
    isPrimary: false,
    order: 3,
  },
];

// 模拟当前登录员工
export const mockCurrentEmployee: Employee = {
  id: '1',
  employeeId: 'EMP001',
  name: '张三',
  department: '市场部',
  phone: '13800138000',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EMP001',
  wechatOpenId: 'wx_openid_001',
  isBound: true,
  createdAt: '2024-01-15T10:30:00Z',
};

// 模拟推广统计
export const mockPromotionStats: PromotionStats = {
  employeeId: 'EMP001',
  employeeName: '张三',
  scanCount: 156,
  followCount: 89,
  todayScanCount: 12,
  todayFollowCount: 7,
  monthScanCount: 89,
  monthFollowCount: 52,
};

// 模拟推广记录
export const mockPromotionRecords: PromotionRecord[] = [
  // 品牌官方号记录
  {
    id: '0',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc001',
    accountName: '品牌官方号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx1/0',
    scanTime: '2026-03-20 09:30:25',
    isFollowed: true,
    followTime: '2026-03-20 09:31:00',
    nickname: '用户X',
  },
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc001',
    accountName: '品牌官方号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx1/0',
    scanTime: '2026-03-10 15:30:25',
    isFollowed: true,
    followTime: '2026-03-10 15:30:58',
    nickname: '用户A',
  },
  {
    id: '2',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc001',
    accountName: '品牌官方号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx1/0',
    scanTime: '2026-03-10 14:20:15',
    isFollowed: true,
    followTime: '2026-03-10 14:20:42',
    nickname: '用户B',
  },
  {
    id: '3',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc001',
    accountName: '品牌官方号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx1/0',
    scanTime: '2026-03-10 13:10:08',
    isFollowed: false,
  },
  // 活动专号记录
  {
    id: '4',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc002',
    accountName: '活动专号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx2/0',
    scanTime: '2026-03-19 11:45:30',
    isFollowed: true,
    followTime: '2026-03-19 11:46:15',
    nickname: '用户C',
  },
  {
    id: '5',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc002',
    accountName: '活动专号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx2/0',
    scanTime: '2026-03-18 10:30:22',
    isFollowed: true,
    followTime: '2026-03-18 10:31:05',
    nickname: '用户D',
  },
  {
    id: '6',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc002',
    accountName: '活动专号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx2/0',
    scanTime: '2026-03-17 18:20:45',
    isFollowed: false,
  },
  // 客户服务号记录
  {
    id: '7',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc003',
    accountName: '客户服务号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx3/0',
    scanTime: '2026-03-16 16:15:30',
    isFollowed: true,
    followTime: '2026-03-16 16:16:22',
    nickname: '用户E',
  },
  {
    id: '8',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc003',
    accountName: '客户服务号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx3/0',
    scanTime: '2026-03-15 14:50:18',
    isFollowed: true,
    followTime: '2026-03-15 14:51:05',
    nickname: '用户F',
  },
  {
    id: '9',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc003',
    accountName: '客户服务号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx3/0',
    scanTime: '2026-03-14 12:30:00',
    isFollowed: false,
  },
  {
    id: '10',
    employeeId: 'EMP001',
    employeeName: '张三',
    accountId: 'acc003',
    accountName: '客户服务号',
    accountAvatar: 'https://mmbiz.qpic.cn/mmbiz_png/xxx3/0',
    scanTime: '2026-03-13 10:00:00',
    isFollowed: true,
    followTime: '2026-03-13 10:00:45',
    nickname: '用户G',
  },
];

// 计算每个公众号的推广统计
export function getAccountPromotionStats(records: PromotionRecord[]): AccountPromotionStats[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const accountMap = new Map<string, AccountPromotionStats>();

  records.forEach(record => {
    const scanDate = new Date(record.scanTime);

    if (!accountMap.has(record.accountId)) {
      accountMap.set(record.accountId, {
        accountId: record.accountId,
        accountName: record.accountName,
        accountAvatar: record.accountAvatar,
        scanCount: 0,
        followCount: 0,
        todayScanCount: 0,
        todayFollowCount: 0,
        monthScanCount: 0,
        monthFollowCount: 0,
      });
    }

    const stats = accountMap.get(record.accountId)!;
    stats.scanCount++;
    if (record.isFollowed) stats.followCount++;
    if (scanDate >= today) {
      stats.todayScanCount++;
      if (record.isFollowed) stats.todayFollowCount++;
    }
    if (scanDate >= monthStart) {
      stats.monthScanCount++;
      if (record.isFollowed) stats.monthFollowCount++;
    }
  });

  return Array.from(accountMap.values());
}

// 模拟今日排行榜
export const mockTodayRankings: RankingItem[] = [
  { rank: 1, employeeId: 'EMP002', employeeName: '李四', department: '销售部', scanCount: 25, followCount: 18 },
  { rank: 2, employeeId: 'EMP001', employeeName: '张三', department: '市场部', scanCount: 12, followCount: 7, isMe: true },
  { rank: 3, employeeId: 'EMP003', employeeName: '王五', department: '客服部', scanCount: 10, followCount: 6 },
  { rank: 4, employeeId: 'EMP004', employeeName: '赵六', department: '运营部', scanCount: 8, followCount: 5 },
  { rank: 5, employeeId: 'EMP005', employeeName: '孙七', department: '市场部', scanCount: 7, followCount: 4 },
];

// 模拟本月排行榜
export const mockMonthRankings: RankingItem[] = [
  { rank: 1, employeeId: 'EMP002', employeeName: '李四', department: '销售部', scanCount: 156, followCount: 98 },
  { rank: 2, employeeId: 'EMP003', employeeName: '王五', department: '客服部', scanCount: 143, followCount: 87 },
  { rank: 3, employeeId: 'EMP001', employeeName: '张三', department: '市场部', scanCount: 89, followCount: 52, isMe: true },
  { rank: 4, employeeId: 'EMP004', employeeName: '赵六', department: '运营部', scanCount: 78, followCount: 45 },
  { rank: 5, employeeId: 'EMP005', employeeName: '孙七', department: '市场部', scanCount: 65, followCount: 38 },
];

// 所有员工数据（用于绑定验证）
export const mockAllEmployees: Employee[] = [
  { id: '1', employeeId: 'EMP001', name: '张三', department: '市场部', phone: '13800138000', isBound: true, createdAt: '2024-01-15' },
  { id: '2', employeeId: 'EMP002', name: '李四', department: '销售部', phone: '13800138001', isBound: true, createdAt: '2024-01-16' },
  { id: '3', employeeId: 'EMP003', name: '王五', department: '客服部', phone: '13800138002', isBound: true, createdAt: '2024-01-17' },
  { id: '4', employeeId: 'EMP004', name: '赵六', department: '运营部', phone: '13800138003', isBound: false, createdAt: '2024-01-18' },
  { id: '5', employeeId: 'EMP005', name: '孙七', department: '市场部', phone: '13800138004', isBound: false, createdAt: '2024-01-19' },
];

// 模拟员工列表（用于管理端）
export const mockEmployees: Employee[] = mockAllEmployees;

// 模拟排行榜数据（用于排行榜页面）
export const mockRankingData: RankingItem[] = [
  { rank: 1, employeeId: 'EMP002', employeeName: '李四', department: '销售部', scanCount: 256, followCount: 198 },
  { rank: 2, employeeId: 'EMP003', employeeName: '王五', department: '客服部', scanCount: 223, followCount: 167 },
  { rank: 3, employeeId: 'EMP005', employeeName: '孙七', department: '市场部', scanCount: 189, followCount: 142 },
  { rank: 4, employeeId: 'EMP001', employeeName: '张三', department: '市场部', scanCount: 156, followCount: 89, isMe: true },
  { rank: 5, employeeId: 'EMP004', employeeName: '赵六', department: '运营部', scanCount: 128, followCount: 75 },
  { rank: 6, employeeId: 'EMP006', employeeName: '周八', department: '技术部', scanCount: 98, followCount: 62 },
  { rank: 7, employeeId: 'EMP007', employeeName: '吴九', department: '人事部', scanCount: 85, followCount: 51 },
  { rank: 8, employeeId: 'EMP008', employeeName: '郑十', department: '财务部', scanCount: 72, followCount: 45 },
  { rank: 9, employeeId: 'EMP009', employeeName: '冯十一', department: '行政部', scanCount: 65, followCount: 38 },
  { rank: 10, employeeId: 'EMP010', employeeName: '陈十二', department: '市场部', scanCount: 58, followCount: 32 },
];

// 模拟公众号列表
export const mockOfficialAccounts: OfficialAccount[] = [
  {
    id: 'oa_001',
    name: '品牌官方号',
    avatar: 'https://mmbiz.qpic.cn/mmbiz_png/placeholder1/0',
    description: '品牌官方公众号，获取最新产品资讯',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_001_EMP001',
    deepLink: 'weixin://contacts/profile/gh_xxxxxx1',
    isPrimary: true,  // 主推公众号
    order: 1,
  },
  {
    id: 'oa_002',
    name: '客户服务中心',
    avatar: 'https://mmbiz.qpic.cn/mmbiz_png/placeholder2/0',
    description: '7x24小时客户服务支持',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_002_EMP001',
    deepLink: 'weixin://contacts/profile/gh_xxxxxx2',
    isPrimary: false,
    order: 2,
  },
  {
    id: 'oa_003',
    name: '会员俱乐部',
    avatar: 'https://mmbiz.qpic.cn/mmbiz_png/placeholder3/0',
    description: '会员专享福利与活动',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_003_EMP001',
    deepLink: 'weixin://contacts/profile/gh_xxxxxx3',
    isPrimary: false,
    order: 3,
  },
];

// 模拟海报模板列表
export const mockPosterTemplates: PosterTemplate[] = [
  {
    id: 'tpl_001',
    name: '简约商务风',
    previewUrl: '/templates/preview/tpl_001.jpg',
    templateUrl: '/templates/tpl_001.png',
    width: 750,
    height: 1334,
    qrCodeConfig: {
      x: 275,
      y: 950,
      width: 200,
      height: 200,
      borderRadius: 10,
    },
    avatarConfig: {
      x: 300,
      y: 200,
      width: 150,
      height: 150,
      borderRadius: 75,
    },
    textConfigs: [
      { key: 'name', x: 375, y: 400, fontSize: 32, color: '#333333', fontWeight: 'bold', textAlign: 'center' },
      { key: 'department', x: 375, y: 450, fontSize: 24, color: '#666666', textAlign: 'center' },
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl_002',
    name: '节日促销风',
    previewUrl: '/templates/preview/tpl_002.jpg',
    templateUrl: '/templates/tpl_002.png',
    width: 750,
    height: 1334,
    qrCodeConfig: {
      x: 275,
      y: 1000,
      width: 200,
      height: 200,
      borderRadius: 0,
    },
    textConfigs: [
      { key: 'name', x: 375, y: 300, fontSize: 36, color: '#FF4444', fontWeight: 'bold', textAlign: 'center' },
    ],
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'tpl_003',
    name: '清新简约',
    previewUrl: '/templates/preview/tpl_003.jpg',
    templateUrl: '/templates/tpl_003.png',
    width: 750,
    height: 1334,
    qrCodeConfig: {
      x: 250,
      y: 900,
      width: 250,
      height: 250,
      borderRadius: 20,
    },
    avatarConfig: {
      x: 275,
      y: 150,
      width: 200,
      height: 200,
      borderRadius: 100,
    },
    textConfigs: [
      { key: 'name', x: 375, y: 420, fontSize: 40, color: '#2C3E50', fontWeight: 'bold', textAlign: 'center' },
      { key: 'department', x: 375, y: 480, fontSize: 28, color: '#7F8C8D', textAlign: 'center' },
      { key: 'employeeId', x: 375, y: 520, fontSize: 24, color: '#95A5A6', textAlign: 'center' },
    ],
    isActive: true,
    createdAt: '2024-03-01T00:00:00Z',
  },
];

// 模拟员工推广码列表
export const mockEmployeePromotionCodes: EmployeePromotionCode[] = [
  {
    id: 'epc_001',
    employeeId: 'EMP001',
    accountId: 'oa_001',
    account: mockOfficialAccounts[0],
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_001_EMP001',
    parameter: 'EMP001_oa_001',
  },
  {
    id: 'epc_002',
    employeeId: 'EMP001',
    accountId: 'oa_002',
    account: mockOfficialAccounts[1],
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_002_EMP001',
    parameter: 'EMP001_oa_002',
  },
  {
    id: 'epc_003',
    employeeId: 'EMP001',
    accountId: 'oa_003',
    account: mockOfficialAccounts[2],
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_003_EMP001',
    parameter: 'EMP001_oa_003',
  },
];

// 模拟员工公众号关注状态
export const mockEmployeeFollows: EmployeeAccountFollow[] = [
  {
    accountId: 'oa_001',
    accountName: '品牌官方号',
    isFollowed: true,
    followTime: '2024-03-15 10:30:00',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_001_EMP001',
    deepLink: 'weixin://contacts/profile/gh_xxxxxx1',
  },
  {
    accountId: 'oa_002',
    accountName: '客户服务中心',
    isFollowed: false,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_002_EMP001',
    deepLink: 'weixin://contacts/profile/gh_xxxxxx2',
  },
  {
    accountId: 'oa_003',
    accountName: '会员俱乐部',
    isFollowed: false,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=oa_003_EMP001',
    deepLink: 'weixin://contacts/profile/gh_xxxxxx3',
  },
];
