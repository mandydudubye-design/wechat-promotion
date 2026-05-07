import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Users, UserCheck, TrendingUp } from 'lucide-react'

export function Dashboard() {
  // 使用安全的默认值
  const stats = {
    totalEmployees: 0,
    boundEmployees: 0,
    followingEmployees: 0,
    todayNewFollows: 0,
    monthNewFollows: 0,
  }

  const trendData = [
    { date: '03-01', subscribe: 0, unsubscribe: 0, net: 0 },
    { date: '03-02', subscribe: 0, unsubscribe: 0, net: 0 },
    { date: '03-03', subscribe: 0, unsubscribe: 0, net: 0 },
  ]

  const promotionStats = []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据概览</h1>
        <p className="text-muted-foreground">
          查看公众号推广追踪系统的关键指标和趋势
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总员工数
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              组织内所有员工
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已绑定员工
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.boundEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmployees > 0
                ? `绑定率 ${((stats.boundEmployees / stats.totalEmployees) * 100).toFixed(1)}%`
                : '暂无数据'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已关注员工
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.followingEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.boundEmployees > 0
                ? `关注率 ${((stats.followingEmployees / stats.boundEmployees) * 100).toFixed(1)}%`
                : '暂无数据'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              本月新增
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.monthNewFollows}
            </div>
            <p className="text-xs text-muted-foreground">
              今日新增 {stats.todayNewFollows} 人
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>关注趋势</CardTitle>
            <CardDescription>最近9天的关注变化情况</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData && trendData.length > 0 ? (
              <div className="space-y-2">
                {trendData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.date}</span>
                    <div className="flex gap-4">
                      <span className="text-green-600">+{item.subscribe}</span>
                      <span className="text-red-600">-{item.unsubscribe}</span>
                      <span className="font-medium">{item.net}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无趋势数据
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>推广排行榜</CardTitle>
            <CardDescription>本月推广效果TOP 5</CardDescription>
          </CardHeader>
          <CardContent>
            {promotionStats && promotionStats.length > 0 ? (
              <div className="space-y-4">
                {promotionStats.slice(0, 5).map((stat: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stat.employeeName}</span>
                        <span className="text-sm text-muted-foreground">{stat.department}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        净增 {stat.netCount} 人
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无推广数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
