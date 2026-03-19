import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select } from '../ui/select'
import { 
  Download, TrendingUp, TrendingDown, BarChart3, Filter, 
  ChevronRight, Lightbulb, AlertTriangle, CheckCircle, 
  Calendar, Users, MessageSquare, Activity, Loader2
} from 'lucide-react'
import { mockOfficialAccounts, mockEmployees } from '../../data/mockData'
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

// 时间范围选项
const timeRangeOptions = [
  { label: '今日', value: 'today' },
  { label: '近7天', value: 'week' },
  { label: '近30天', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '自定义', value: 'custom' },
]

// 分析维度选项
const dimensionOptions = [
  { label: '按部门', value: 'department' },
  { label: '按员工', value: 'employee' },
  { label: '按公众号', value: 'account' },
  { label: '按时间', value: 'time' },
]

// 统一获取公众号名称
const accounts = mockOfficialAccounts.map(acc => ({ id: acc.id, name: acc.name }))

// 统一获取部门列表
const departments = ['销售部', '市场部', '运营部', '技术部', '行政部', '人力资源部', '财务部']

// 根据时间范围获取天数
const getDaysByTimeRange = (range: string) => {
  switch (range) {
    case 'today': return 1
    case 'week': return 7
    case 'month': return 30
    case 'quarter': return 90
    case 'custom': return 14
    default: return 14
  }
}

// 根据筛选条件生成种子，确保相同条件生成相同数据
const getSeed = (timeRange: string, dimension: string, department: string, account: string) => {
  return `${timeRange}-${dimension}-${department}-${account}`
}

// 基于种子的伪随机数生成器
const seededRandom = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return () => {
    hash = Math.sin(hash) * 10000
    return hash - Math.floor(hash)
  }
}

// 模拟趋势数据 - 根据筛选条件
const generateTrendData = (days: number, seed: string) => {
  const random = seededRandom(seed + '-trend')
  const data = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      subscribe: Math.floor(random() * 100) + 50,
      unsubscribe: Math.floor(random() * 20) + 5,
      net: Math.floor(random() * 80) + 45,
    })
  }
  return data
}

// 模拟同比环比数据 - 根据筛选条件
const generateComparisonData = (seed: string) => {
  const random = seededRandom(seed + '-comparison')
  const current = Math.floor(random() * 200) + 100
  const previous = Math.floor(random() * 150) + 80
  const change = Number(((current - previous) / previous * 100).toFixed(1))
  
  const currentW = Math.floor(random() * 500) + 500
  const previousW = Math.floor(random() * 400) + 400
  const changeW = Number(((currentW - previousW) / previousW * 100).toFixed(1))
  
  const currentM = Math.floor(random() * 2000) + 2000
  const previousM = Math.floor(random() * 1500) + 1500
  const changeM = Number(((currentM - previousM) / previousM * 100).toFixed(1))
  
  const currentY = Math.floor(random() * 20000) + 30000
  const previousY = Math.floor(random() * 15000) + 25000
  const changeY = Number(((currentY - previousY) / previousY * 100).toFixed(1))
  
  return {
    daily: { current, previous, change, trend: change >= 0 ? 'up' : 'down' },
    weekly: { current: currentW, previous: previousW, change: changeW, trend: changeW >= 0 ? 'up' : 'down' },
    monthly: { current: currentM, previous: previousM, change: changeM, trend: changeM >= 0 ? 'up' : 'down' },
    yearly: { current: currentY, previous: previousY, change: changeY, trend: changeY >= 0 ? 'up' : 'down' }
  }
}

// 模拟交叉分析数据 - 根据筛选条件
const generateCrossAnalysisData = (seed: string, selectedDept: string, selectedAcc: string) => {
  const random = seededRandom(seed + '-cross')
  const data: Record<string, Record<string, number>> = {}
  
  const filteredDepts = selectedDept === 'all' 
    ? departments.slice(0, 5) 
    : [selectedDept]
  
  const filteredAccounts = selectedAcc === 'all'
    ? accounts
    : accounts.filter(a => a.id === selectedAcc)
  
  filteredDepts.forEach(dept => {
    data[dept] = {}
    filteredAccounts.forEach(acc => {
      data[dept][acc.name] = Math.floor(random() * 200) + 50
    })
  })
  return data
}

