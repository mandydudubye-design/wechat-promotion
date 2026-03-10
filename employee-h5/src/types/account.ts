// 多公众号支持类型定义

export interface Account {
  id: string;
  accountName: string;
  appId: string;
  avatar: string;
  qrcodeUrl: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface EmployeeAccount {
  employeeId: string;
  enabledAccounts: string[];
  defaultAccountId?: string;
}

export interface AccountPromotionRecord {
  id: string;
  employeeId: string;
  accountId: string;
  prospectPhone: string;
  prospectName?: string;
  status: 'followed' | 'not_followed';
  scanTime: string;
  followTime?: string;
  source: 'qrcode' | 'link';
}

export interface AccountStats {
  accountId: string;
  accountName: string;
  scanCount: number;
  followCount: number;
  followRate: number;
  todayScans: number;
  todayFollows: number;
  weekScans: number;
  weekFollows: number;
  monthScans: number;
  monthFollows: number;
  rank?: number;
}

export interface EmployeeAccountStats {
  employeeId: string;
  // 单公众号统计
  accountStats: {
    [accountId: string]: AccountStats;
  };
  // 汇总统计
  totalStats: {
    totalScanCount: number;
    totalFollowCount: number;
    totalAccountCount: number;
    avgFollowRate: number;
  };
}

export interface AccountRanking {
  accountId: string;
  accountName: string;
  rankings: {
    [accountId: string]: number;
  };
  totalRanking?: number;
}
