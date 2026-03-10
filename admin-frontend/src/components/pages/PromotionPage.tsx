import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Progress } from '../ui/progress'
import { TrendingUp, Users, MousePointer, Award, Download } from 'lucide-react'
import { mockPromotionStatistics, mockPromotionRecords, departments } from '../../data/mockData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function PromotionPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [timeRange, setTimeRange] = useState('month')

  const filteredStats = selectedDepartment === '全部部门'
    ? mockPromotionStatistics
    : mockPromotionStatistics.filter(s => s.department === selectedDepartment)

  const totalStats = filteredStats.reduce((acc, stat) => ({
    scanCount: acc.scanCount + stat.scanCount,
    subscribeCount: acc.subscribeCount + stat.subscribeCount,
    unsubscribeCount: acc.unsubscribeCount + stat.unsubscribeCount,
    netCount: acc.netCount + stat.netCount,
  }), { scanCount: 0, subscribeCount: 0, unsubscribeCount: 0, netCount: 0 })

  const avgConversionRate = filteredStats.length > 0
    ? filteredStats.reduce((acc, s) => acc + s.conversionRate, 0) / filteredStats.length
    : 0

  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">推广管理</h1>
          <p className="text-muted-foreground">
            查看员工推广效果数据和排行榜
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出报表
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>总扫码次数</CardDescription>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.scanCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>新增关注</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalStats.subscribeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>取消关注</CardDescription>
            <Users className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalStats.unsubscribeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>平均转化率</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgConversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Performers Chart */}
        <Card>
          <CardHeader>
            <CardTitle>推广排行榜</CardTitle>
            <CardDescription>按净增关注数排名</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredStats.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="employeeName" type="category" width={80} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value, '人']}
                />
                <Bar dataKey="netCount" radius={[0, 4, 4, 0]}>
                  {filteredStats.slice(0, 6).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>部门推广对比</CardTitle>
            <CardDescription>各部门推广效果汇总</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments
                .filter((d) => d !== '全部部门')
                .map((dept) => {
                  const deptStats = mockPromotionStatistics.filter(s => s.department === dept)
                  const deptTotal = deptStats.reduce((acc, s) => acc + s.netCount, 0)
                  const maxTotal = Math.max(
                    ...departments
                      .filter((d) => d !== '全部部门')
                      .map(d => mockPromotionStatistics
                        .filter(s => s.department === d)
                        .reduce((acc, s) => acc + s.netCount, 0)
                      )
                  )

                  if (deptTotal === 0) return null

                  return (
                    <div key={dept} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dept}</span>
                        <span className="text-muted-foreground">{deptTotal} 人</span>
                      </div>
                      <Progress value={(deptTotal / maxTotal) * 100} />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">部门筛选</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">时间范围</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="today">今日</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="all">全部</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>推广明细</CardTitle>
          <CardDescription>
            共 {filteredStats.length} 名员工的推广数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>排名</TableHead>
                  <TableHead>员工姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>扫码次数</TableHead>
                  <TableHead>新增关注</TableHead>
                  <TableHead>取消关注</TableHead>
                  <TableHead>净增关注</TableHead>
                  <TableHead>转化率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.map((stat, index) => (
                  <TableRow key={stat.employeeId}>
                    <TableCell>
                      {index < 3 ? (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span className="font-semibold">{index + 1}</span>
                        </div>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{stat.employeeName}</TableCell>
                    <TableCell>{stat.department}</TableCell>
                    <TableCell>{stat.scanCount}</TableCell>
                    <TableCell className="text-success">+{stat.subscribeCount}</TableCell>
                    <TableCell className="text-destructive">-{stat.unsubscribeCount}</TableCell>
                    <TableCell>
                      <Badge variant={stat.netCount > 0 ? 'success' : 'secondary'}>
                        {stat.netCount > 0 ? '+' : ''}{stat.netCount}
                      </Badge>
                    </TableCell>
                    <TableCell>{stat.conversionRate.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Promotion Records */}
      <Card>
        <CardHeader>
          <CardTitle>最近推广记录</CardTitle>
          <CardDescription>员工推广带来的最新关注</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPromotionRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      {record.employeeName.slice(0, 1)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{record.employeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.department} · {record.scanTime}
                    </p>
                  </div>
                </div>
                <Badge variant={record.status === 1 ? 'success' : 'secondary'}>
                  {record.status === 1 ? '已关注' : '仅扫码'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
