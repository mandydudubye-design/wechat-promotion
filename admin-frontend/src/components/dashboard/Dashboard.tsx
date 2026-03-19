import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Users, UserCheck, TrendingUp, Building2, ArrowUpRight, ArrowDownRight, Target, UserPlus, CheckCircle } from 'lucide-react'
import { mockOfficialAccounts, mockPromotionStatistics, mockEmployeeFollowStats, mockPromotionStats } from '../../data/mockData'
import { formatNumber } from '../../lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import type { OfficialAccount } from '../../types'

// 趋势数据（按公众号）
const mockTrendDataByAccount = {
  '1': [
    { date: '3/5', subscribe: 120, unsubscribe: 25, net: 95 },
    { date: '3/6', subscribe: 98, unsubscribe: 30, net: 68 },
    { date: '3/7', subscribe: 145, unsubscribe: 22, net: 123 },
    { date: '3/8', subscribe: 132, unsubscribe: 35, net: 97 },
    { date: '3/9', subscribe: 156, unsubscribe: 28, net: 128 },
    { date: '3/10', subscribe: 108, unsubscribe: 40, net: 68 },
    { date: '3/11', subscribe: 85, unsubscribe: 18, net: 67 },
  ],
  '2': [
    { date: '3/5', subscribe: 65, unsubscribe: 12, net: 53 },
    { date: '3/6', subscribe: 72, unsubscribe: 18, net: 54 },
    { date: '3/7', subscribe: 58, unsubscribe: 15, net: 43 },
    { date: '3/8', subscribe: 80, unsubscribe: 22, net: 58 },
    { date: '3/9', subscribe: 92, unsubscribe: 16, net: 76 },
    { date: '3/10', subscribe: 68, unsubscribe: 25, net: 43 },
    { date: '3/11', subscribe: 42, unsubscribe: 10, net: 32 },
  ],
  '3': [
    { date: '3/5', subscribe: 35, unsubscribe: 8, net: 27 },
    { date: '3/6', subscribe: 42, unsubscribe: 12, net: 30 },
    { date: '3/7', subscribe: 28, unsubscribe: 6, net: 22 },
    { date: '3/8', subscribe: 55, unsubscribe: 15, net: 40 },
    { date: '3/9', subscribe: 48, unsubscribe: 10, net: 38 },
    { date: '3/10', subscribe: 32, unsubscribe: 18, net: 14 },
    { date: '3/11', subscribe: 18, unsubscribe: 5, net: 13 },
  ],
}

// 汇总趋势数据
const mockTotalTrendData = [
  { date: '3/5', subscribe: 220, unsubscribe: 45, net: 175 },
  { date: '3/6', subscribe: 212, unsubscribe: 60, net: 152 },
  { date: '3/7', subscribe: 231, unsubscribe: 43, net: 188 },
  { date: '3/8', subscribe: 267, unsubscribe: 72, net: 195 },
  { date: '3/9', subscribe: 296, unsubscribe: 54, net: 242 },
  { date: '3/10', subscribe: 208, unsubscribe: 83, net: 125 },
  { date: '3/11', subscribe: 145, unsubscribe: 33, net: 112 },
]

// 员工关注公众号分布饼图数据
const followDistributionData = [
  { name: '关注全部', value: mockEmployeeFollowStats.allAccountsFollowed, color: '#22c55e' },
  { name: '关注部分', value: mockEmployeeFollowStats.partialAccountsFollowed, color: '#3b82f6' },
  { name: '未关注', value: mockEmployeeFollowStats.noAccountFollowed, color: '#ef4444' },
]

