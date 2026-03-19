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
import { mockEmployees, departments } from '../../data/mockData'

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [viewQrCodeDialogOpen, setViewQrCodeDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<typeof mockEmployees[0] | null>(null)

  // 获取所有公众号ID（用于多公众号关注状态）
  const accountIds = ['acc001', 'acc002', 'acc003'] // 从mockAccounts获取

  const filteredEmployees = mockEmployees.filter((employee) => {
    // 只显示已绑定的员工（bindStatus === 1）
    if (employee.bindStatus !== 1) return false

    const matchesSearch =
      employee.name.includes(searchTerm) ||
      employee.employeeNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === '全部部门' || employee.department === selectedDepartment

    return matchesSearch && matchesDepartment
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // 导出员工数据为CSV
              const csvContent = [
                ['员工编号', '姓名', '部门', '职位', '手机号', '邮箱', '绑定状态', '关注状态'].join(','),
                ...mockEmployees.map(emp => [
                  emp.employeeNo,
                  emp.name,
                  emp.department,
                  emp.position || '',
                  emp.phone || '',
                  emp.email || '',
                  emp.bindStatus === 1 ? '已绑定' : '未绑定',
                  emp.followStatus === 1 ? '已关注' : '未关注'
                ].join(','))
              ].join('\n')

              const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
              const link = document.createElement('a')
              link.href = URL.createObjectURL(blob)
              link.download = `员工数据_${new Date().toLocaleDateString()}.csv`
              link.click()
            }}
          >
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
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // 下载CSV模板
                      const template = [
                        ['员工编号', '姓名', '部门', '职位', '手机号', '邮箱'].join(','),
                        ['EMP001', '张三', '技术部', '工程师', '13800138000', 'zhangsan@example.com'].join(','),
                        ['EMP002', '李四', '市场部', '经理', '13900139000', 'lisi@example.com'].join(',')
                      ].join('\n')

                      const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
                      const link = document.createElement('a')
                      link.href = URL.createObjectURL(blob)
                      link.download = '员工导入模板.csv'
                      link.click()
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载模板
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">上传文件</Label>
                  <Input id="file" type="file" accept=".xlsx,.xls,.csv" />
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
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
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
                  <TableHead>公众号关注状态</TableHead>
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
                      <TableCell>
                        <div className="space-y-1">
                          {accountIds.map(accountId => {
                            const followData = employee.followStatuses?.find(
                              f => f.accountId === accountId
                            )
                            return (
                              <div key={accountId} className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground">
                                  {followData?.accountName || accountId}:
                                </span>
                                {followData?.isFollowed ? (
                                  <Badge variant="success" className="text-xs">
                                    ✓ 已关注
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    未关注
                                  </Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>{employee.promotionCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {employee.bindStatus === 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedEmployee(employee)
                                setViewQrCodeDialogOpen(true)
                              }}
                            >
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

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加员工</DialogTitle>
            <DialogDescription>
              填写员工基本信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emp-no">工号</Label>
              <Input id="emp-no" placeholder="例如: EMP001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" placeholder="员工姓名" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">部门</Label>
              <Input id="department" placeholder="部门名称" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">职位</Label>
              <Input id="position" placeholder="职位" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input id="phone" placeholder="手机号" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" placeholder="邮箱地址" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setAddDialogOpen(false)}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View QR Code Dialog */}
      <Dialog open={viewQrCodeDialogOpen} onOpenChange={setViewQrCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>员工绑定二维码</DialogTitle>
            <DialogDescription>
              {selectedEmployee?.name}（{selectedEmployee?.employeeNo}）
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {selectedEmployee?.qrCodeUrl ? (
              <img
                src={selectedEmployee.qrCodeUrl}
                alt="绑定二维码"
                className="w-64 h-64 border rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">二维码未生成</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              请使用微信扫描二维码绑定账号
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
