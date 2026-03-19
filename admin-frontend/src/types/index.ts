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
  followStatus: 0 | 1 // 0-未关注 1-已关注
  followTime?: string
  qrCodeUrl?: string
  sceneId?: string
  promotionCount: number
  createdAt: string
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

export interface OfficialAccount {
  id: string
  name: string
  avatar?: string
  appId: string
  totalFollowers: number
  employeeFollowers: number // 员工关注数
  todayNewFollows: number
  monthNewFollows: number
  status: 0 | 1 // 0-已停用 1-正常
}

export interface EmployeeFollowStats {
  totalEmployees: number
  allAccountsFollowed: number // 关注了全部公众号的员工数
  partialAccountsFollowed: number // 关注了部分公众号的员工数
  noAccountFollowed: number // 未关注任何公众号的员工数
}

export interface PromotionStats {
  participatingEmployees: number // 参与推广的员工数
  totalPromotedFollows: number // 推广带来的关注数
  employeesWithPromotion: number // 有带来推广关注的员工数
  avgPromotionPerEmployee: number // 人均推广数
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
  accountId?: string // 支持按公众号筛选
}
