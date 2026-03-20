import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MessageCircle, Users, CheckCircle, XCircle, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'
import { mockEmployees, departments } from '../../data/mockData'
import type { Employee } from '../../types'

const API_BASE = 'http://localhost:11827/api'

// 公众号颜色
const ACCOUNT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

interface WechatAccount {
  id: number
  account_name: string
  color: string
}

export function EmployeeFollowStatsPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [wechatAccounts, setWechatAccounts] = useState<WechatAccount[]>([])
  
  // 从API获取公众号列表
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE}/accounts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.code === 200) {
          const accounts = (result.data || []).map((acc: any, index: number) => ({
            id: acc.id,
            account_name: acc.account_name,
            color: ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]
          }))
          setWechatAccounts(accounts)
        }
      } catch (error) {
        console.error('获取公众号列表失败', error)
      }
    }
    fetchAccounts()
  }, [])

  // 只统计已绑定员工
  const boundEmployees = useMemo(() => 
    mockEmployees.filter(emp => emp.bindStatus === 1),
    [mockEmployees]
  )

  // 计算各公众号关注统计
  const accountStats = useMemo(() => {
    return wechatAccounts.map(account => {
      const followers = boundEmployees.filter(emp => {
        if (emp.followStatuses) {
          const status = emp.followStatuses.find(s => s.accountId === account.id)
          return status?.isFollowed
        }
        // 兼容旧数据
        return account.id === 1 && emp.followStatus === 1
      })
      return {
        ...account,
        followCount: followers.length,
        totalCount: boundEmployees.length,
        rate: boundEmployees.length > 0 ? ((followers.length / boundEmployees.length) * 100).toFixed(1) : '0'
      }
    })
  }, [boundEmployees, wechatAccounts])

  // 按部门统计某公众号的关注情况
  const departmentStats = useMemo(() => {
    const targetAccount = selectedAccount === 'all' ? null : parseInt(selectedAccount)
    
    return departments.filter(d => d !== '全部部门').map(dept => {
      const deptEmployees = boundEmployees.filter(emp => emp.department === dept)
      let followedCount = 0
      
      deptEmployees.forEach(emp => {
        if (targetAccount) {
          // 统计特定公众号
          if (emp.followStatuses) {
            const status = emp.followStatuses.find(s => s.accountId === targetAccount)
            if (status?.isFollowed) followedCount++
          } else if (targetAccount === 1 && emp.followStatus === 1) {
            followedCount++
          }
        } else {
          // 统计任意公众号有关注的员工数
          if (emp.followStatuses) {
            if (emp.followStatuses.some(s => s.isFollowed)) followedCount++
          } else if (emp.followStatus === 1) {
            followedCount++
          }
        }
      })
      
      return {
        department: dept,
        total: deptEmployees.length,
        followed: followedCount,
        notFollowed: deptEmployees.length - followedCount,
        rate: deptEmployees.length > 0 ? ((followedCount / deptEmployees.length) * 100).toFixed(1) : '0'
      }
    })
  }, [boundEmployees, selectedAccount])

  // 员工分类：全部关注、部分关注、未关注
  const employeeCategories = useMemo(() => {
    const allFollowed: Employee[] = []
    const partialFollowed: Employee[] = []
    const notFollowed: Employee[] = []
    
    boundEmployees.forEach(emp => {
      if (emp.followStatuses && wechatAccounts.length > 0) {
        const followedCount = emp.followStatuses.filter(s => s.isFollowed).length
        if (followedCount === wechatAccounts.length) {
          allFollowed.push(emp)
        } else if (followedCount > 0) {
          partialFollowed.push(emp)
        } else {
          notFollowed.push(emp)
        }
      } else {
        // 兼容旧数据
        if (emp.followStatus === 1) {
          partialFollowed.push(emp)
        } else {
          notFollowed.push(emp)
        }
      }
    })
    
    return { allFollowed, partialFollowed, notFollowed }
  }, [boundEmployees, wechatAccounts])

  // 饼图数据
  const pieData = [
    { name: '全部关注', value: employeeCategories.allFollowed.length, color: '#22c55e' },
    { name: '部分关注', value: employeeCategories.partialFollowed.length, color: '#f59e0b' },
    { name: '未关注', value: employeeCategories.notFollowed.length, color: '#ef4444' },
  ]

  // 柱状图数据
  const barData = accountStats.map(acc => ({
    name: acc.account_name,
    关注人数: acc.followCount,
    未关注: acc.totalCount - acc.followCount,
  }))

  // 筛选后的员工列表
  const filteredEmployees = useMemo(() => {
    let result = boundEmployees
    
    if (selectedDepartment !== 'all') {
      result = result.filter(emp => emp.department === selectedDepartment)
    }
    
    return result
  }, [boundEmployees, selectedDepartment])

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">员工关注统计</h1>
        <p className="text-muted-foreground">
          查看员工对各公众号的关注情况，分析关注分布
        </p>
      </div>

      {/* 汇总卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已绑定员工</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boundEmployees.length}</div>
            <p className="text-xs text-muted-foreground">已绑定微信账号</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全部关注</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{employeeCategories.allFollowed.length}</div>
            <p className="text-xs text-muted-foreground">
              占比 {boundEmployees.length > 0 ? ((employeeCategories.allFollowed.length / boundEmployees.length) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">部分关注</CardTitle>
            <MessageCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{employeeCategories.partialFollowed.length}</div>
            <p className="text-xs text-muted-foreground">
              占比 {boundEmployees.length > 0 ? ((employeeCategories.partialFollowed.length / boundEmployees.length) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未关注</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{employeeCategories.notFollowed.length}</div>
            <p className="text-xs text-muted-foreground">
              占比 {boundEmployees.length > 0 ? ((employeeCategories.notFollowed.length / boundEmployees.length) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 关注情况饼图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              员工关注分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value}人</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 公众号关注柱状图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              各公众号关注情况
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="关注人数" fill="#22c55e" />
                <Bar dataKey="未关注" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 各公众号详细统计 */}
      <Card>
        <CardHeader>
          <CardTitle>公众号关注详情</CardTitle>
          <CardDescription>各公众号的关注人数和比例</CardDescription>
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
                    <MessageCircle className="w-5 h-5" style={{ color: account.color }} />
                  </div>
                  <div>
                    <div className="font-medium">{account.account_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.followCount}/{account.totalCount} 人关注
                    </div>
                  </div>
                </div>
                <Progress value={parseFloat(account.rate)} className="h-2" />
                <div className="text-right text-sm text-muted-foreground mt-1">
                  {account.rate}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 按部门统计 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>部门关注统计</CardTitle>
              <CardDescription>查看各部门员工的关注情况</CardDescription>
            </div>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择公众号" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部公众号</SelectItem>
                {wechatAccounts.map(acc => (
                  <SelectItem key={acc.id} value={String(acc.id)}>{acc.account_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>部门</TableHead>
                <TableHead className="text-center">员工数</TableHead>
                <TableHead className="text-center">已关注</TableHead>
                <TableHead className="text-center">未关注</TableHead>
                <TableHead>关注率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentStats.map(stat => (
                <TableRow key={stat.department}>
                  <TableCell className="font-medium">{stat.department}</TableCell>
                  <TableCell className="text-center">{stat.total}</TableCell>
                  <TableCell className="text-center text-green-600">{stat.followed}</TableCell>
                  <TableCell className="text-center text-red-600">{stat.notFollowed}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={parseFloat(stat.rate)} className="h-2 w-24" />
                      <span className="text-sm">{stat.rate}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 员工分类详情 - Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>员工关注详情</CardTitle>
          <CardDescription>按关注状态分类查看员工</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                {departments.filter(d => d !== '全部部门').map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                全部关注 ({employeeCategories.allFollowed.filter(e => selectedDepartment === 'all' || e.department === selectedDepartment).length})
              </TabsTrigger>
              <TabsTrigger value="partial">
                部分关注 ({employeeCategories.partialFollowed.filter(e => selectedDepartment === 'all' || e.department === selectedDepartment).length})
              </TabsTrigger>
              <TabsTrigger value="none">
                未关注 ({employeeCategories.notFollowed.filter(e => selectedDepartment === 'all' || e.department === selectedDepartment).length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <EmployeeTable employees={employeeCategories.allFollowed.filter(e => selectedDepartment === 'all' || e.department === selectedDepartment)} wechatAccounts={wechatAccounts} />
            </TabsContent>
            <TabsContent value="partial" className="mt-4">
              <EmployeeTable employees={employeeCategories.partialFollowed.filter(e => selectedDepartment === 'all' || e.department === selectedDepartment)} wechatAccounts={wechatAccounts} showStatus />
            </TabsContent>
            <TabsContent value="none" className="mt-4">
              <EmployeeTable employees={employeeCategories.notFollowed.filter(e => selectedDepartment === 'all' || e.department === selectedDepartment)} wechatAccounts={wechatAccounts} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// 员工表格组件
function EmployeeTable({ 
  employees, 
  wechatAccounts, 
  showStatus = false 
}: { 
  employees: Employee[]
  wechatAccounts: WechatAccount[]
  showStatus?: boolean
}) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无数据
      </div>
    )
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>工号</TableHead>
          <TableHead>姓名</TableHead>
          <TableHead>部门</TableHead>
          <TableHead>职位</TableHead>
          {showStatus && <TableHead>公众号关注状态</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map(emp => (
          <TableRow key={emp.id}>
            <TableCell className="font-medium">{emp.employeeNo}</TableCell>
            <TableCell>{emp.name}</TableCell>
            <TableCell>{emp.department}</TableCell>
            <TableCell>{emp.position || '-'}</TableCell>
            {showStatus && (
              <TableCell>
                <div className="flex gap-1">
                  {wechatAccounts.map(acc => {
                    const isFollowed = emp.followStatuses?.find(s => s.accountId === acc.id)?.isFollowed ?? false
                    return (
                      <Badge 
                        key={acc.id}
                        variant={isFollowed ? 'default' : 'secondary'}
                        className="text-xs"
                        style={isFollowed ? { backgroundColor: acc.color } : {}}
                      >
                        {acc.account_name.slice(0, 2)}
                      </Badge>
                    )
                  })}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}