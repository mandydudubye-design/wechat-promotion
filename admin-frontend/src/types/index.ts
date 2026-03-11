// 单个公众号关注状态
export interface AccountFollowStatus {
  accountId: string
  accountName: string
  isFollowed: boolean
  followTime?: string
}

export interface Employee {
  id: string
  employeeNo: string
  name: string
  department: string
  position?: string
  phone?: string
  email?: string
  openid?: string
  bindStatus: 0 | 1 | 2 // 0-未绑定 1-已绑定 2-已禁用
  bindTime?: string
  followStatus: 0 | 1 // 0-未关注 1-已关注 (兼容旧数据)
  followTime?: string
  qrCodeUrl?: string
  sceneId?: string
  promotionCount: number
  createdAt: string
  // 新增：多公众号关注状态
  followStatuses?: AccountFollowStatus[]
}

export interface PromotionRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  sceneId: string
  newUserOpenid: string
  newUserNickname?: string
  scanTime: string
  subscribeTime?: string
  status: 0 | 1 // 0-仅扫码 1-已关注
}

export interface PromotionStatistics {
  employeeId: string
  employeeName: string
  department: string
  scanCount: number
  subscribeCount: number
  unsubscribeCount: number
  netCount: number
  conversionRate: number
}

export interface FollowRecord {
  id: string
  employeeId: string
  employeeName: string
  openid: string
  eventType: 1 | 2 // 1-关注 2-取关
  eventTime: string
}

export interface DashboardStats {
  totalEmployees: number
  boundEmployees: number
  followingEmployees: number
  todayNewFollows: number
  monthNewFollows: number
}

export interface TrendData {
  date: string
  subscribe: number
  unsubscribe: number
  net: number
}