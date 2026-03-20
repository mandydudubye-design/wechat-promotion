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

// 公众号推广统计
export interface AccountPromotionStats {
  accountId: string;
  accountName: string;
  accountAvatar?: string;
  scanCount: number;
  followCount: number;
  todayScanCount: number;
  todayFollowCount: number;
  monthScanCount: number;
  monthFollowCount: number;
}

// 推广记录
export interface PromotionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  accountId: string;        // 公众号ID
  accountName: string;       // 公众号名称
  accountAvatar?: string;   // 公众号头像
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
  department: string;
  phone: string;
}

// 用户信息
export interface UserInfo {
  employee: Employee;
  stats: PromotionStats;
}

// 公众号信息
export interface OfficialAccount {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  qrCodeUrl: string;  // 公众号二维码图片URL
  deepLink?: string;  // 公众号跳转链接
  isPrimary: boolean; // 是否主推公众号
  order: number;      // 排序
}

// 员工公众号关注状态
export interface EmployeeAccountFollow {
  accountId: string;
  accountName: string;
  accountAvatar?: string;
  isFollowed: boolean;       // 是否已关注
  followTime?: string;      // 关注时间
  qrCodeUrl?: string;       // 关注二维码
  deepLink?: string;       // 跳转链接
}

// 海报模板
export interface PosterTemplate {
  id: string;
  name: string;
  previewUrl: string;    // 模板预览图
  templateUrl: string;   // 模板原图URL
  width: number;
  height: number;
  // 二维码配置
  qrCodeConfig: {
    x: number;           // 二维码位置X
    y: number;           // 二维码位置Y
    width: number;       // 二维码宽度
    height: number;      // 二维码高度
    borderRadius?: number; // 圆角
  };
  // 头像配置（可选）
  avatarConfig?: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
  };
  // 文字配置（可选）
  textConfigs?: Array<{
    key: string;         // 字段名：name, department, employeeId
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  }>;
  isActive: boolean;
  createdAt: string;
}

// 员工推广码（关联公众号）
export interface EmployeePromotionCode {
  id: string;
  employeeId: string;
  accountId: string;
  account: OfficialAccount;
  qrCodeUrl: string;     // 带参数二维码URL（带员工标识）
  posterUrl?: string;    // 生成的海报图URL
  parameter: string;     // 推广参数
}

// 海报生成请求
export interface PosterGenerateRequest {
  templateId: string;
  accountId: string;
  employeeId: string;
}
