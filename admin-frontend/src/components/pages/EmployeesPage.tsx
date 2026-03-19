import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Select } from '../ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Plus, Upload, Download, Edit, Trash2, QrCode, Smartphone, Users, UserCheck, UserX, Filter, X, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { mockOfficialAccounts } from '../../data/mockData'

// API基础地址
const API_BASE = 'http://localhost:3000/api'

interface Employee {
  id: string
  employeeNo: string
  name: string
  department: string
  phone: string
  bindStatus: 0 | 1
  bindTime?: string
  followedAccounts?: string[]
}

// 统一从 mockOfficialAccounts 获取公众号名称列表
const allAccounts = mockOfficialAccounts.map(acc => acc.name)

// Mock数据 - 员工列表 - 使用统一的公众号名称
const mockEmployees: Employee[] = [
  { id: '1', employeeNo: 'EMP001', name: '张三', department: '技术部', phone: '13800138001', bindStatus: 1, bindTime: '2024-01-15 10:30', followedAccounts: ['企业官方号', '产品服务号', '招聘订阅号'] },
  { id: '2', employeeNo: 'EMP002', name: '李四', department: '市场部', phone: '13800138002', bindStatus: 1, bindTime: '2024-01-16 14:20', followedAccounts: ['企业官方号'] },
  { id: '3', employeeNo: 'EMP003', name: '王五', department: '技术部', phone: '13800138003', bindStatus: 0, followedAccounts: [] },
  { id: '4', employeeNo: 'EMP004', name: '赵六', department: '财务部', phone: '13800138004', bindStatus: 1, bindTime: '2024-01-17 09:15', followedAccounts: ['企业官方号', '产品服务号'] },
  { id: '5', employeeNo: 'EMP005', name: '钱七', department: '人事部', phone: '13800138005', bindStatus: 0, followedAccounts: ['招聘订阅号'] },
  { id: '6', employeeNo: 'EMP006', name: '孙八', department: '市场部', phone: '13800138006', bindStatus: 1, bindTime: '2024-01-18 16:45', followedAccounts: [] },
  { id: '7', employeeNo: 'EMP007', name: '周九', department: '技术部', phone: '13800138007', bindStatus: 1, bindTime: '2024-01-19 11:00', followedAccounts: ['企业官方号', '产品服务号', '招聘订阅号'] },
  { id: '8', employeeNo: 'EMP008', name: '吴十', department: '财务部', phone: '13800138008', bindStatus: 0, followedAccounts: [] },
]

