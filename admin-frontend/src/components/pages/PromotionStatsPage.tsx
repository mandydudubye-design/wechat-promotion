import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Scan, UserCheck, UserX, ArrowUpRight, BarChart3, MessageCircle, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react'
import { departments } from '../../data/mockData'

// API基础路径
const API_BASE = 'http://localhost:11827/api'

// 公众号类型
interface WechatAccount {
  id: number
  account_name: string
  avatar?: string
  status?: number
}

// 统计数据类型
interface SummaryStats {
  total_scans: number
  total_follows: number
  total_unfollows: number
  active_employees: number
}

interface AccountStats {
  id: number
  account_name: string
  scan_count: number
  follow_count: number
  unfollow_count: number
}

interface EmployeeStats {
  employee_id: string
  employee_name: string
  department: string
  total_scan_count: number
  total_follow_count: number
  total_unfollow_count: number
}

interface EmployeeAccountStats {
  employee_id: string
  account_id: number
  account_name: string
  scan_count: number
  follow_count: number
  unfollow_count: number
}

interface DepartmentStats {
  department: string
  total_scan_count: number
  total_follow_count: number
  total_unfollow_count: number
  employee_count: number
}

interface TrendData {
  date: string
  scan_count: number
  follow_count: number
}

interface FollowDetail {
  employee_id: string
  employee_name: string
  account_id: number
  account_name: string
  openid: string
  nickname: string
  status: number
  follow_time: string
  unfollow_time: string | null
}

