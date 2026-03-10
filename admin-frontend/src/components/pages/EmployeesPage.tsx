import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Badge } from '../ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Plus, Search, Upload, Download, Eye, QrCode } from 'lucide-react'
import { mockEmployees, departments, bindStatusOptions, followStatusOptions } from '../../data/mockData'

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [selectedBindStatus, setSelectedBindStatus] = useState(-1)
  const [selectedFollowStatus, setSelectedFollowStatus] = useState(-1)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.includes(searchTerm) ||
      employee.employeeNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === '全部部门' || employee.department === selectedDepartment
    const matchesBindStatus =
      selectedBindStatus === -1 || employee.bindStatus === selectedBindStatus
    const matchesFollowStatus =
      selectedFollowStatus === -1 || employee.followStatus === selectedFollowStatus

    return matchesSearch && matchesDepartment && matchesBindStatus && matchesFollowStatus
  })

  const getBindStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">未绑定</Badge>
      case 1:
        return <Badge variant="success">已绑定</Badge>
      case 2:
        return <Badge variant="destructive">已禁用</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const getFollowStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge variant="success">已关注</Badge>
    ) : (
      <Badge variant="secondary">未关注</Badge>
    )
  }

  const stats = {
    total: mockEmployees.length,
    bound: mockEmployees.filter((e) => e.bindStatus === 1).length,
    following: mockEmployees.filter((e) => e.followStatus === 1).length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">员工管理</h1>
          <p className="text-muted-foreground">
            管理组织员工信息、绑定状态和关注情况
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                导入员工
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>批量导入员工</DialogTitle>
                <DialogDescription>
                  上传Excel文件批量导入员工信息。请先下载模板填写员工信息。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    下载模板
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">上传文件</Label>
                  <Input id="file" type="file" accept=".xlsx,.xls" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setImportDialogOpen(false)}>
                  确认导入
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            添加员工
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总员工数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已绑定员工</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.bound}</div>
            <p className="text-xs text-muted-foreground">
              绑定率 {((stats.bound / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已关注员工</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.following}</div>
            <p className="text-xs text-muted-foreground">
              关注率 {((stats.following / stats.bound) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>搜索</Label>
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
              <Label>部门</Label>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>绑定状态</Label>
              <Select
                value={selectedBindStatus.toString()}
                onChange={(e) => setSelectedBindStatus(Number(e.target.value))}
              >
                {bindStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>关注状态</Label>
              <Select
                value={selectedFollowStatus.toString()}
                onChange={(e) => setSelectedFollowStatus(Number(e.target.value))}
              >
                {followStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
          <CardDescription>
            共 {filteredEmployees.length} 名员工
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>职位</TableHead>
                  <TableHead>绑定状态</TableHead>
                  <TableHead>关注状态</TableHead>
                  <TableHead>推广人数</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      没有找到符合条件的员工
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employeeNo}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                      <TableCell>{getBindStatusBadge(employee.bindStatus)}</TableCell>
                      <TableCell>{getFollowStatusBadge(employee.followStatus)}</TableCell>
                      <TableCell>{employee.promotionCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {employee.bindStatus === 1 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
