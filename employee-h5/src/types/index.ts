// 员工信息
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  phone?: string;
  qrCodeUrl?: string;
  wechatOpenId?: string;
  isBound: boolean;
  createdAt: string;
}

// 推广统计
export interface PromotionStats {
  employeeId: string;
  employeeName: string;
  scanCount: number;
  followCount: number;
  todayScanCount: number;
  todayFollowCount: number;
  monthScanCount: number;
  monthFollowCount: number;
}

// 公众号信息
export interface OfficialAccount {
  id: string;
  name: string;
  avatar?: string;
}

// 推广记录
export interface PromotionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  accountId: string; // 公众号ID
  accountName: string; // 公众号名称
  accountAvatar?: string; // 公众号头像
  scanTime: string;
  isFollowed: boolean;
  followTime?: string;
  nickname?: string;
}

// 排行榜数据
export interface RankingItem {
  rank: number;
  employeeId: string;
  employeeName: string;
  department: string;
  scanCount: number;
  followCount: number;
  isMe?: boolean;
}

// API 响应
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 绑定请求
export interface BindRequest {
  employeeId: string;
  name: string;
  phone?: string;
}

// 用户信息
export interface UserInfo {
  employee: Employee;
  stats: PromotionStats;
}