export function PromotionStatsPage() {
  // 公众号列表（从API获取）
  const [wechatAccounts, setWechatAccounts] = useState<WechatAccount[]>([])
  
  // 筛选条件
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  
  // 统计周期 - 支持手动选择
  const [periodType, setPeriodType] = useState<string>('week')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showCustomDate, setShowCustomDate] = useState(false)
  
  // 统计数据
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [accountStats, setAccountStats] = useState<AccountStats[]>([])
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([])
  const [employeeAccountStats, setEmployeeAccountStats] = useState<EmployeeAccountStats[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [followDetails, setFollowDetails] = useState<FollowDetail[]>([])
  
  // 员工详情展开
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())

  // 初始化日期范围
  useEffect(() => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    setStartDate(formatDate(weekAgo))
    setEndDate(formatDate(today))
  }, [])

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // 获取公众号列表
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE}/accounts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.code === 200) {
          setWechatAccounts(result.data || [])
        }
      } catch (error) {
        console.error('获取公众号列表失败:', error)
      }
    }
    fetchAccounts()
  }, [])

  // 处理周期类型变化
  const handlePeriodTypeChange = (value: string) => {
    setPeriodType(value)
    if (value === 'custom') {
      setShowCustomDate(true)
    } else {
      setShowCustomDate(false)
      // 根据类型自动设置日期
      const today = new Date()
      let start = new Date()
      
      switch (value) {
        case 'today':
          start = today
          break
        case 'week':
          start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          start = new Date(today.getFullYear(), today.getMonth(), 1)
          break
        case 'all':
          start = new Date('2020-01-01')
          break
      }
      
      setStartDate(formatDate(start))
      setEndDate(formatDate(today))
    }
  }

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      if (!startDate || !endDate) return
      
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const params = new URLSearchParams()
        params.append('start_date', startDate)
        params.append('end_date', endDate)
        if (selectedAccount !== 'all') {
          params.append('account_id', selectedAccount)
        }
        if (selectedDepartment !== 'all') {
          params.append('department', selectedDepartment)
        }

        const response = await fetch(`${API_BASE}/stats/promotion?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        
        if (result.code === 200) {
          setSummary(result.data.summary || {})
          setAccountStats(result.data.accountStats || [])
          setEmployeeStats(result.data.employeeStats || [])
          setEmployeeAccountStats(result.data.employeeAccountStats || [])
          setDepartmentStats(result.data.departmentStats || [])
          setTrendData(result.data.trendData || [])
          setFollowDetails(result.data.followDetails || [])
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [startDate, endDate, selectedAccount, selectedDepartment])

  // 切换员工详情展开
  const toggleEmployeeExpand = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedEmployees(newExpanded)
  }

  // 获取员工的公众号分布数据
  const getEmployeeAccountData = (employeeId: string) => {
    return employeeAccountStats.filter(e => e.employee_id === employeeId)
  }

  // 汇总统计计算
  const summaryDisplay = useMemo(() => {
    if (!summary) return { scanCount: 0, followCount: 0, unfollowCount: 0, rate: '0' }
    const scanCount = summary.total_scans || 0
    const followCount = summary.total_follows || 0
    const unfollowCount = summary.total_unfollows || 0
    const rate = scanCount > 0 ? ((followCount / scanCount) * 100).toFixed(1) : '0'
    return { scanCount, followCount, unfollowCount, rate }
  }, [summary])

  // 柱状图数据
  const barData = accountStats.map(acc => ({
    name: acc.account_name || '未知',
    扫码: acc.scan_count || 0,
    关注: acc.follow_count || 0,
    取关: acc.unfollow_count || 0,
  }))

  // 公众号颜色
  const accountColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">推广统计</h1>
          <p className="text-muted-foreground">
            查看员工推广带来的扫码关注数据，支持按人、部门、公众号维度分析
          </p>
        </div>
        
        {/* 统计周期选择器 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={periodType} onValueChange={handlePeriodTypeChange}>
              <SelectTrigger className="w-[100px] border-0 shadow-none bg-white">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showCustomDate && (
            <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <span className="text-gray-500">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <Button 
                size="sm" 
                onClick={() => setShowCustomDate(false)}
                variant="ghost"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {!showCustomDate && periodType !== 'custom' && (
            <div className="text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-lg">
              {startDate} ~ {endDate}
            </div>
          )}
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[180px] bg-white border">
                <SelectValue placeholder="选择公众号" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">全部公众号</SelectItem>
                {wechatAccounts.map(acc => (
                  <SelectItem key={acc.id} value={String(acc.id)}>{acc.account_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px] bg-white border">
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">全部部门</SelectItem>
                {departments.filter(d => d !== '全部部门').map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      ) : (
        <>
          {/* 汇总卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总扫码次数</CardTitle>
                <Scan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryDisplay.scanCount}</div>
                <p className="text-xs text-muted-foreground">统计周期内扫码总数</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">新增关注</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summaryDisplay.followCount}</div>
                <p className="text-xs text-muted-foreground">统计周期内关注数</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">取关人数</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summaryDisplay.unfollowCount}</div>
                <p className="text-xs text-muted-foreground">统计周期内取关数</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">净增关注</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{summaryDisplay.followCount - summaryDisplay.unfollowCount}</div>
                <p className="text-xs text-muted-foreground">关注-取关</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">参与员工</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.active_employees || 0}</div>
                <p className="text-xs text-muted-foreground">有推广记录的员工</p>
              </CardContent>
            </Card>
          </div>

          {/* 图表区域 */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* 趋势图 */}
            <Card>
              <CardHeader>
                <CardTitle>推广趋势</CardTitle>
                <CardDescription>统计周期内扫码关注趋势</CardDescription>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="scan_count" name="扫码" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="follow_count" name="关注" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    暂无趋势数据
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 公众号对比 */}
            <Card>
              <CardHeader>
                <CardTitle>公众号推广对比</CardTitle>
                <CardDescription>各公众号推广效果对比</CardDescription>
              </CardHeader>
              <CardContent>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="扫码" fill="#8884d8" />
                      <Bar dataKey="关注" fill="#22c55e" />
                      <Bar dataKey="取关" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    暂无公众号数据
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 公众号详情卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>公众号推广详情</CardTitle>
              <CardDescription>各公众号的推广数据（统计周期：{startDate} ~ {endDate}）</CardDescription>
            </CardHeader>
            <CardContent>
              {accountStats.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accountStats.map((account, index) => {
                    const rate = account.scan_count > 0 
                      ? ((account.follow_count / account.scan_count) * 100).toFixed(1) 
                      : '0'
                    const color = accountColors[index % accountColors.length]
                    
                    return (
                      <div key={account.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <MessageCircle className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <div className="font-medium">{account.account_name}</div>
                            <div className="text-sm text-muted-foreground">
                              转化率 {rate}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white rounded p-2 border">
                            <div className="text-lg font-bold">{account.scan_count}</div>
                            <div className="text-xs text-muted-foreground">扫码</div>
                          </div>
                          <div className="bg-green-50 rounded p-2 border border-green-200">
                            <div className="text-lg font-bold text-green-600">{account.follow_count}</div>
                            <div className="text-xs text-muted-foreground">关注</div>
                          </div>
                          <div className="bg-red-50 rounded p-2 border border-red-200">
                            <div className="text-lg font-bold text-red-600">{account.unfollow_count}</div>
                            <div className="text-xs text-muted-foreground">取关</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  暂无公众号数据
                </div>
              )}
            </CardContent>
          </Card>

          {/* 推广明细 Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>推广明细</CardTitle>
              <CardDescription>按员工、按部门查看推广数据（统计周期：{startDate} ~ {endDate}）</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="employee">
                <TabsList>
                  <TabsTrigger value="employee">按员工</TabsTrigger>
                  <TabsTrigger value="department">按部门</TabsTrigger>
                  <TabsTrigger value="details">关注详情</TabsTrigger>
                </TabsList>
                
                {/* 按员工统计 */}
                <TabsContent value="employee" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工</TableHead>
                        <TableHead>部门</TableHead>
                        <TableHead className="text-center">扫码次数</TableHead>
                        <TableHead className="text-center">关注人数</TableHead>
                        <TableHead className="text-center">取关人数</TableHead>
                        <TableHead>净增</TableHead>
                        <TableHead>公众号分布</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeStats.length > 0 ? employeeStats.map(stat => {
                        const rate = stat.total_scan_count > 0 
                          ? ((stat.total_follow_count / stat.total_scan_count) * 100).toFixed(1) 
                          : '0'
                        const netGain = stat.total_follow_count - stat.total_unfollow_count
                        const accountData = getEmployeeAccountData(stat.employee_id)
                        const isExpanded = expandedEmployees.has(stat.employee_id)
                        
                        return (
                          <>
                            <TableRow key={stat.employee_id}>
                              <TableCell className="font-medium">{stat.employee_name}</TableCell>
                              <TableCell>{stat.department}</TableCell>
                              <TableCell className="text-center">{stat.total_scan_count}</TableCell>
                              <TableCell className="text-center text-green-600">{stat.total_follow_count}</TableCell>
                              <TableCell className="text-center text-red-600">{stat.total_unfollow_count}</TableCell>
                              <TableCell>
                                <span className={netGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {netGain >= 0 ? '+' : ''}{netGain}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {accountData.slice(0, 3).map((acc, idx) => (
                                    <Badge 
                                      key={acc.account_id}
                                      variant="outline"
                                      className="text-xs"
                                      style={{ borderColor: accountColors[idx % accountColors.length] }}
                                    >
                                      {acc.account_name?.slice(0, 4)}: {acc.follow_count}/{acc.scan_count}
                                    </Badge>
                                  ))}
                                  {accountData.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{accountData.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleEmployeeExpand(stat.employee_id)}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow key={`${stat.employee_id}-detail`} className="bg-gray-50">
                              <TableCell colSpan={8} className="p-4">
                                  <div className="space-y-2">
                                    <div className="font-medium text-sm mb-2">各公众号推广详情：</div>
                                    <div className="grid gap-2 md:grid-cols-3">
                                      {accountData.map((acc, idx) => (
                                        <div key={acc.account_id} className="bg-white border rounded p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div 
                                              className="w-3 h-3 rounded-full"
                                              style={{ backgroundColor: accountColors[idx % accountColors.length] }}
                                            />
                                            <span className="font-medium text-sm">{acc.account_name}</span>
                                          </div>
                                          <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                            <div>
                                              <div className="font-bold">{acc.scan_count}</div>
                                              <div className="text-xs text-muted-foreground">扫码</div>
                                            </div>
                                            <div>
                                              <div className="font-bold text-green-600">{acc.follow_count}</div>
                                              <div className="text-xs text-muted-foreground">关注</div>
                                            </div>
                                            <div>
                                              <div className="font-bold text-red-600">{acc.unfollow_count}</div>
                                              <div className="text-xs text-muted-foreground">取关</div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        )
                      }) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            暂无员工推广数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                {/* 按部门统计 */}
                <TabsContent value="department" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>部门</TableHead>
                        <TableHead className="text-center">参与员工</TableHead>
                        <TableHead className="text-center">扫码次数</TableHead>
                        <TableHead className="text-center">关注人数</TableHead>
                        <TableHead className="text-center">取关人数</TableHead>
                        <TableHead>净增</TableHead>
                        <TableHead>转化率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentStats.length > 0 ? departmentStats.map(stat => {
                        const rate = stat.total_scan_count > 0 
                          ? ((stat.total_follow_count / stat.total_scan_count) * 100).toFixed(1) 
                          : '0'
                        const netGain = stat.total_follow_count - stat.total_unfollow_count
                        
                        return (
                          <TableRow key={stat.department}>
                            <TableCell className="font-medium">{stat.department}</TableCell>
                            <TableCell className="text-center">{stat.employee_count}</TableCell>
                            <TableCell className="text-center">{stat.total_scan_count}</TableCell>
                            <TableCell className="text-center text-green-600">{stat.total_follow_count}</TableCell>
                            <TableCell className="text-center text-red-600">{stat.total_unfollow_count}</TableCell>
                            <TableCell>
                              <span className={netGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {netGain >= 0 ? '+' : ''}{netGain}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={parseFloat(rate)} className="h-2 w-16" />
                                <span className="text-sm">{rate}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      }) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            暂无部门统计数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                {/* 关注详情 */}
                <TabsContent value="details" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工</TableHead>
                        <TableHead>公众号</TableHead>
                        <TableHead>用户昵称</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>关注时间</TableHead>
                        <TableHead>取关时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {followDetails.length > 0 ? followDetails.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{detail.employee_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{detail.account_name || '未知'}</Badge>
                          </TableCell>
                          <TableCell>{detail.nickname || '未知用户'}</TableCell>
                          <TableCell>
                            {detail.status === 1 ? (
                              <Badge className="bg-green-100 text-green-800">已关注</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">已取关</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {detail.follow_time ? new Date(detail.follow_time).toLocaleString('zh-CN') : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {detail.unfollow_time ? new Date(detail.unfollow_time).toLocaleString('zh-CN') : '-'}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            暂无关注详情数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}