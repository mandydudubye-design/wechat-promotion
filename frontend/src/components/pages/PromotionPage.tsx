import { useState, useEffect } from 'react'
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
import { TrendingUp, Users, MousePointer, Award, Download, Loader2 } from 'lucide-react'
import { getEmployees, getPromotions, getDashboardStats, type Employee, type PromotionRecord } from '../../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface EmployeeStats {
  employee_id: string
  employee_name: string
  department: string
  scanCount: number
  followCount: number
  netCount: number
  conversionRate: number
}

export function PromotionPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [promotions, setPromotions] = useState<PromotionRecord[]>([])
  const [stats, setStats] = useState({
    totalEmployees: 0,
    boundEmployees: 0,
    totalFollowers: 0,
    activeFollowers: 0,
    totalPromotions: 0,
  })

  // 获取数据
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [empResult, promResult, statsResult] = await Promise.all([
        getEmployees({ pageSize: 500 }),
        getPromotions({ pageSize: 100 }),
        getDashboardStats().catch(() => ({
          totalEmployees: 0,
          boundEmployees: 0,
          totalFollowers: 0,
          activeFollowers: 0,
          totalPromotions: 0,
        })),
      ])
      setEmployees(empResult.list)
      setPromotions(promResult.list)
      setStats(statsResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 获取部门列表
  const departments = ['全部部门', ...new Set(employees.map(e => e.department).filter(Boolean) as string[])]

  // 计算员工推广统计
  const employeeStats: EmployeeStats[] = employees
    .filter(e => e.bind_status === 1)
    .map(emp => {
      const empPromotions = promotions.filter(p => p.employee_id === emp.employee_id)
      const scanCount = empPromotions.reduce((sum, p) => sum + p.scan_count, 0)
      const followCount = empPromotions.reduce((sum, p) => sum + p.follow_count, 0)
      return {
        employee_id: emp.employee_id,
        employee_name: emp.name,
        department: emp.department || '未分配',
        scanCount,
        followCount,
        netCount: followCount,
        conversionRate: scanCount > 0 ? (followCount / scanCount) * 100 : 0,
      }
    })
    .sort((a, b) => b.netCount - a.netCount)

  // 筛选后的统计
  const filteredStats = selectedDepartment === '全部部门'
    ? employeeStats
    : employeeStats.filter(s => s.department === selectedDepartment)

  // 汇总数据
  const totalStats = filteredStats.reduce((acc, stat) => ({
    scanCount: acc.scanCount + stat.scanCount,
    followCount: acc.followCount + stat.followCount,
    netCount: acc.netCount + stat.netCount,
  }), { scanCount: 0, followCount: 0, netCount: 0 })

  const avgConversionRate = filteredStats.length > 0
    ? filteredStats.reduce((acc, s) => acc + s.conversionRate, 0) / filteredStats.length
    : 0

  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96']

  // 导出
  const handleExport = () => {
    const headers = ['排名', '员工工号', '员工姓名', '部门', '扫码次数', '新增关注', '净增关注', '转化率']
    const rows = filteredStats.map((stat, index) => [
      index + 1,
      stat.employee_id,
      stat.employee_name,
      stat.department,
      stat.scanCount,
      stat.followCount,
      stat.netCount,
      stat.conversionRate.toFixed(1) + '%',
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `推广统计_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出报表
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

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
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStats.followCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>净增关注</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.netCount}</div>
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
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredStats.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                暂无数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredStats.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="employee_name" type="category" width={80} className="text-xs" />
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
            )}
          </CardContent>
        </Card>

        {/* Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>部门推广对比</CardTitle>
            <CardDescription>各部门推广效果汇总</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {departments
                  .filter((d) => d !== '全部部门')
                  .map((dept) => {
                    const deptStats = employeeStats.filter(s => s.department === dept)
                    const deptTotal = deptStats.reduce((acc, s) => acc + s.netCount, 0)
                    const maxTotal = Math.max(
                      ...departments
                        .filter((d) => d !== '全部部门')
                        .map(d => employeeStats
                          .filter(s => s.department === d)
                          .reduce((acc, s) => acc + s.netCount, 0)
                        ),
                      1
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
            )}
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
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>推广明细</CardTitle>
          <CardDescription>
            {loading ? '加载中...' : `共 ${filteredStats.length} 名员工的推广数据`}
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
                  <TableHead>净增关注</TableHead>
                  <TableHead>转化率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-muted-foreground">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无推广数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStats.map((stat, index) => (
                    <TableRow key={stat.employee_id}>
                      <TableCell>
                        {index < 3 ? (
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{index + 1}</span>
                          </div>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{stat.employee_name}</TableCell>
                      <TableCell>{stat.department}</TableCell>
                      <TableCell>{stat.scanCount}</TableCell>
                      <TableCell className="text-green-600">+{stat.followCount}</TableCell>
                      <TableCell>
                        <Badge variant={stat.netCount > 0 ? 'success' : 'secondary'}>
                          {stat.netCount > 0 ? '+' : ''}{stat.netCount}
                        </Badge>
                      </TableCell>
                      <TableCell>{stat.conversionRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))
                )}
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
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无推广记录
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {(record.employee_name || record.employee_id || '?').slice(0, 1)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{record.employee_name || record.employee_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">扫码 {record.scan_count} 次</p>
                    <p className="text-sm text-green-600">关注 {record.follow_count} 人</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}