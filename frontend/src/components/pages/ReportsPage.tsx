import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Download, Calendar, TrendingUp, BarChart3, Loader2 } from 'lucide-react'
import { getEmployees, getPromotions, getFollowRecords, getDashboardStats, type Employee, type PromotionRecord, type FollowRecord } from '../../lib/api'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [promotions, setPromotions] = useState<PromotionRecord[]>([])
  const [followRecords, setFollowRecords] = useState<FollowRecord[]>([])
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
      const [empResult, promResult, followResult, statsResult] = await Promise.all([
        getEmployees({ pageSize: 500 }),
        getPromotions({ pageSize: 200 }),
        getFollowRecords({ pageSize: 200 }),
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
      setFollowRecords(followResult.list)
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

  // 计算趋势数据（按日期分组）
  const trendData = (() => {
    const dateMap = new Map<string, { subscribe: number; unsubscribe: number; net: number }>()
    
    // 从关注记录中统计
    followRecords.forEach(record => {
      const date = record.subscribe_time 
        ? new Date(record.subscribe_time).toLocaleDateString()
        : new Date(record.created_at).toLocaleDateString()
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { subscribe: 0, unsubscribe: 0, net: 0 })
      }
      
      const data = dateMap.get(date)!
      if (record.status === 1) {
        data.subscribe++
        data.net++
      } else if (record.status === 0 && record.unsubscribe_time) {
        data.unsubscribe++
        data.net--
      }
    })
    
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30) // 最近30天
  })()

  // 部门数据
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean) as string[])]
  
  const departmentData = departments.map((dept) => {
    const deptEmployees = employees.filter(e => e.department === dept)
    const deptPromotions = promotions.filter(p => {
      const emp = employees.find(e => e.employee_id === p.employee_id)
      return emp?.department === dept
    })
    
    return {
      department: dept,
      订阅: deptPromotions.reduce((sum, p) => sum + p.follow_count, 0),
      员工数: deptEmployees.length,
      净增: deptPromotions.reduce((sum, p) => sum + p.follow_count, 0),
    }
  }).sort((a, b) => b.净增 - a.净增)

  // 汇总数据
  const totalGrowth = trendData.reduce((acc, d) => acc + d.net, 0)
  const totalSubscribe = trendData.reduce((acc, d) => acc + d.subscribe, 0)
  const totalUnsubscribe = trendData.reduce((acc, d) => acc + d.unsubscribe, 0)

  // 导出
  const handleExport = () => {
    const headers = ['日期', '新增关注', '取消关注', '净增长']
    const rows = trendData.map(d => [d.date, d.subscribe, d.unsubscribe, d.net])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `数据报表_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

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
          <Button variant="outline" size="sm" onClick={fetchData}>
            <Calendar className="mr-2 h-4 w-4" />
            刷新数据
          </Button>
          <Button size="sm" onClick={handleExport}>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总员工数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              已绑定 {stats.boundEmployees} 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总关注数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFollowers}</div>
            <p className="text-xs text-muted-foreground">
              活跃 {stats.activeFollowers} 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>期间新增</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalSubscribe}</div>
            <p className="text-xs text-muted-foreground">
              新增关注用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>推广记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{promotions.length}</div>
            <p className="text-xs text-muted-foreground">
              推广活动总数
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
              <CardDescription>最近30天关注量变化趋势</CardDescription>
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
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              暂无趋势数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <AreaChart data={trendData}>
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
                <BarChart data={trendData}>
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
          )}
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
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : departmentData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                暂无部门数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData.slice(0, 6)}>
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
                  <Bar dataKey="净增" fill="#52c41a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>部门净增排行</CardTitle>
            <CardDescription>按净增关注数排序</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : departmentData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                暂无排行数据
              </div>
            ) : (
              <div className="space-y-4">
                {departmentData.slice(0, 5).map((dept, index) => (
                  <div key={dept.department} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{dept.department}</span>
                        <Badge variant={dept.净增 > 0 ? 'success' : 'secondary'}>
                          {dept.净增 > 0 ? '+' : ''}{dept.净增}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>员工: {dept.员工数}</span>
                        <span>关注: {dept.订阅}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">员工参与度</p>
                <p className="text-sm text-muted-foreground">
                  {stats.boundEmployees}/{stats.totalEmployees} 名员工已绑定
                  ({stats.totalEmployees > 0 ? ((stats.boundEmployees / stats.totalEmployees) * 100).toFixed(0) : 0}%)
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">推广效果</p>
                <p className="text-sm text-muted-foreground">
                  共 {promotions.length} 条推广记录
                  平均每员工 {promotions.length > 0 ? (stats.totalFollowers / promotions.length).toFixed(1) : 0} 人关注
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">最近趋势</p>
                <p className="text-sm text-muted-foreground">
                  {trendData.length > 0 
                    ? `最近一天净增 ${trendData[trendData.length - 1]?.net || 0} 人`
                    : '暂无趋势数据'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}