import type { Employee, PromotionStats, PromotionRecord, RankingItem } from '../types';

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
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-10 15:30:25',
    isFollowed: true,
    followTime: '2024-03-10 15:30:58',
    nickname: '用户A',
  },
  {
    id: '2',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-10 14:20:15',
    isFollowed: true,
    followTime: '2024-03-10 14:20:42',
    nickname: '用户B',
  },
  {
    id: '3',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-10 13:10:08',
    isFollowed: false,
  },
  {
    id: '4',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-10 11:45:30',
    isFollowed: true,
    followTime: '2024-03-10 11:46:15',
    nickname: '用户C',
  },
  {
    id: '5',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-10 10:30:22',
    isFollowed: true,
    followTime: '2024-03-10 10:31:05',
    nickname: '用户D',
  },
  {
    id: '6',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-09 18:20:45',
    isFollowed: false,
  },
  {
    id: '7',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-09 16:15:30',
    isFollowed: true,
    followTime: '2024-03-09 16:16:22',
    nickname: '用户E',
  },
  {
    id: '8',
    employeeId: 'EMP001',
    employeeName: '张三',
    scanTime: '2024-03-09 14:50:18',
    isFollowed: true,
    followTime: '2024-03-09 14:51:05',
    nickname: '用户F',
  },
];

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
