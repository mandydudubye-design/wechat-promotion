import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Users, UserCheck, TrendingUp, TrendingDown, MessageCircle, ArrowUpRight, Share2, Award, Target } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { formatNumber } from '../../lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useState, useEffect } from 'react'

interface Employee {
  id: number
  name: string
  phone: string
  department: string
  bindStatus: number
  wechatAccountId: number | null
  promotionCount: number
  followStatuses: { wechatAccountId: number; wechatName: string; isFollowed: boolean }[]
}

interface WechatAccount {
  id: number
  name: string
  appId: string
  status: number
  qrCodeUrl: string
  trendData: { date: string; newFollow: number; employeeFollow: number }[]
}

interface StatsOverview {
  employees: { total: number; active: number | string; inactive: number | string }
  accounts: { total: number; active: number | string; inactive: number | string }
  promotions: { total_records: number; total_scans: number | string; total_follows: number | string; active_employees: number }
}

export function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [accounts, setAccounts] = useState<WechatAccount[]>([])
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }

        // 并行获取数据
        const [employeesRes, accountsRes, statsRes] = await Promise.all([
          fetch('http://localhost:3001/api/employees', { headers }).then(r => r.json()),
          fetch('http://localhost:3001/api/wechat-accounts', { headers }).then(r => r.json()),
          fetch('http://localhost:3001/api/stats/overview', { headers }).then(r => r.json())
        ])

        if (employeesRes.code === 200) {
          // 转换 snake_case 到 camelCase
          const list = employeesRes.data?.list || []
          const formattedEmployees = list.map((e: any) => ({
            id: e.employee_id,
            name: e.name,
            phone: e.phone,
            department: e.department,
            bindStatus: e.bind_status,
            wechatAccountId: e.wechat_account_id,
            promotionCount: e.promotion_count || Math.floor(Math.random() * 100), // 模拟推广数据
            followStatuses: e.follow_statuses || []
          }))
          setEmployees(formattedEmployees)
        }
        if (accountsRes.code === 200) {
          // 添加模拟的趋势数据
          const formattedAccounts = (accountsRes.data || []).map((a: any, index: number) => ({
            ...a,
            totalFollowers: 1000 + Math.floor(Math.random() * 5000),
            employeeFollowers: 50 + Math.floor(Math.random() * 200),
            todayNew: Math.floor(Math.random() * 50),
            weekNew: Math.floor(Math.random() * 200),
            monthNew: Math.floor(Math.random() * 500),
            trendData: generateTrendData()
          }))
          setAccounts(formattedAccounts)
        }
        if (statsRes.code === 200) setStats(statsRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 生成模拟趋势数据
  const generateTrendData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        newFollow: Math.floor(Math.random() * 50) + 10,
        employeeFollow: Math.floor(Math.random() * 10) + 2
      })
    }
    return data
  }

  // 计算员工维度数据
  const totalEmployees = employees.length
  const boundEmployees = employees.filter(e => e.bindStatus === 1).length
  const unboundEmployees = totalEmployees - boundEmployees

  // 计算员工关注情况
  const employeesWithFollow = employees.filter(e => 
    e.followStatuses?.some(f => f.isFollowed)
  ).length

  // 计算总关注数
  const totalEmployeeFollows = employees.reduce((sum, e) => 
    sum + (e.followStatuses?.filter(f => f.isFollowed).length || 0), 0
  )

  // 员工推广数据
  const promotionEmployees = employees.filter(e => e.promotionCount && e.promotionCount > 0).length
  const totalPromotionCount = employees.reduce((sum, e) => sum + (e.promotionCount || 0), 0)
  const avgPromotionPerEmployee = promotionEmployees > 0 ? (totalPromotionCount / promotionEmployees).toFixed(1) : '0'
  
  // 从API统计数据
  const totalScanCount = typeof stats?.promotions?.total_scans === 'string' 
    ? parseInt(stats.promotions.total_scans) 
    : stats?.promotions?.total_scans || 0
  const totalFollowCount = typeof stats?.promotions?.total_follows === 'string'
    ? parseInt(stats.promotions.total_follows)
    : stats?.promotions?.total_follows || 0
  
  // 汇总所有公众号的趋势数据
  const allAccountsTrend = accounts[0]?.trendData?.map((_, index) => {
    const date = accounts[0].trendData[index].date
    const totalNewFollow = accounts.reduce((sum, acc) => sum + (acc.trendData[index]?.newFollow || 0), 0)
    const totalEmployeeFollow = accounts.reduce((sum, acc) => sum + (acc.trendData[index]?.employeeFollow || 0), 0)
    return { date, newFollow: totalNewFollow, employeeFollow: totalEmployeeFollow }
  }) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据概览</h1>
        <p className="text-muted-foreground">
          公众号推广追踪系统核心数据
        </p>
      </div>

      {/* Employee Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总员工数
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              组织内所有员工
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已绑定员工
            </CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{boundEmployees}</div>
            <p className="text-xs text-muted-foreground">
              绑定率 {((boundEmployees / totalEmployees) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              未绑定员工
            </CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{unboundEmployees}</div>
            <p className="text-xs text-muted-foreground">
              待绑定
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              员工关注数
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployeeFollows}</div>
            <p className="text-xs text-muted-foreground">
              {employeesWithFollow} 人已关注公众号
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Promotion Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">员工推广概览</h2>
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                参与推广员工
              </CardTitle>
              <Share2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promotionEmployees}</div>
              <p className="text-xs text-muted-foreground">
                占员工总数 {((promotionEmployees / totalEmployees) * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总扫码次数
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalScanCount)}</div>
              <p className="text-xs text-muted-foreground">
                员工推广二维码被扫描
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                带来关注数
              </CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">+{formatNumber(totalFollowCount)}</div>
              <p className="text-xs text-muted-foreground">
                通过员工推广关注
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                活跃员工
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.promotions?.active_employees || 0}</div>
              <p className="text-xs text-muted-foreground">
                有推广记录的员工
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均转化率
              </CardTitle>
              <Award className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {totalScanCount > 0 ? ((totalFollowCount / totalScanCount) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                扫码到关注转化
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wechat Accounts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">公众号数据</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      <CardDescription className="text-xs">
                        今日新增 +{account.todayNew || 0}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    本月 +{account.monthNew || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">总关注人数</p>
                    <p className="text-xl font-bold">{formatNumber(account.totalFollowers || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">员工关注数</p>
                    <p className="text-xl font-bold text-primary">{account.employeeFollowers || 0}</p>
                  </div>
                </div>

                {/* Mini Trend Chart */}
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={account.trendData || []}>
                      <Line
                        type="monotone"
                        dataKey="newFollow"
                        stroke="#1677ff"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Weekly Stats */}
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">本周新增</span>
                  <span className="font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    +{account.weekNew || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overall Growth Trend */}
        <Card>
          <CardHeader>
            <CardTitle>整体增长趋势</CardTitle>
            <CardDescription>最近7天所有公众号新增关注</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={allAccountsTrend}>
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
                <Bar dataKey="newFollow" fill="#1677ff" name="新增关注" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Follow Trend */}
        <Card>
          <CardHeader>
            <CardTitle>员工关注趋势</CardTitle>
            <CardDescription>最近7天员工关注公众号情况</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={allAccountsTrend}>
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
                <Line
                  type="monotone"
                  dataKey="employeeFollow"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="员工关注"
                  dot={{ fill: '#52c41a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Account Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>公众号数据对比</CardTitle>
          <CardDescription>各公众号关键指标对比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">公众号</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">总关注</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">员工关注</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">今日新增</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">本周新增</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">本月新增</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">周环比</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => {
                  // 模拟周环比数据
                  const weekGrowth = index === 0 ? 12.5 : index === 1 ? 8.3 : 15.2
                  return (
                    <tr key={account.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{account.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-medium">{formatNumber(account.totalFollowers || 0)}</td>
                      <td className="text-right py-3 px-4">
                        <span className="text-primary font-medium">{account.employeeFollowers || 0}</span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="text-success">+{account.todayNew || 0}</span>
                      </td>
                      <td className="text-right py-3 px-4">+{account.weekNew || 0}</td>
                      <td className="text-right py-3 px-4">+{account.monthNew || 0}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`flex items-center justify-end gap-1 ${weekGrowth > 0 ? 'text-success' : 'text-destructive'}`}>
                          {weekGrowth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {weekGrowth > 0 ? '+' : ''}{weekGrowth}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Promoters */}
      <Card>
        <CardHeader>
          <CardTitle>推广排行榜</CardTitle>
          <CardDescription>推广效果TOP 10员工</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees
              .filter(e => e.promotionCount && e.promotionCount > 0)
              .sort((a, b) => (b.promotionCount || 0) - (a.promotionCount || 0))
              .slice(0, 10)
              .map((employee, index) => (
                <div key={employee.id} className="flex items-center gap-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                    index === 1 ? 'bg-gray-400/20 text-gray-500' :
                    index === 2 ? 'bg-orange-500/20 text-orange-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{employee.name}</span>
                      <span className="text-sm text-muted-foreground">{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        推广 {employee.promotionCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-success">
                        <UserCheck className="w-3 h-3" />
                        关注 {employee.followStatuses?.filter(f => f.isFollowed).length || 0}个公众号
                      </span>
                    </div>
                  </div>
                  <Badge variant={index < 3 ? 'success' : 'secondary'}>
                    +{employee.promotionCount || 0}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}