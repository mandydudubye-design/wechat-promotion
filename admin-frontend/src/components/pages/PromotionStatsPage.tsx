import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Scan, UserCheck, UserX, ArrowUpRight, BarChart3, Wechat } from 'lucide-react'
import { mockEmployees, mockPromotionRecords, departments } from '../../data/mockData'
import type { Employee, PromotionRecord } from '../../types'

// 公众号列表
const wechatAccounts = [
  { id: 'acc001', name: '主公众号', color: '#22c55e' },
  { id: 'acc002', name: '推广号1', color: '#3b82f6' },
  { id: 'acc003', name: '推广号2', color: '#f59e0b' },
]

// 模拟推广记录数据（包含公众号信息）
const mockPromotionRecordsWithAccount: (PromotionRecord & { accountId: string })[] = [
  // 主公众号推广记录
  { id: '1', employeeId: '1', employeeName: '张伟', department: '行政部', sceneId: 'scene_001', newUserOpenid: 'onewuser001', newUserNickname: '用户A', scanTime: '2026-03-08 10:20:00', subscribeTime: '2026-03-08 10:22:00', status: 1, accountId: 'acc001' },
  { id: '2', employeeId: '2', employeeName: '李娜', department: '人力资源部', sceneId: 'scene_002', newUserOpenid: 'onewuser002', newUserNickname: '用户B', scanTime: '2026-03-08 11:30:00', subscribeTime: '2026-03-08 11:32:00', status: 1, accountId: 'acc001' },
  { id: '3', employeeId: '7', employeeName: '孙磊', department: '销售部', sceneId: 'scene_007', newUserOpenid: 'onewuser003', newUserNickname: '用户C', scanTime: '2026-03-08 14:15:00', status: 0, accountId: 'acc001' },
  { id: '4', employeeId: '1', employeeName: '张伟', department: '行政部', sceneId: 'scene_001', newUserOpenid: 'onewuser004', newUserNickname: '用户D', scanTime: '2026-03-07 09:00:00', subscribeTime: '2026-03-07 09:05:00', status: 1, accountId: 'acc001' },
  { id: '5', employeeId: '6', employeeName: '赵敏', department: '行政部', sceneId: 'scene_006', newUserOpenid: 'onewuser005', newUserNickname: '用户E', scanTime: '2026-03-07 15:30:00', subscribeTime: '2026-03-07 15:35:00', status: 1, accountId: 'acc001' },
  // 推广号1记录
  { id: '6', employeeId: '2', employeeName: '李娜', department: '人力资源部', sceneId: 'scene_002_acc2', newUserOpenid: 'onewuser006', newUserNickname: '用户F', scanTime: '2026-03-08 16:00:00', subscribeTime: '2026-03-08 16:03:00', status: 1, accountId: 'acc002' },
  { id: '7', employeeId: '7', employeeName: '孙磊', department: '销售部', sceneId: 'scene_007_acc2', newUserOpenid: 'onewuser007', newUserNickname: '用户G', scanTime: '2026-03-08 17:20:00', subscribeTime: '2026-03-08 17:25:00', status: 1, accountId: 'acc002' },
  { id: '8', employeeId: '4', employeeName: '刘强', department: '技术部', sceneId: 'scene_004_acc2', newUserOpenid: 'onewuser008', newUserNickname: '用户H', scanTime: '2026-03-07 10:00:00', status: 0, accountId: 'acc002' },
  { id: '9', employeeId: '6', employeeName: '赵敏', department: '行政部', sceneId: 'scene_006_acc2', newUserOpenid: 'onewuser009', newUserNickname: '用户I', scanTime: '2026-03-06 14:00:00', subscribeTime: '2026-03-06 14:05:00', status: 1, accountId: 'acc002' },
  // 推广号2记录
  { id: '10', employeeId: '7', employeeName: '孙磊', department: '销售部', sceneId: 'scene_007_acc3', newUserOpenid: 'onewuser010', newUserNickname: '用户J', scanTime: '2026-03-08 18:00:00', subscribeTime: '2026-03-08 18:02:00', status: 1, accountId: 'acc003' },
  { id: '11', employeeId: '2', employeeName: '李娜', department: '人力资源部', sceneId: 'scene_002_acc3', newUserOpenid: 'onewuser011', newUserNickname: '用户K', scanTime: '2026-03-07 11:00:00', subscribeTime: '2026-03-07 11:05:00', status: 1, accountId: 'acc003' },
  { id: '12', employeeId: '1', employeeName: '张伟', department: '行政部', sceneId: 'scene_001_acc3', newUserOpenid: 'onewuser012', newUserNickname: '用户L', scanTime: '2026-03-06 09:30:00', status: 0, accountId: 'acc003' },
  { id: '13', employeeId: '6', employeeName: '赵敏', department: '行政部', sceneId: 'scene_006_acc3', newUserOpenid: 'onewuser013', newUserNickname: '用户M', scanTime: '2026-03-05 16:00:00', subscribeTime: '2026-03-05 16:10:00', status: 1, accountId: 'acc003' },
]

