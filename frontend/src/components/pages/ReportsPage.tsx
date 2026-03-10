import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import { mockTrendData, mockPromotionStatistics } from '../../data/mockData'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export function ReportsPage() {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  const totalGrowth = mockTrendData.reduce((acc, d) => acc + d.net, 0)
  const totalSubscribe = mockTrendData.reduce((acc, d) => acc + d.subscribe, 0)
  const totalUnsubscribe = mockTrendData.reduce((acc, d) => acc + d.unsubscribe, 0)

  const departmentData = ['行政部', '人力资源部', '财务部', '销售部'].map((dept) => {
    const deptStats = mockPromotionStatistics.filter(s => s.department === dept)
    return {
      department: dept,
      订阅: deptStats.reduce((acc, s) => acc + s.subscribeCount, 0),
      取消: deptStats.reduce((acc, s) => acc + s.unsubscribeCount, 0),
      净增: deptStats.reduce((acc, s) => acc + s.netCount, 0),
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据报表</h1>
          <p className="text-muted-foreground">
            多维度数据分析和可视化展示
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            选择日期
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出报表
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>期间总增长</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+{totalGrowth}</div>
            <p className="text-xs text-muted-foreground">
              净增关注用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>新增关注</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribe}</div>
            <p className="text-xs text-muted-foreground">
              通过员工推广
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>取消关注</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalUnsubscribe}</div>
            <p className="text-xs text-muted-foreground">
              流失用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>推广员工数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mockPromotionStatistics.length}
            </div>
            <p className="text-xs text-muted-foreground">
              参与推广活动
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>关注趋势分析</CardTitle>
              <CardDescription>关注量随时间变化趋势</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                折线图
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                柱状图
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorSubscribe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="subscribe"
                  stroke="#1677ff"
                  fillOpacity={1}
                  fill="url(#colorSubscribe)"
                  name="新增关注"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#52c41a"
                  fillOpacity={1}
                  fill="url(#colorNet)"
                  name="净增长"
                />
              </AreaChart>
            ) : (
              <BarChart data={mockTrendData}>
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
                <Bar dataKey="subscribe" fill="#1677ff" name="新增关注" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unsubscribe" fill="#f5222d" name="取消关注" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" fill="#52c41a" name="净增长" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>部门推广对比</CardTitle>
            <CardDescription>各部门推广效果对比分析</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="department" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="订阅" fill="#1677ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="取消" fill="#f5222d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="净增" fill="#52c41a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>部门净增排行</CardTitle>
            <CardDescription>按净增关注数排序</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData
                .sort((a, b) => b.净增 - a.净增)
                .map((dept, index) => (
                  <div key={dept.department} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{dept.department}</span>
                        <Badge variant="success">+{dept.净增}</Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>新增: {dept.订阅}</span>
                        <span>取消: {dept.取消}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>数据洞察</CardTitle>
          <CardDescription>基于当前数据的分析和建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">增长趋势良好</p>
                <p className="text-sm text-muted-foreground">
                  本周净增 {totalGrowth} 人，环比上周增长 12%
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">销售部表现最佳</p>
                <p className="text-sm text-muted-foreground">
                  推广效果排名第一，净增 33 人
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-medium">最佳推广时间</p>
                <p className="text-sm text-muted-foreground">
                  工作日 10:00-12:00 推广效果最佳
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
