// 员工信息
export interface Employee {
  id?: number;
  employee_id: string;
  name: string;
  phone: string;
  department?: string;
  position?: string;
  bind_status: number; // 0-未绑定 1-已绑定 2-已禁用
  wechat_openid?: string;
  wechat_nickname?: string;
  wechat_avatar?: string;
  bind_time?: Date;
  total_followers: number; // 总关注数
  created_at?: Date;
  updated_at?: Date;
}

// 微信公众号
export interface WechatAccount {
  id?: number;
  account_name: string;
  app_id: string;
  description?: string;
  avatar?: string;
  status: number; // 0-停用 1-启用
  created_at?: Date;
  updated_at?: Date;
}

// 推广记录
export interface PromotionRecord {
  id?: number;
  employee_id: string;
  account_id: number;
  scene_id: string;
  qr_code_url: string;
  scan_count: number; // 扫码次数
  follow_count: number; // 关注数
  created_at?: Date;
  updated_at?: Date;
}

// 关注记录
export interface FollowRecord {
  id?: number;
  employee_id: string;
  account_id: number;
  openid: string;
  nickname?: string;
  avatar?: string;
  follow_status: number; // 0-未关注 1-已关注
  follow_time?: Date;
  unfollow_time?: Date;
  scene_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

// 关注事件日志
export interface FollowEvent {
  id?: number;
  employee_id: string;
  account_id: number;
  openid: string;
  event_type: number; // 1-关注 2-取关
  event_time: Date;
  scene_id?: string;
  created_at?: Date;
}

// 管理员
export interface Admin {
  id?: number;
  username: string;
  password: string;
  name?: string;
  email?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

// API响应
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