// 模拟漏斗数据
const funnelData = [
  { name: '扫描二维码', value: 1000, rate: 100 },
  { name: '关注公众号', value: 750, rate: 75 },
  { name: '完成绑定', value: 600, rate: 80 },
  { name: '持续活跃', value: 450, rate: 75 },
]

// 模拟智能洞察 - 根据筛选条件动态生成
const generateInsights = (seed: string, selectedDept: string, selectedAcc: string) => {
  const random = seededRandom(seed + '-insights')
  const results = []
  
  // 基于筛选条件生成不同的洞察
  if (selectedDept === 'all') {
    results.push({
      type: 'success',
      icon: CheckCircle,
      title: '市场部表现最佳',
      description: `本周净增关注 ${Math.floor(random() * 200) + 100} 人，转化率 ${(random() * 10 + 80).toFixed(1)}%，建议增加推广资源投入`,
    })
  } else {
    results.push({
      type: 'success',
      icon: CheckCircle,
      title: `${selectedDept}表现良好`,
      description: `本周净增关注 ${Math.floor(random() * 100) + 50} 人，转化率 ${(random() * 10 + 75).toFixed(1)}%，持续保持推广力度`,
    })
  }
  
  if (selectedAcc === 'all') {
    results.push({
      type: 'warning',
      icon: AlertTriangle,
      title: '招聘订阅号流失率偏高',
      description: `近7天流失率达 ${(random() * 5 + 8).toFixed(1)}%，高于平均水平，建议优化内容质量`,
    })
  } else {
    const accName = accounts.find(a => a.id === selectedAcc)?.name || '该公众号'
    results.push({
      type: 'info',
      icon: MessageSquare,
      title: `${accName}数据分析`,
      description: `本周新增关注 ${Math.floor(random() * 150) + 80} 人，净增 ${Math.floor(random() * 100) + 60} 人`,
    })
  }
  
  results.push({
    type: 'info',
    icon: Calendar,
    title: '最佳推广时间',
    description: `${['周一', '周二', '周三', '周四', '周五'][Math.floor(random() * 5)]} ${Math.floor(random() * 4 + 9)}:00-${Math.floor(random() * 2 + 11)}:00 推广效果最佳，转化率比平均水平高 ${(random() * 15 + 15).toFixed(0)}%`,
  })
  
  const employeeNames = ['张三', '李四', '王五', '赵六', '孙八', '周九', '吴十']
  results.push({
    type: 'info',
    icon: Lightbulb,
    title: '发现潜力员工',
    description: `${employeeNames[Math.floor(random() * employeeNames.length)]}近3天表现突出，转化率 ${(random() * 10 + 80).toFixed(1)}%，可考虑作为推广标杆`,
  })
  
  return results
}

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState('week')
  const [dimension, setDimension] = useState('department')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  
  // 生成种子和数据
  const seed = useMemo(() => 
    getSeed(timeRange, dimension, selectedDepartment, selectedAccount),
    [timeRange, dimension, selectedDepartment, selectedAccount]
  )
  
  const days = useMemo(() => getDaysByTimeRange(timeRange), [timeRange])
  
  const trendData = useMemo(() => generateTrendData(days, seed), [days, seed])
  const comparisonData = useMemo(() => generateComparisonData(seed), [seed])
  const crossAnalysisData = useMemo(() => 
    generateCrossAnalysisData(seed, selectedDepartment, selectedAccount), 
    [seed, selectedDepartment, selectedAccount]
  )
  const insights = useMemo(() => 
    generateInsights(seed, selectedDepartment, selectedAccount),
    [seed, selectedDepartment, selectedAccount]
  )
  
  // 计算汇总数据
  const summary = useMemo(() => {
    const total = trendData.reduce((acc, d) => acc + d.net, 0)
    const subscribe = trendData.reduce((acc, d) => acc + d.subscribe, 0)
    const unsubscribe = trendData.reduce((acc, d) => acc + d.unsubscribe, 0)
    return { total, subscribe, unsubscribe }
  }, [trendData])

  // 生成报表
  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    setReportGenerated(true)
    setIsGenerating(false)
  }

  // 导出报表
  const handleExportReport = async () => {
    setIsExporting(true)
    
    try {
      // 准备CSV数据
      const rows = [
        ['数据报表导出'],
        ['生成时间', new Date().toLocaleString()],
        ['时间范围', timeRangeOptions.find(o => o.value === timeRange)?.label || timeRange],
        ['分析维度', dimensionOptions.find(o => o.value === dimension)?.label || dimension],
        ['筛选部门', selectedDepartment === 'all' ? '全部部门' : selectedDepartment],
        ['筛选公众号', selectedAccount === 'all' ? '全部公众号' : accounts.find(a => a.id === selectedAccount)?.name || selectedAccount],
        [],
        ['=== 同比环比分析 ==='],
        ['指标', '当前值', '对比值', '变化率'],
        ['日环比', comparisonData.daily.current, comparisonData.daily.previous, `${comparisonData.daily.change}%`],
        ['周环比', comparisonData.weekly.current, comparisonData.weekly.previous, `${comparisonData.weekly.change}%`],
        ['月环比', comparisonData.monthly.current, comparisonData.monthly.previous, `${comparisonData.monthly.change}%`],
        ['年同比', comparisonData.yearly.current, comparisonData.yearly.previous, `${comparisonData.yearly.change}%`],
        [],
        ['=== 关注趋势数据 ==='],
        ['日期', '新增关注', '取消关注', '净增长'],
        ...trendData.map(d => [d.date, d.subscribe, d.unsubscribe, d.net]),
        [],
        ['=== 转化漏斗 ==='],
        ['环节', '数量', '转化率'],
        ...funnelData.map(f => [f.name, f.value, `${f.rate}%`]),
        [],
        ['=== 部门×公众号交叉分析 ==='],
        ['部门', ...Object.keys(Object.values(crossAnalysisData)[0] || {}), '合计'],
        ...Object.entries(crossAnalysisData).map(([dept, accData]) => {
          const total = Object.values(accData).reduce((a, b) => a + b, 0)
          return [dept, ...Object.values(accData), total]
        }),
      ]

      // 生成CSV内容
      const csvContent = rows.map(row => row.join(',')).join('\n')
      
      // 添加BOM以支持中文
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `数据报表_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请重试')
    }
    
    setIsExporting(false)
  }

  // 颜色配置
  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据报表</h1>
          <p className="text-muted-foreground">
            多维度数据分析、同比环比对比、转化漏斗与智能洞察
          </p>
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

      {/* 自定义报表生成器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            自定义报表
          </CardTitle>
          <CardDescription>选择条件生成定制化数据报表</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">时间范围</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                {timeRangeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">分析维度</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
              >
                {dimensionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">筛选部门</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">全部部门</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">筛选公众号</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option value="all">全部公众号</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            {reportGenerated && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                报表已生成
              </div>
            )}
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="ml-auto">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  生成报表
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 同比环比分析 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>日环比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">{comparisonData.daily.current}</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{comparisonData.daily.change}%
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>昨日: {comparisonData.daily.previous}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>周环比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">{comparisonData.weekly.current}</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{comparisonData.weekly.change}%
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>上周: {comparisonData.weekly.previous}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>月环比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">{comparisonData.monthly.current}</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{comparisonData.monthly.change}%
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>上月: {comparisonData.monthly.previous}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>年同比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">{comparisonData.yearly.current.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{comparisonData.yearly.change}%
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>去年: {comparisonData.yearly.previous.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图 + 转化漏斗 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>关注趋势分析</CardTitle>
            <CardDescription>
              {timeRange === 'today' ? '今日关注量变化' :
               timeRange === 'week' ? '近7天关注量变化趋势' :
               timeRange === 'month' ? '近30天关注量变化趋势' :
               timeRange === 'quarter' ? '本季度关注量变化趋势' :
               '近14天关注量变化趋势'}
              {selectedDepartment !== 'all' && ` - ${selectedDepartment}`}
              {selectedAccount !== 'all' && ` - ${accounts.find(a => a.id === selectedAccount)?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                <Area type="monotone" dataKey="subscribe" stroke="#1677ff" fillOpacity={1} fill="url(#colorSubscribe)" name="新增关注" />
                <Area type="monotone" dataKey="net" stroke="#52c41a" fillOpacity={1} fill="url(#colorNet)" name="净增长" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 转化漏斗 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              转化漏斗
            </CardTitle>
            <CardDescription>用户转化各环节分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.value}</span>
                      {index > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {item.rate}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative h-8 rounded-md bg-muted overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 rounded-md transition-all"
                      style={{ 
                        width: `${(item.value / funnelData[0].value) * 100}%`,
                        backgroundColor: COLORS[index]
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">整体转化率</span>
                  <span className="font-bold text-green-600">45%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 多维度交叉分析 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dimension === 'department' ? '部门 × 公众号 交叉分析' :
             dimension === 'employee' ? '员工推广效果分析' :
             dimension === 'account' ? '公众号推广效果分析' :
             '时间趋势分析'}
          </CardTitle>
          <CardDescription>
            {selectedDepartment !== 'all' && selectedAccount !== 'all' 
              ? `筛选条件：${selectedDepartment} - ${accounts.find(a => a.id === selectedAccount)?.name}`
              : selectedDepartment !== 'all' 
                ? `筛选条件：${selectedDepartment}`
                : selectedAccount !== 'all'
                  ? `筛选条件：${accounts.find(a => a.id === selectedAccount)?.name}`
                  : '各部门在不同公众号的推广效果对比'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(crossAnalysisData).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">部门</th>
                    {Object.keys(Object.values(crossAnalysisData)[0] || {}).map(accName => (
                      <th key={accName} className="text-right p-3 font-medium">{accName}</th>
                    ))}
                    <th className="text-right p-3 font-medium text-primary">合计</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(crossAnalysisData).map(([dept, accData]) => {
                    const total = Object.values(accData).reduce((a, b) => a + b, 0)
                    return (
                      <tr key={dept} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{dept}</td>
                        {Object.entries(accData).map(([accName, value]) => (
                          <td key={accName} className="text-right p-3">
                            <span className={`inline-flex items-center justify-center min-w-[60px] px-2 py-1 rounded text-sm ${
                              value > 150 ? 'bg-green-100 text-green-700' :
                              value > 100 ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              +{value}
                            </span>
                          </td>
                        ))}
                        <td className="text-right p-3 font-bold text-primary">+{total}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50">
                    <td className="p-3 font-bold">合计</td>
                    {Object.keys(Object.values(crossAnalysisData)[0] || {}).map(accName => {
                      const total = Object.values(crossAnalysisData).reduce((sum, dept) => sum + (dept[accName] || 0), 0)
                      return (
                        <td key={accName} className="text-right p-3 font-bold">+{total}</td>
                      )
                    })}
                    <td className="text-right p-3 font-bold text-primary">
                      +{Object.values(crossAnalysisData).reduce((sum, dept) => sum + Object.values(dept).reduce((a, b) => a + b, 0), 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              请选择筛选条件后点击"生成报表"
            </div>
          )}
        </CardContent>
      </Card>

      {/* 智能洞察 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            智能洞察
          </CardTitle>
          <CardDescription>基于数据分析的优化建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => {
              const Icon = insight.icon
              const colorMap = {
                success: 'bg-green-100 text-green-600',
                warning: 'bg-yellow-100 text-yellow-600',
                info: 'bg-blue-100 text-blue-600',
              }
              return (
                <div key={index} className="flex gap-3 rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorMap[insight.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