// 关注状态浮层组件
const FollowedAccountsPopover = ({ accounts }: { accounts: string[] }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!accounts || accounts.length === 0) {
    return <span className="text-gray-400 text-sm">未关注</span>
  }
  
  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Badge variant="outline" className="bg-blue-50">
          {accounts.length} 个公众号
        </Badge>
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 p-3 bg-white border rounded-lg shadow-lg min-w-[200px]">
          <div className="text-xs font-medium text-gray-500 mb-2">已关注公众号：</div>
          <div className="space-y-1">
            {accounts.map((account, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {account}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>(mockEmployees)
  const [searchTerm, setSearchTerm] = useState('')
  const [bindStatusFilter, setBindStatusFilter] = useState<'all' | 'bound' | 'unbound'>('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<any>(null)
  const [qrMode, setQrMode] = useState<'universal' | 'personal'>('universal')
  const [qrEmployee, setQrEmployee] = useState<Employee | null>(null)
  
  // 新增/编辑表单
  const [formData, setFormData] = useState({
    employeeNo: '',
    name: '',
    department: '',
    phone: ''
  })
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  
  // 导入数据
  const [importData, setImportData] = useState<Employee[]>([])
  const [importStep, setImportStep] = useState<'preview' | 'result'>('preview')

  // 获取所有部门
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department))
    return Array.from(depts)
  }, [employees])

  // 过滤员工列表
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.includes(searchTerm) || 
                          emp.employeeNo.includes(searchTerm) ||
                          emp.phone.includes(searchTerm)
      const matchBindStatus = bindStatusFilter === 'all' || 
                              (bindStatusFilter === 'bound' && emp.bindStatus === 1) ||
                              (bindStatusFilter === 'unbound' && emp.bindStatus === 0)
      const matchDepartment = departmentFilter === 'all' || emp.department === departmentFilter
      return matchSearch && matchBindStatus && matchDepartment
    })
  }, [employees, searchTerm, bindStatusFilter, departmentFilter])

  // 统计数据 - 新增关注公众号统计
  const stats = useMemo(() => {
    const total = employees.length
    const bound = employees.filter(e => e.bindStatus === 1).length
    const unbound = total - bound
    
    // 关注全部公众号的员工数
    const followedAll = employees.filter(e => 
      e.followedAccounts && e.followedAccounts.length === allAccounts.length
    ).length
    
    // 关注部分公众号的员工数（1到allAccounts.length-1个）
    const followedPartial = employees.filter(e => 
      e.followedAccounts && e.followedAccounts.length > 0 && e.followedAccounts.length < allAccounts.length
    ).length
    
    // 0关注员工数
    const followedNone = employees.filter(e => 
      !e.followedAccounts || e.followedAccounts.length === 0
    ).length
    
    return { total, bound, unbound, followedAll, followedPartial, followedNone }
  }, [employees])

  // 重置表单
  const resetForm = () => {
    setFormData({ employeeNo: '', name: '', department: '', phone: '' })
  }

  // 新增员工
  const handleAdd = () => {
    resetForm()
    setAddDialogOpen(true)
  }

  const handleAddSubmit = () => {
    // TODO: 调用API新增员工
    console.log('新增员工:', formData)
    setAddDialogOpen(false)
    resetForm()
    alert('新增成功！（模拟）')
  }

  // 编辑员工
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      employeeNo: employee.employeeNo,
      name: employee.name,
      department: employee.department,
      phone: employee.phone
    })
    setEditDialogOpen(true)
  }

  const handleEditSubmit = () => {
    // TODO: 调用API编辑员工
    console.log('编辑员工:', editingEmployee?.id, formData)
    setEditDialogOpen(false)
    setEditingEmployee(null)
    resetForm()
    alert('编辑成功！（模拟）')
  }

  // 删除员工
  const handleDelete = (employee: Employee) => {
    if (confirm(`确定要删除员工 "${employee.name}" 吗？`)) {
      // TODO: 调用API删除员工
      console.log('删除员工:', employee.id)
      alert('删除成功！（模拟）')
    }
  }

  // 导出员工 - 修复
  const handleExport = () => {
    const exportData = filteredEmployees.map(emp => ({
      '员工工号': emp.employeeNo,
      '姓名': emp.name,
      '部门': emp.department,
      '手机号': emp.phone,
      '绑定状态': emp.bindStatus === 1 ? '已绑定' : '未绑定',
      '绑定时间': emp.bindTime || '',
      '关注公众号数量': emp.followedAccounts?.length || 0,
      '关注公众号': emp.followedAccounts?.join('、') || ''
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '员工列表')
    
    // 生成文件并下载
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `员工列表_${new Date().toLocaleDateString()}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 导入员工 - 修复
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        const parsedData: Employee[] = (jsonData as any[]).map((row: any, index: number) => ({
          id: `import_${index}`,
          employeeNo: row['员工工号'] || row['工号'] || '',
          name: row['姓名'] || row['名字'] || '',
          department: row['部门'] || '',
          phone: String(row['手机号'] || row['电话'] || ''),
          bindStatus: 0,
          followedAccounts: []
        }))
        
        setImportData(parsedData)
        setImportStep('preview')
        setImportDialogOpen(true)
      } catch (error) {
        console.error('解析文件失败:', error)
        alert('解析文件失败，请确保是有效的Excel文件')
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = '' // 重置input
  }

  // 下载导入模板 - 修复
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '员工工号': 'EMP001',
        '姓名': '张三',
        '部门': '技术部',
        '手机号': '13800138000'
      },
      {
        '员工工号': 'EMP002',
        '姓名': '李四',
        '部门': '市场部',
        '手机号': '13900139000'
      }
    ]
    
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '员工导入模板')
    
    // 设置列宽
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 }
    ]
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '员工导入模板.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  }

  // 确认导入
  const handleImportConfirm = () => {
    // TODO: 调用API批量导入
    console.log('导入数据:', importData)
    setImportStep('result')
    alert(`成功导入 ${importData.length} 条数据！（模拟）`)
    setImportDialogOpen(false)
    setImportData([])
    setImportStep('preview')
  }

  // 生成专属二维码
  const handleGenerateQr = async (employee: Employee) => {
    setQrEmployee(employee)
    setQrMode('personal')
    setQrLoading(true)
    setQrDialogOpen(true)
    setQrCodeData(null)
    
    try {
      const response = await fetch(`${API_BASE}/employee-binding/qrcode/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'personal',
          employeeId: employee.id,
          employeeName: employee.name
        })
      })
      
      const result = await response.json()
      
      if (result.code === 200) {
        setQrCodeData(result.data)
      } else {
        alert(result.message || '生成二维码失败')
        setQrDialogOpen(false)
      }
    } catch (error) {
      console.error('生成二维码失败:', error)
      alert('生成二维码失败，请检查后端服务是否启动')
      setQrDialogOpen(false)
    } finally {
      setQrLoading(false)
    }
  }

  // 打开通用绑定码
  const handleOpenUniversalQr = async () => {
    setQrEmployee(null)
    setQrMode('universal')
    setQrLoading(true)
    setQrDialogOpen(true)
    setQrCodeData(null)
    
    try {
      const response = await fetch(`${API_BASE}/employee-binding/qrcode/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'universal'
        })
      })
      
      const result = await response.json()
      
      if (result.code === 200) {
        setQrCodeData(result.data)
      } else {
        alert(result.message || '生成二维码失败')
        setQrDialogOpen(false)
      }
    } catch (error) {
      console.error('生成二维码失败:', error)
      alert('生成二维码失败，请检查后端服务是否启动')
      setQrDialogOpen(false)
    } finally {
      setQrLoading(false)
    }
  }

  // 格式化过期时间
  const formatExpireTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* 数据概览 - 新增统计项 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">员工总数</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">已绑定</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.bound}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              <span className="text-sm text-muted-foreground">未绑定</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.unbound}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">全部</Badge>
              <span className="text-sm text-muted-foreground">关注全部</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-600">{stats.followedAll}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">部分</Badge>
              <span className="text-sm text-muted-foreground">关注部分</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.followedPartial}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-50 text-gray-700">0</Badge>
              <span className="text-sm text-muted-foreground">0关注</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-gray-600">{stats.followedNone}</p>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">筛选：</span>
            </div>
            
            {/* 搜索框 */}
            <Input
              placeholder="搜索姓名/工号/手机号"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
            
            {/* 绑定状态筛选 */}
            <Select
              value={bindStatusFilter}
              onChange={(e) => setBindStatusFilter(e.target.value as 'all' | 'bound' | 'unbound')}
              className="w-32"
            >
              <option value="all">全部状态</option>
              <option value="bound">已绑定</option>
              <option value="unbound">未绑定</option>
            </Select>
            
            {/* 部门筛选 */}
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-32"
            >
              <option value="all">全部部门</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            
            <div className="flex-1" />
            
            {/* 操作按钮 */}
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              新增员工
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                导入员工
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              下载模板
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              导出员工
            </Button>
            
            <Button variant="default" size="sm" onClick={handleOpenUniversalQr}>
              <QrCode className="h-4 w-4 mr-1" />
              通用绑定码
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 员工列表 */}
      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
          <CardDescription>
            共 {filteredEmployees.length} 名员工
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工号</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>绑定状态</TableHead>
                <TableHead>关注公众号</TableHead>
                <TableHead>绑定时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employeeNo}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>
                    {employee.bindStatus === 1 ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        已绑定
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        未绑定
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <FollowedAccountsPopover accounts={employee.followedAccounts || []} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {employee.bindTime || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {employee.bindStatus === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateQr(employee)}
                          title="生成绑定码"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee)}
                        title="删除"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 新增员工对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新增员工</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employeeNo" className="text-right">工号</Label>
              <Input
                id="employeeNo"
                value={formData.employeeNo}
                onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })}
                className="col-span-3"
                placeholder="请输入员工工号"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">姓名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="请输入员工姓名"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">部门</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="col-span-3"
                placeholder="请输入所属部门"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">手机号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
                placeholder="请输入手机号"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddSubmit}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑员工对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑员工</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-employeeNo" className="text-right">工号</Label>
              <Input
                id="edit-employeeNo"
                value={formData.employeeNo}
                onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">姓名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-department" className="text-right">部门</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">手机号</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleEditSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入预览对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>导入员工</DialogTitle>
          </DialogHeader>
          
          {/* 下载模板按钮 */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-700">请使用标准模板格式导入</span>
            <Button
              variant="link"
              size="sm"
              onClick={handleDownloadTemplate}
              className="ml-auto text-blue-600"
            >
              下载模板
            </Button>
          </div>
          
          {importStep === 'preview' && (
            <>
              <DialogDescription>
                共解析到 {importData.length} 条数据，请确认后导入
              </DialogDescription>
              <div className="max-h-[300px] overflow-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>工号</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>手机号</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.slice(0, 10).map((emp, index) => (
                      <TableRow key={index}>
                        <TableCell>{emp.employeeNo}</TableCell>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>{emp.phone}</TableCell>
                      </TableRow>
                    ))}
                    {importData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          还有 {importData.length - 10} 条数据...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>取消</Button>
                <Button onClick={handleImportConfirm}>确认导入</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 二维码对话框 */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {qrMode === 'universal' ? '通用绑定码' : `${qrEmployee?.name} 的专属绑定码`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrLoading ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-muted-foreground">生成中...</p>
              </div>
            ) : qrCodeData ? (
              <>
                {/* 显示二维码图片 */}
                <img 
                  src={qrCodeData.qrCodeUrl} 
                  alt="绑定二维码" 
                  className="w-[200px] h-[200px] rounded-lg border"
                />
                {qrCodeData.employee && (
                  <div className="mt-4 text-center">
                    <p className="font-medium">{qrCodeData.employee.name}</p>
                    <p className="text-sm text-muted-foreground">{qrCodeData.employee.department}</p>
                  </div>
                )}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>有效期至：{formatExpireTime(qrCodeData.expiresAt)}</p>
                  <p className="mt-1">
                    {qrMode === 'universal' ? '员工扫码后自助填写信息完成绑定' : '员工扫码后自动绑定'}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-muted-foreground">生成失败</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogOpen(false)}>
              关闭
            </Button>
            {qrCodeData && (
              <Button 
                onClick={() => {
                  // 下载二维码图片
                  const link = document.createElement('a')
                  link.href = qrCodeData.qrCodeUrl
                  link.download = `绑定码_${qrEmployee?.name || '通用'}.png`
                  link.click()
                }}
              >
                下载二维码
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}