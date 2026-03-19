import { useState } from 'react'
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
import { RefreshCw, Search, Download, Bell } from 'lucide-react'
import { mockEmployees, mockFollowRecords, departments } from '../../data/mockData'
import { cn } from '../../lib/utils'

export function FollowStatusPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [syncing, setSyncing] = useState(false)

  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.includes(searchTerm) ||
      employee.employeeNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === '全部部门' || employee.department === selectedDepartment

    return matchesSearch && matchesDepartment
  })

  const boundEmployees = filteredEmployees.filter((e) => e.bindStatus === 1)
  const followingEmployees = boundEmployees.filter((e) => e.followStatus === 1)
  const followRate = boundEmployees.length > 0
    ? (followingEmployees.length / boundEmployees.length) * 100
    : 0

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
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button size="sm" onClick={() => {
            setSyncing(true)
            // Simulate API call
            setTimeout(() => setSyncing(false), 2000)
          }} disabled={syncing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
            {syncing ? '同步中...' : '同步状态'}
          </Button>
        </div>
      </div>

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
            <div className="text-2xl font-bold text-success">{followingEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>未关注员工</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
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
          <div className="space-y-4">
            {departments
              .filter((d) => d !== '全部部门')
              .map((dept) => {
                const deptEmployees = filteredEmployees.filter(
                  (e) => e.department === dept && e.bindStatus === 1
                )
                const deptFollowing = deptEmployees.filter((e) => e.followStatus === 1)
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
          {boundEmployees.filter((e) => e.followStatus === 0).length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4">
              <Bell className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-warning">有员工未关注公众号</p>
                <p className="text-sm text-muted-foreground">
                  当前有 {boundEmployees.filter((e) => e.followStatus === 0).length} 名已绑定员工尚未关注公众号
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
                  <TableHead>关注时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees
                  .filter((e) => e.bindStatus === 1)
                  .map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employeeNo}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        {employee.followStatus === 1 ? (
                          <Badge variant="success">已关注</Badge>
                        ) : (
                          <Badge variant="secondary">未关注</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.followTime || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
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
          <div className="space-y-4">
            {mockFollowRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      {record.employeeName.slice(0, 1)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{record.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{record.eventTime}</p>
                  </div>
                </div>
                <Badge variant={record.eventType === 1 ? 'success' : 'destructive'}>
                  {record.eventType === 1 ? '关注' : '取关'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
