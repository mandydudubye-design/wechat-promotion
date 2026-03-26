import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
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
import { RefreshCw, Search, Download, Bell, Loader2 } from 'lucide-react'
import { getEmployees, getFollowRecords, type Employee, type FollowRecord } from '../../lib/api'
import { cn } from '../../lib/utils'

export function FollowStatusPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [followRecords, setFollowRecords] = useState<FollowRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  // 获取数据
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [empResult, followResult] = await Promise.all([
        getEmployees({ pageSize: 500 }),
        getFollowRecords({ pageSize: 20 }),
      ])
      setEmployees(empResult.list)
      setFollowRecords(followResult.list)
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

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.includes(searchTerm) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === '全部部门' || employee.department === selectedDepartment

    return matchesSearch && matchesDepartment
  })

  // 只统计已绑定的员工
  const boundEmployees = filteredEmployees.filter((e) => e.bind_status === 1)
  // 已关注的员工（status 为 1 表示关注中）
  const followingEmployees = boundEmployees.filter((e) => e.status === 1)
  const followRate = boundEmployees.length > 0
    ? (followingEmployees.length / boundEmployees.length) * 100
    : 0

  // 同步状态
  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetchData()
    } finally {
      setSyncing(false)
    }
  }

  // 导出
  const handleExport = () => {
    const headers = ['工号', '姓名', '部门', '职位', '手机号', '绑定状态', '关注状态']
    const rows = boundEmployees.map(emp => [
      emp.employee_id,
      emp.name,
      emp.department || '',
      emp.position || '',
      emp.phone,
      emp.bind_status === 1 ? '已绑定' : '未绑定',
      emp.status === 1 ? '已关注' : '未关注',
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `关注状态_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">关注状态</h1>
          <p className="text-muted-foreground">
            查看和管理员工对公众号的关注状态
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
            {syncing ? '同步中...' : '同步状态'}
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
          <CardHeader className="pb-2">
            <CardDescription>已绑定员工</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boundEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已关注员工</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{followingEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>未关注员工</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {boundEmployees.length - followingEmployees.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>关注率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{followRate.toFixed(1)}%</div>
            <Progress value={followRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Department Stats */}
      <Card>
        <CardHeader>
          <CardTitle>各部门关注情况</CardTitle>
          <CardDescription>按部门统计员工关注状态</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              {departments
                .filter((d) => d !== '全部部门')
                .map((dept) => {
                  const deptEmployees = filteredEmployees.filter(
                    (e) => e.department === dept && e.bind_status === 1
                  )
                  const deptFollowing = deptEmployees.filter((e) => e.status === 1)
                  const deptRate = deptEmployees.length > 0
                    ? (deptFollowing.length / deptEmployees.length) * 100
                    : 0

                  if (deptEmployees.length === 0) return null

                  return (
                    <div key={dept} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dept}</span>
                        <span className="text-muted-foreground">
                          {deptFollowing.length}/{deptEmployees.length} ({deptRate.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={deptRate} />
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">员工列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>搜索员工</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="姓名或工号"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>部门筛选</Label>
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

          {/* Unfollowed Employees Alert */}
          {boundEmployees.filter((e) => e.status !== 1).length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-50 p-4">
              <Bell className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700">有员工未关注公众号</p>
                <p className="text-sm text-yellow-600">
                  当前有 {boundEmployees.filter((e) => e.status !== 1).length} 名已绑定员工尚未关注公众号
                </p>
              </div>
            </div>
          )}

          {/* Employee List */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>关注状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-muted-foreground">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : boundEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      暂无已绑定员工
                    </TableCell>
                  </TableRow>
                ) : (
                  boundEmployees.map((employee) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>
                        {employee.status === 1 ? (
                          <Badge variant="success">已关注</Badge>
                        ) : (
                          <Badge variant="secondary">未关注</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(employee.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Follow Records */}
      <Card>
        <CardHeader>
          <CardTitle>最近关注记录</CardTitle>
          <CardDescription>员工关注/取关的最近操作</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : followRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无关注记录
            </div>
          ) : (
            <div className="space-y-4">
              {followRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {(record.employee_name || record.employee_id || '?').slice(0, 1)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{record.employee_name || record.employee_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.subscribe_time 
                          ? new Date(record.subscribe_time).toLocaleString()
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={record.status === 1 ? 'success' : 'destructive'}>
                    {record.status === 1 ? '关注' : '取关'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}