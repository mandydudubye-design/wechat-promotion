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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Plus, Search, Upload, Download, QrCode, Loader2 } from 'lucide-react'
import { getEmployees, createEmployee, deleteEmployee, disableEmployee, enableEmployee, type Employee } from '../../lib/api'

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 添加员工表单
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    phone: '',
    department: '',
    position: '',
  })
  const [adding, setAdding] = useState(false)

  // 获取员工列表
  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getEmployees({
        keyword: searchTerm || undefined,
        department: selectedDepartment !== '全部部门' ? selectedDepartment : undefined,
        page: 1,
        pageSize: 100,
      })
      setEmployees(result.list)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取员工列表失败')
      console.error('获取员工列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [searchTerm, selectedDepartment])

  // 获取部门列表（从员工数据中提取）
  const departments = ['全部部门', ...new Set(employees.map(e => e.department).filter(Boolean) as string[])]

  // 添加员工
  const handleAddEmployee = async () => {
    if (!newEmployee.employee_id || !newEmployee.name || !newEmployee.phone) {
      alert('请填写必填项：工号、姓名、手机号')
      return
    }

    setAdding(true)
    try {
      await createEmployee({
        employee_id: newEmployee.employee_id,
        name: newEmployee.name,
        phone: newEmployee.phone,
        department: newEmployee.department || undefined,
        position: newEmployee.position || undefined,
      })
      setAddDialogOpen(false)
      setNewEmployee({ employee_id: '', name: '', phone: '', department: '', position: '' })
      fetchEmployees()
      alert('添加成功！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '添加失败')
    } finally {
      setAdding(false)
    }
  }

  // 删除员工
  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('确定要删除该员工吗？')) return
    try {
      await deleteEmployee(employeeId)
      fetchEmployees()
      alert('删除成功！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  // 禁用/启用员工
  const handleToggleStatus = async (employee: Employee) => {
    try {
      if (employee.bind_status === 2) {
        await enableEmployee(employee.employee_id)
      } else {
        await disableEmployee(employee.employee_id)
      }
      fetchEmployees()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    }
  }

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const template = [
      ['工号', '姓名', '部门', '职位', '手机号'],
      ['EMP001', '张三', '技术部', '工程师', '13800138000'],
      ['EMP002', '李四', '市场部', '经理', '13800138001'],
    ]
    const csvContent = template.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', '员工导入模板.csv')
    link.click()
  }

  // 导出员工
  const handleExportEmployees = () => {
    const headers = ['工号', '姓名', '部门', '职位', '手机号', '绑定状态', '创建时间']
    const rows = employees.map(emp => [
      emp.employee_id,
      emp.name,
      emp.department || '',
      emp.position || '',
      emp.phone,
      emp.bind_status === 1 ? '已绑定' : emp.bind_status === 2 ? '已禁用' : '未绑定',
      emp.created_at,
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `员工列表_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

  // 绑定状态徽章
  const getBindStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="success">已绑定</Badge>
      case 2:
        return <Badge variant="destructive">已禁用</Badge>
      default:
        return <Badge variant="secondary">未绑定</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">员工管理</h1>
          <p className="text-muted-foreground">
            管理员工信息，共 {total} 名员工
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
                <Button onClick={() => setImportDialogOpen(false)}>关闭</Button>
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
                  添加新的员工信息
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employeeId">工号 *</Label>
                  <Input
                    id="employeeId"
                    placeholder="请输入工号"
                    value={newEmployee.employee_id}
                    onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    placeholder="请输入姓名"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">手机号 *</Label>
                  <Input
                    id="phone"
                    placeholder="请输入手机号"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="department">部门</Label>
                  <Input
                    id="department"
                    placeholder="请输入部门"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="position">职位</Label>
                  <Input
                    id="position"
                    placeholder="请输入职位"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>取消</Button>
                <Button onClick={handleAddEmployee} disabled={adding}>
                  {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  添加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
          <CardDescription>
            {loading ? '加载中...' : `共 ${total} 名员工`}
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>职位</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>绑定状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-muted-foreground">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      暂无员工数据
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell>{employee.employee_id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{getBindStatusBadge(employee.bind_status)}</TableCell>
                      <TableCell>
                        {new Date(employee.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(employee)}
                          >
                            {employee.bind_status === 2 ? '启用' : '禁用'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => handleDeleteEmployee(employee.employee_id)}
                          >
                            删除
                          </Button>
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