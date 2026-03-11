import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Plus, Search, Upload, Download, QrCode, ChevronDown, ChevronUp, Wechat } from 'lucide-react'
import { mockEmployees, departments } from '../../data/mockData'
import type { Employee, AccountFollowStatus } from '../../types'

// 公众号列表配置（后续可从后端API获取）
const wechatAccounts = [
  { id: 'acc001', name: '主公众号' },
  { id: 'acc002', name: '推广号1' },
  { id: 'acc003', name: '推广号2' },
]

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [viewQrCodeDialogOpen, setViewQrCodeDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())

  // 切换员工公众号详情展开/收起
  const toggleEmployeeExpand = (employeeId: string) => {
    setExpandedEmployees(prev => {
      const newSet = new Set(prev)
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId)
      } else {
        newSet.add(employeeId)
      }
      return newSet
    })
  }

  // 获取员工关注公众号数量
  const getFollowedCount = (employee: Employee): number => {
    if (employee.followStatuses && employee.followStatuses.length > 0) {
      return employee.followStatuses.filter(s => s.isFollowed).length
    }
    // 兼容旧数据
    return employee.followStatus === 1 ? 1 : 0
  }

  // 获取总公众号数量
  const totalAccounts = wechatAccounts.length

  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch = employee.name.includes(searchTerm) || employee.employeeNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === '全部部门' || employee.department === selectedDepartment
    // 只显示已绑定的员工
    const matchesBindStatus = employee.bindStatus === 1
    return matchesSearch && matchesDepartment && matchesBindStatus
  })

  // 获取某个公众号的关注状态
  const getFollowStatusForAccount = (employee: Employee, accountId: string): { status: string, followTime?: string } => {
    if (employee.followStatuses && employee.followStatuses.length > 0) {
      const status = employee.followStatuses.find(s => s.accountId === accountId)
      return {
        status: status?.isFollowed ? '已关注' : '未关注',
        followTime: status?.followTime
      }
    }
    // 兼容旧数据：假设第一个公众号使用旧的 followStatus 字段
    if (accountId === 'acc001' && employee.followStatus === 1) {
      return { status: '已关注', followTime: employee.followTime }
    }
    return { status: '未关注' }
  }

  const handleAddEmployee = () => {
    // TODO: 实现添加员工逻辑
    console.log('添加员工')
    setAddDialogOpen(false)
  }

  const handleImportEmployees = () => {
    // TODO: 实现导入员工逻辑
    console.log('导入员工')
    setImportDialogOpen(false)
  }

  const handleDownloadTemplate = () => {
    const template = [
      ['工号', '姓名', '部门', '职位', '手机号', '邮箱'],
      ['EMP001', '张三', '技术部', '工程师', '13800138000', 'zhangsan@example.com'],
      ['EMP002', '李四', '市场部', '经理', '13800138001', 'lisi@example.com'],
    ]
    const csvContent = template.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', '员工导入模板.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportEmployees = () => {
    const headers = ['工号', '姓名', '部门', '职位', '手机号', '邮箱', '绑定时间', '推广人数', '公众号关注数']
    const rows = filteredEmployees.map(emp => [
      emp.employeeNo,
      emp.name,
      emp.department,
      emp.position || '',
      emp.phone || '',
      emp.email || '',
      emp.bindTime || '',
      emp.promotionCount.toString(),
      `${getFollowedCount(emp)}/${totalAccounts}`,
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `员工列表_${new Date().toLocaleDateString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewQrCode = (employee: Employee) => {
    setSelectedEmployee(employee)
    setViewQrCodeDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">员工管理</h1>
          <p className="text-muted-foreground">
            管理已绑定微信的员工信息
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                导入员工
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>导入员工</DialogTitle>
                <DialogDescription>
                  上传CSV文件批量导入员工信息
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleDownloadTemplate} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    下载模板
                  </Button>
                </div>
                <div>
                  <Label htmlFor="file">选择文件</Label>
                  <Input id="file" type="file" accept=".csv,.xlsx" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleImportEmployees}>导入</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleExportEmployees} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出员工
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                添加员工
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加员工</DialogTitle>
                <DialogDescription>
                  添加新的员工并生成绑定二维码
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employeeNo">工号</Label>
                  <Input id="employeeNo" placeholder="请输入工号" />
                </div>
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input id="name" placeholder="请输入姓名" />
                </div>
                <div>
                  <Label htmlFor="department">部门</Label>
                  <Input id="department" placeholder="请输入部门" />
                </div>
                <div>
                  <Label htmlFor="position">职位</Label>
                  <Input id="position" placeholder="请输入职位" />
                </div>
                <div>
                  <Label htmlFor="phone">手机号</Label>
                  <Input id="phone" placeholder="请输入手机号" />
                </div>
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" placeholder="请输入邮箱" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEmployee}>添加</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 员工列表卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
          <CardDescription>
            共 {filteredEmployees.length} 名已绑定员工
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名或工号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 员工表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>职位</TableHead>
                  <TableHead className="text-center">公众号关注数</TableHead>
                  <TableHead>推广人数</TableHead>
                  <TableHead>绑定时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const followedCount = getFollowedCount(employee)
                  const isExpanded = expandedEmployees.has(employee.id)
                  
                  return (
                    <>
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.employeeNo}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.position || '-'}</TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => toggleEmployeeExpand(employee.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{
                              backgroundColor: followedCount === totalAccounts ? '#dcfce7' : followedCount > 0 ? '#fef9c3' : '#f3f4f6',
                              color: followedCount === totalAccounts ? '#166534' : followedCount > 0 ? '#854d0e' : '#6b7280',
                            }}
                          >
                            <span>{followedCount}/{totalAccounts}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>{employee.promotionCount}</TableCell>
                        <TableCell>
                          {employee.bindTime ? new Date(employee.bindTime).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewQrCode(employee)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* 展开的公众号详情行 */}
                      {isExpanded && (
                        <TableRow key={`${employee.id}-details`} className="bg-muted/30">
                          <TableCell colSpan={8} className="p-0">
                            <div className="p-4 pl-8">
                              <div className="text-sm font-medium text-muted-foreground mb-3">
                                公众号关注详情
                              </div>
                              <div className="grid gap-2">
                                {wechatAccounts.map(account => {
                                  const { status, followTime } = getFollowStatusForAccount(employee, account.id)
                                  
                                  return (
                                    <div
                                      key={account.id}
                                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                          <Wechat className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                          <div className="font-medium">{account.name}</div>
                                          {followTime && (
                                            <div className="text-xs text-muted-foreground">
                                              关注时间：{new Date(followTime).toLocaleString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Badge variant={status === '已关注' ? 'default' : 'secondary'}>
                                        {status === '已关注' ? '✓ 已关注' : '未关注'}
                                      </Badge>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 查看二维码对话框 */}
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