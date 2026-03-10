// 多账号Mock数据

import type { Account, AccountPromotionRecord, AccountStats } from '../types/account';

// 公众号列表
export const mockAccounts: Account[] = [
  {
    id: 'account_001',
    accountName: '企业服务号',
    appId: 'wx1234567890abcdef',
    avatar: 'https://via.placeholder.com/100',
    qrcodeUrl: 'https://via.placeholder.com/200',
    description: '企业官方服务号，提供最新企业资讯',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'account_002',
    accountName: '产品动态号',
    appId: 'wx0987654321fedcba',
    avatar: 'https://via.placeholder.com/100',
    qrcodeUrl: 'https://via.placeholder.com/200',
    description: '产品更新与动态推送',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'account_003',
    accountName: '客户服务号',
    appId: 'wxabcdef1234567890',
    avatar: 'https://via.placeholder.com/100',
    qrcodeUrl: 'https://via.placeholder.com/200',
    description: '客户服务与技术支持',
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// 员工可推广的公众号
export const mockEmployeeAccounts: Record<string, { enabledAccounts: string[]; defaultAccountId: string }> = {
  EMP001: {
    enabledAccounts: ['account_001', 'account_002', 'account_003'],
    defaultAccountId: 'account_001',
  },
  EMP002: {
    enabledAccounts: ['account_001', 'account_002'],
    defaultAccountId: 'account_001',
  },
  EMP003: {
    enabledAccounts: ['account_001'],
    defaultAccountId: 'account_001',
  },
};

// 多账号推广记录
export const mockAccountPromotionRecords: AccountPromotionRecord[] = [
  // 公众号1的记录
  {
    id: 'record_001',
    employeeId: 'EMP001',
    accountId: 'account_001',
    prospectPhone: '13800138001',
    prospectName: '王五',
    status: 'followed',
    scanTime: '2024-03-08T10:30:00Z',
    followTime: '2024-03-08T10:35:00Z',
    source: 'qrcode',
  },
  {
    id: 'record_002',
    employeeId: 'EMP001',
    accountId: 'account_001',
    prospectPhone: '13800138002',
    status: 'not_followed',
    scanTime: '2024-03-08T14:20:00Z',
    source: 'qrcode',
  },
  // 公众号2的记录
  {
    id: 'record_003',
    employeeId: 'EMP001',
    accountId: 'account_002',
    prospectPhone: '13800138003',
    prospectName: '赵六',
    status: 'followed',
    scanTime: '2024-03-08T09:15:00Z',
    followTime: '2024-03-08T09:18:00Z',
    source: 'qrcode',
  },
  {
    id: 'record_004',
    employeeId: 'EMP001',
    accountId: 'account_002',
    prospectPhone: '13800138004',
    status: 'not_followed',
    scanTime: '2024-03-08T16:45:00Z',
    source: 'link',
  },
  // 公众号3的记录
  {
    id: 'record_005',
    employeeId: 'EMP001',
    accountId: 'account_003',
    prospectPhone: '13800138005',
    prospectName: '孙七',
    status: 'followed',
    scanTime: '2024-03-08T11:00:00Z',
    followTime: '2024-03-08T11:05:00Z',
    source: 'qrcode',
  },
];

// 多账号统计数据
export const generateAccountStats = (employeeId: string, accountId: string): AccountStats => {
  const accountRecords = mockAccountPromotionRecords.filter(
    r => r.employeeId === employeeId && r.accountId === accountId
  );

  const scanCount = accountRecords.length;
  const followCount = accountRecords.filter(r => r.status === 'followed').length;
  const followRate = scanCount > 0 ? (followCount / scanCount) * 100 : 0;

  return {
    accountId,
    accountName: mockAccounts.find(a => a.id === accountId)?.accountName || '',
    scanCount,
    followCount,
    followRate: Math.round(followRate * 10) / 10,
    todayScans: Math.floor(Math.random() * 5),
    todayFollows: Math.floor(Math.random() * 3),
    weekScans: Math.floor(scanCount * 0.3),
    weekFollows: Math.floor(followCount * 0.3),
    monthScans: scanCount,
    monthFollows: followCount,
    rank: Math.floor(Math.random() * 20) + 1,
  };
};

// 获取员工所有公众号的统计数据
export const getEmployeeAccountStats = (employeeId: string) => {
  const employeeConfig = mockEmployeeAccounts[employeeId];
  if (!employeeConfig) return null;

  const accountStats: { [accountId: string]: AccountStats } = {};
  
  employeeConfig.enabledAccounts.forEach(accountId => {
    accountStats[accountId] = generateAccountStats(employeeId, accountId);
  });

  // 计算汇总数据
  const totalScanCount = Object.values(accountStats).reduce((sum, stat) => sum + stat.scanCount, 0);
  const totalFollowCount = Object.values(accountStats).reduce((sum, stat) => sum + stat.followCount, 0);
  const avgFollowRate = totalScanCount > 0 ? (totalFollowCount / totalScanCount) * 100 : 0;

  return {
    accountStats,
    totalStats: {
      totalScanCount,
      totalFollowCount,
      totalAccountCount: Object.keys(accountStats).length,
      avgFollowRate: Math.round(avgFollowRate * 10) / 10,
    },
  };
};

// 获取员工默认公众号
export const getDefaultAccount = (employeeId: string): Account | null => {
  const employeeConfig = mockEmployeeAccounts[employeeId];
  if (!employeeConfig || !employeeConfig.defaultAccountId) return null;

  return mockAccounts.find(a => a.id === employeeConfig.defaultAccountId) || null;
};

// 获取员工可推广的公众号列表
export const getEmployeeAccounts = (employeeId: string): Account[] => {
  const employeeConfig = mockEmployeeAccounts[employeeId];
  if (!employeeConfig) return [];

  return mockAccounts.filter(a => 
    employeeConfig.enabledAccounts.includes(a.id) && a.status === 'active'
  );
};