export function PromotionStatsPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('week')

  // 筛选后的推广记录
  const filteredRecords = useMemo(() => {
    return mockPromotionRecordsWithAccount.filter(record => {
      if (selectedAccount !== 'all' && record.accountId !== selectedAccount) return false
      if (selectedDepartment !== 'all' && record.department !== selectedDepartment) return false
      return true
    })
  }, [selectedAccount, selectedDepartment])

  // 汇总统计
  const summaryStats = useMemo(() => {
    const scanCount = filteredRecords.length
    const subscribeCount = filteredRecords.filter(r => r.status === 1).length
    const unsubscribeCount = 0 // 模拟数据暂无取关
    const conversionRate = scanCount > 0 ? ((subscribeCount / scanCount) * 100).toFixed(1) : '0'
    
    return { scanCount, subscribeCount, unsubscribeCount, conversionRate }
  }, [filteredRecords])

  // 按公众号统计
  const accountStats = useMemo(() => {
    return wechatAccounts.map(account => {
      const records = mockPromotionRecordsWithAccount.filter(r => r.accountId === account.id)
      const scans = records.length
      const subscribes = records.filter(r => r.status === 1).length
      
      return {
        ...account,
        scanCount: scans,
        subscribeCount: subscribes,
        rate: scans > 0 ? ((subscribes / scans) * 100).toFixed(1) : '0'
      }
    })
  }, [])

  // 按员工统计
  const employeeStats = useMemo(() => {
    const statsMap = new Map<string, {
      employeeId: string
      employeeName: string
      department: string
      scanCount: number
      subscribeCount: number
      accounts: { accountId: string; scanCount: number; subscribeCount: number }[]
    }>()

    filteredRecords.forEach(record => {
      if (!statsMap.has(record.employeeId)) {
        statsMap.set(record.employeeId, {
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          department: record.department,
          scanCount: 0,
          subscribeCount: 0,
          accounts: wechatAccounts.map(acc => ({ accountId: acc.id, scanCount: 0, subscribeCount: 0 }))
        })
      }
      
      const stat = statsMap.get(record.employeeId)!
      stat.scanCount++
      if (record.status === 1) stat.subscribeCount++
      
      const accStat = stat.accounts.find(a => a.accountId === record.accountId)
      if (accStat) {
        accStat.scanCount++
        if (record.status === 1) accStat.subscribeCount++
      }
    })

    return Array.from(statsMap.values()).sort((a, b) => b.scanCount - a.scanCount)
  }, [filteredRecords])

  // 按部门统计
  const departmentStats = useMemo(() => {
    const statsMap = new Map<string, {
      department: string
      scanCount: number
      subscribeCount: number
      employeeCount: number
    }>()

    filteredRecords.forEach(record => {
      if (!statsMap.has(record.department)) {
        statsMap.set(record.department, {
          department: record.department,
          scanCount: 0,
          subscribeCount: 0,
          employeeCount: 0
        })
      }
      
      const stat = statsMap.get(record.department)!
      stat.scanCount++
      if (record.status === 1) stat.subscribeCount++
    })

    // 统计参与推广的员工数
    const employeeSet = new Map<string, Set<string>>()
    filteredRecords.forEach(record => {
      if (!employeeSet.has(record.department)) {
        employeeSet.set(record.department, new Set())
      }
      employeeSet.get(record.department)!.add(record.employeeId)
    })

    statsMap.forEach((stat, dept) => {
      stat.employeeCount = employeeSet.get(dept)?.size || 0
    })

    return Array.from(statsMap.values()).sort((a, b) => b.scanCount - a.scanCount)
  }, [filteredRecords])

  // 趋势数据
  const trendData = useMemo(() => {
    const days = ['03-05', '03-06', '03-07', '03-08', '03-09', '03-10', '03-11']
    return days.map(day => {
      const dayRecords = mockPromotionRecordsWithAccount.filter(r => r.scanTime.includes(day))
      const targetRecords = selectedAccount === 'all' 
        ? dayRecords 
        : dayRecords.filter(r => r.accountId === selectedAccount)
      
      return {
        date: day,
        扫码: targetRecords.length,
        关注: targetRecords.filter(r => r.status === 1).length,
      }
    })
  }, [selectedAccount])

  // 柱状图数据
  const barData = accountStats.map(acc => ({
    name: acc.name,
    扫码: acc.scanCount,
    关注: acc.subscribeCount,
  }))

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
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择公众号" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部公众号</SelectItem>
                {wechatAccounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                {departments.filter(d => d !== '全部部门').map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 汇总卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总扫码次数</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.scanCount}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              较上周 +12%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新增关注</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.subscribeCount}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              较上周 +8%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转化率</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">扫码转关注比例</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参与员工</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.length}</div>
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
            <CardDescription>近期扫码关注趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="扫码" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="关注" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 公众号对比 */}
        <Card>
          <CardHeader>
            <CardTitle>公众号推广对比</CardTitle>
            <CardDescription>各公众号推广效果对比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="扫码" fill="#8884d8" />
                <Bar dataKey="关注" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 公众号详情 */}
      <Card>
        <CardHeader>
          <CardTitle>公众号推广详情</CardTitle>
          <CardDescription>各公众号的推广数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {accountStats.map(account => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Wechat className="w-5 h-5" style={{ color: account.color }} />
                  </div>
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">
                      转化率 {account.rate}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-muted rounded p-2">
                    <div className="text-lg font-bold">{account.scanCount}</div>
                    <div className="text-xs text-muted-foreground">扫码</div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-lg font-bold text-green-600">{account.subscribeCount}</div>
                    <div className="text-xs text-muted-foreground">关注</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 按维度查看的 Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>推广明细</CardTitle>
          <CardDescription>按人、按部门查看推广数据</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employee">
            <TabsList>
              <TabsTrigger value="employee">按员工</TabsTrigger>
              <TabsTrigger value="department">按部门</TabsTrigger>
            </TabsList>
            
            <TabsContent value="employee" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead className="text-center">扫码次数</TableHead>
                    <TableHead className="text-center">关注人数</TableHead>
                    <TableHead>转化率</TableHead>
                    <TableHead>公众号分布</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeStats.map(stat => {
                    const rate = stat.scanCount > 0 ? ((stat.subscribeCount / stat.scanCount) * 100).toFixed(1) : '0'
                    return (
                      <TableRow key={stat.employeeId}>
                        <TableCell className="font-medium">{stat.employeeName}</TableCell>
                        <TableCell>{stat.department}</TableCell>
                        <TableCell className="text-center">{stat.scanCount}</TableCell>
                        <TableCell className="text-center text-green-600">{stat.subscribeCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(rate)} className="h-2 w-16" />
                            <span className="text-sm">{rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {stat.accounts.map(acc => {
                              const accountInfo = wechatAccounts.find(a => a.id === acc.accountId)
                              if (acc.scanCount === 0) return null
                              return (
                                <Badge 
                                  key={acc.accountId}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {accountInfo?.name.slice(0, 2)}: {acc.subscribeCount}/{acc.scanCount}
                                </Badge>
                              )
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="department" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>部门</TableHead>
                    <TableHead className="text-center">参与员工</TableHead>
                    <TableHead className="text-center">扫码次数</TableHead>
                    <TableHead className="text-center">关注人数</TableHead>
                    <TableHead>转化率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats.map(stat => {
                    const rate = stat.scanCount > 0 ? ((stat.subscribeCount / stat.scanCount) * 100).toFixed(1) : '0'
                    return (
                      <TableRow key={stat.department}>
                        <TableCell className="font-medium">{stat.department}</TableCell>
                        <TableCell className="text-center">{stat.employeeCount}</TableCell>
                        <TableCell className="text-center">{stat.scanCount}</TableCell>
                        <TableCell className="text-center text-green-600">{stat.subscribeCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(rate)} className="h-2 w-16" />
                            <span className="text-sm">{rate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}