export function Dashboard() {
  const [selectedAccount, setSelectedAccount] = useState<OfficialAccount | 'all'>('all')
  
  // 计算汇总数据
  const totalStats = {
    accounts: mockOfficialAccounts.length,
    totalFollowers: mockOfficialAccounts.reduce((sum, acc) => sum + acc.totalFollowers, 0),
    totalEmployeeFollowers: mockOfficialAccounts.reduce((sum, acc) => sum + acc.employeeFollowers, 0),
    todayNewFollows: mockOfficialAccounts.reduce((sum, acc) => sum + acc.todayNewFollows, 0),
    monthNewFollows: mockOfficialAccounts.reduce((sum, acc) => sum + acc.monthNewFollows, 0),
  }
  
  // 获取当前选中账号的趋势数据
  const currentTrendData = selectedAccount === 'all' 
    ? mockTotalTrendData 
    : mockTrendDataByAccount[selectedAccount.id as keyof typeof mockTrendDataByAccount] || mockTotalTrendData

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据概览</h1>
        <p className="text-muted-foreground">
          多公众号推广追踪数据汇总
        </p>
      </div>

      {/* 第一行：公众号概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              公众号数量
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalStats.accounts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已接入推广追踪
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总关注人数
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatNumber(totalStats.totalFollowers)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              所有公众号累计
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              员工关注数
            </CardTitle>
            <UserCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalStats.totalEmployeeFollowers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占总关注 {((totalStats.totalEmployeeFollowers / totalStats.totalFollowers) * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              本月净增
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">+{formatNumber(totalStats.monthNewFollows)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              今日新增 +{formatNumber(totalStats.todayNewFollows)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 第二行：推广任务统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-hover border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              参与推广员工
            </CardTitle>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{mockPromotionStats.participatingEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占员工总数 {((mockPromotionStats.participatingEmployees / mockEmployeeFollowStats.totalEmployees) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              推广带来关注
            </CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{mockPromotionStats.totalPromotedFollows}</div>
            <p className="text-xs text-muted-foreground mt-1">
              人均推广 {mockPromotionStats.avgPromotionPerEmployee} 人
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              有效推广员工
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{mockPromotionStats.employeesWithPromotion}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占参与员工 {((mockPromotionStats.employeesWithPromotion / mockPromotionStats.participatingEmployees) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              未参与推广
            </CardTitle>
            <Users className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {mockEmployeeFollowStats.totalEmployees - mockPromotionStats.participatingEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              待激励参与
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 第三行：员工关注公众号分布 + 公众号列表 */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 员工关注公众号分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>员工关注公众号分布</CardTitle>
            <CardDescription>
              共 {mockEmployeeFollowStats.totalEmployees} 名员工
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={followDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {followDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {followDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 公众号详情表格 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>公众号详情</CardTitle>
            <CardDescription>点击行查看该账号趋势数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">公众号</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">总关注</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">员工关注</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">今日</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">本月</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockOfficialAccounts.map((account) => (
                    <tr 
                      key={account.id} 
                      className={`hover:bg-muted/30 cursor-pointer transition-colors ${selectedAccount !== 'all' && selectedAccount?.id === account.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedAccount(selectedAccount === 'all' ? account : (selectedAccount?.id === account.id ? 'all' : account))}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {account.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-xs text-muted-foreground">{account.appId.slice(0, 10)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium">{formatNumber(account.totalFollowers)}</td>
                      <td className="p-3 text-right text-purple-600 font-medium">{account.employeeFollowers}</td>
                      <td className="p-3 text-right text-green-600">+{account.todayNewFollows}</td>
                      <td className="p-3 text-right text-blue-600">+{formatNumber(account.monthNewFollows)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 第四行：趋势图 + 排行榜 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 趋势图 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedAccount === 'all' ? '整体关注趋势' : `${selectedAccount.name} 关注趋势`}
                </CardTitle>
                <CardDescription>最近7天关注变化</CardDescription>
              </div>
              {selectedAccount !== 'all' && (
                <button 
                  onClick={() => setSelectedAccount('all')}
                  className="text-xs text-primary hover:underline"
                >
                  查看全部
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={currentTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="subscribe" name="新增关注" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unsubscribe" name="取消关注" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 推广排行榜 */}
        <Card>
          <CardHeader>
            <CardTitle>推广排行榜</CardTitle>
            <CardDescription>本月推广效果 TOP 5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPromotionStatistics.slice(0, 5).map((stat, index) => (
                <div key={stat.employeeId} className="flex items-center gap-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.employeeName}</span>
                      <span className="text-xs text-muted-foreground">{stat.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>推广 {stat.subscribeCount} 人</span>
                      <span>·</span>
                      <span>转化率 {stat.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 font-bold ${
                    stat.netCount > 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {stat.netCount > 0 ? (
                      <><ArrowUpRight className="h-4 w-4" />+{stat.netCount}</>
                    ) : (
                      <><ArrowDownRight className="h-4 w-4" />{stat.netCount}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
