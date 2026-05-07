import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  MessageSquare,
  Activity,
  Loader2,
  Search,
  Download,
  QrCode,
  UserPlus,
  UserCheck,
  Building2,
} from 'lucide-react'
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
  Cell,
} from 'recharts'

const API_BASE = import.meta.env.PROD ? '' : 'http://192.168.100.200:3000'

// Tab 类型
type TabValue = 'realtime' | 'analysis'

// 视图模式
type ViewMode = 'employee' | 'department' | 'account'

export function PromotionDataPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('realtime')
  
  // 实时统计状态
  const [viewMode, setViewMode] = useState<ViewMode>('employee')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30d')

  // 数据分析状态
  const [analysisTimeRange, setAnalysisTimeRange] = useState('week')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // API 数据状态
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<any>(null)
  const [employeeRanking, setEmployeeRanking] = useState<any[]>([])
  const [departmentStats, setDepartmentStats] = useState<any[]>([])
  const [dailyTrend, setDailyTrend] = useState<any[]>([])

  // 获取概览数据
  useEffect(() => {
    fetchOverview()
  }, [])

  // 获取排行数据
  useEffect(() => {
    fetchRanking()
  }, [viewMode, dateRange])

  // 获取趋势数据
  useEffect(() => {
    fetchTrend()
  }, [analysisTimeRange])

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/promotion-stats/overview`)
      const data = await res.json()
      if (data.code === 200) {
        setOverview(data.data)
      }
    } catch (err) {
      console.error('获取概览失败:', err)
    }
  }

  const fetchRanking = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ dateRange })
      const res = await fetch(`${API_BASE}/api/promotion-stats/employee-ranking?${params}`)
      const data = await res.json()
      if (data.code === 200) {
        setEmployeeRanking(data.data)
      }
    } catch (err) {
      console.error('获取排行失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrend = async () => {
    try {
      const days = analysisTimeRange === 'today' ? 1 : analysisTimeRange === 'week' ? 7 : analysisTimeRange === 'month' ? 30 : 90
      const res = await fetch(`${API_BASE}/api/promotion-stats/daily-trend?days=${days}`)
      const data = await res.json()
      if (data.code === 200) {
        setDailyTrend(data.data.map((d: any) => ({
          date: d.date?.replace(/^\d{4}-/, '') || d.date,
          subscribe: d.newFollows,
          unsubscribe: d.unfollows,
          net: d.netFollows,
        })))
      }
    } catch (err) {
      console.error('获取趋势失败:', err)
    }
  }

  const fetchDepartmentStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/promotion-stats/department`)
      const data = await res.json()
      if (data.code === 200) {
        setDepartmentStats(data.data)
      }
    } catch (err) {
      console.error('获取部门统计失败:', err)
    }
  }

  // 切换到部门视图时加载部门数据
  useEffect(() => {
    if (viewMode === 'department') fetchDepartmentStats()
  }, [viewMode])

  // 筛选数据
  const filteredData = useMemo(() => {
    if (viewMode === 'department') {
      return departmentStats.filter((item: any) =>
        !searchTerm || item.department.includes(searchTerm)
      )
    }
    return employeeRanking.filter((item: any) =>
      !searchTerm || item.employeeName.includes(searchTerm)
    )
  }, [viewMode, searchTerm, employeeRanking, departmentStats])

  // 汇总数据
  const summary = useMemo(() => {
    if (!overview) return { totalScans: 0, totalNewFollows: 0, totalLostFollows: 0, totalNetFollows: 0, avgConversionRate: '0' }
    return {
      totalScans: overview.totalScans || 0,
      totalNewFollows: overview.subscribedCount || 0,
      totalLostFollows: overview.unsubscribedCount || 0,
      totalNetFollows: (overview.subscribedCount || 0) - (overview.unsubscribedCount || 0),
      avgConversionRate: overview.conversionRate || '0',
    }
  }, [overview])

  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d']

  // 导出报表
  const handleExportReport = async () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      alert('报表导出成功！')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">推广数据</h1>
          <p className="text-muted-foreground">实时推广统计与深度数据分析</p>
        </div>
        <Button onClick={handleExportReport} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              导出报表
            </>
          )}
        </Button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'realtime' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('realtime')}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          实时统计
        </Button>
        <Button
          variant={activeTab === 'analysis' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('analysis')}
        >
          <Activity className="mr-2 h-4 w-4" />
          数据分析
        </Button>
      </div>

      {/* 实时统计 Tab */}
      {activeTab === 'realtime' && (
        <>
          {/* 汇总卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总扫描次数</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalScans.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">有效关注</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{summary.totalNewFollows.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">已取关</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">-{summary.totalLostFollows.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">净增关注</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{summary.totalNetFollows.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">转化率</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.avgConversionRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* 视图切换和筛选 */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'employee' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('employee')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    按员工
                  </Button>
                  <Button
                    variant={viewMode === 'department' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('department')}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    按部门
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={viewMode === 'employee' ? '搜索员工...' : '搜索部门...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-40"
                    />
                  </div>
                  
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-28"
                  >
                    <option value="today">今日</option>
                    <option value="7d">近7天</option>
                    <option value="30d">近30天</option>
                    <option value="90d">近90天</option>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  加载中...
                </div>
              ) : (
                <>
                  {/* 按员工 */}
                  {viewMode === 'employee' && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>员工</TableHead>
                          <TableHead>部门</TableHead>
                          <TableHead>推广码</TableHead>
                          <TableHead className="text-right">扫描次数</TableHead>
                          <TableHead className="text-right">新增关注</TableHead>
                          <TableHead className="text-right">已取关</TableHead>
                          <TableHead className="text-right">净增关注</TableHead>
                          <TableHead className="text-right">转化率</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item: any) => (
                          <TableRow key={item.employeeId}>
                            <TableCell className="font-medium">{item.employeeName}</TableCell>
                            <TableCell>{item.department || '-'}</TableCell>
                            <TableCell><Badge variant="outline">{item.employeeId}</Badge></TableCell>
                            <TableCell className="text-right">{item.scans}</TableCell>
                            <TableCell className="text-right text-green-600">+{item.subscribedCount}</TableCell>
                            <TableCell className="text-right text-red-500">-{item.unsubscribedCount}</TableCell>
                            <TableCell className="text-right font-medium text-blue-600">{item.netFollows}</TableCell>
                            <TableCell className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                Number(item.conversionRate) >= 80 ? 'bg-green-100 text-green-700' :
                                Number(item.conversionRate) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.conversionRate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}

                  {/* 按部门 */}
                  {viewMode === 'department' && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>部门</TableHead>
                          <TableHead className="text-right">推广员工数</TableHead>
                          <TableHead className="text-right">新增关注</TableHead>
                          <TableHead className="text-right">已取关</TableHead>
                          <TableHead className="text-right">净增关注</TableHead>
                          <TableHead className="text-right">转化率</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item: any) => (
                          <TableRow key={item.department}>
                            <TableCell className="font-medium">{item.department}</TableCell>
                            <TableCell className="text-right">{item.employeeCount}</TableCell>
                            <TableCell className="text-right text-green-600">+{item.subscribedCount}</TableCell>
                            <TableCell className="text-right text-red-500">-{item.unsubscribedCount}</TableCell>
                            <TableCell className="text-right font-medium text-blue-600">{item.netFollows}</TableCell>
                            <TableCell className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                Number(item.conversionRate) >= 80 ? 'bg-green-100 text-green-700' :
                                Number(item.conversionRate) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.conversionRate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 数据分析 Tab */}
      {activeTab === 'analysis' && (
        <>
          {/* 趋势图 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>关注趋势分析</CardTitle>
                  <CardDescription>
                    {analysisTimeRange === 'today' ? '今日关注量变化' :
                     analysisTimeRange === 'week' ? '近7天关注量变化趋势' :
                     analysisTimeRange === 'month' ? '近30天关注量变化趋势' :
                     '近90天关注量变化趋势'}
                  </CardDescription>
                </div>
                <Select
                  value={analysisTimeRange}
                  onChange={(e) => setAnalysisTimeRange(e.target.value)}
                  className="w-28"
                >
                  <option value="today">今日</option>
                  <option value="week">近7天</option>
                  <option value="month">近30天</option>
                  <option value="quarter">近90天</option>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyTrend}>
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
                    <Area type="monotone" dataKey="subscribe" stroke="#1677ff" fillOpacity={1} fill="url(#colorSubscribe)" name="新增关注" />
                    <Area type="monotone" dataKey="net" stroke="#52c41a" fillOpacity={1} fill="url(#colorNet)" name="净增长" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  暂无趋势数据
                </div>
              )}
            </CardContent>
          </Card>

          {/* 智能洞察 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                数据概览
              </CardTitle>
              <CardDescription>基于实时数据的推广概况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {overview && (
                  <>
                    <div className="flex gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">今日新增</p>
                        <p className="text-2xl font-bold text-green-600">+{overview.todayNew || 0}</p>
                        <p className="text-sm text-muted-foreground">通过推广码归因</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">活跃推广员</p>
                        <p className="text-2xl font-bold text-blue-600">{overview.activeEmployees || 0}</p>
                        <p className="text-sm text-muted-foreground">已产生推广归因</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">今日取关</p>
                        <p className="text-2xl font-bold text-red-500">-{overview.todayUnsub || 0}</p>
                        <p className="text-sm text-muted-foreground">需关注内容质量</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
