import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Users, UserCheck, TrendingUp, Calendar } from 'lucide-react'
import { mockDashboardStats, mockTrendData, mockPromotionStatistics } from '../../data/mockData'
import { formatNumber } from '../../lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据概览</h1>
        <p className="text-muted-foreground">
          查看公众号推广追踪系统的关键指标和趋势
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总员工数
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockDashboardStats.totalEmployees)}</div>
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
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockDashboardStats.boundEmployees)}</div>
            <p className="text-xs text-muted-foreground">
              绑定率{' '}
              {((mockDashboardStats.boundEmployees / mockDashboardStats.totalEmployees) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已关注员工
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockDashboardStats.followingEmployees)}</div>
            <p className="text-xs text-muted-foreground">
              关注率{' '}
              {((mockDashboardStats.followingEmployees / mockDashboardStats.boundEmployees) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              本月新增
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+{formatNumber(mockDashboardStats.monthNewFollows)}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 {formatNumber(mockDashboardStats.todayNewFollows)} 人
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>关注趋势</CardTitle>
            <CardDescription>最近9天的关注变化情况</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTrendData}>
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
                  dataKey="subscribe"
                  stroke="#1677ff"
                  strokeWidth={2}
                  name="新增关注"
                  dot={{ fill: '#1677ff' }}
                />
                <Line
                  type="monotone"
                  dataKey="unsubscribe"
                  stroke="#f5222d"
                  strokeWidth={2}
                  name="取消关注"
                  dot={{ fill: '#f5222d' }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="净增长"
                  dot={{ fill: '#52c41a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Promotion Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>推广排行榜</CardTitle>
            <CardDescription>本月推广效果TOP 5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPromotionStatistics.slice(0, 5).map((stat, index) => (
                <div key={stat.employeeId} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.employeeName}</span>
                      <span className="text-sm text-muted-foreground">{stat.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>推广 {stat.subscribeCount} 人</span>
                      <span>·</span>
                      <span>转化率 {stat.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Badge variant={index < 3 ? 'success' : 'secondary'}>
                    +{stat.netCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>常用功能快速入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">导入员工</p>
                <p className="text-xs text-muted-foreground">批量添加员工信息</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="text-left">
                <p className="font-medium">同步数据</p>
                <p className="text-xs text-muted-foreground">同步微信关注状态</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div className="text-left">
                <p className="font-medium">导出报表</p>
                <p className="text-xs text-muted-foreground">导出数据报表</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <UserCheck className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-left">
                <p className="font-medium">绑定码</p>
                <p className="text-xs text-muted-foreground">生成员工绑定码</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
