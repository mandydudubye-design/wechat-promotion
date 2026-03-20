import { useState, useEffect } from 'react'
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
import { Plus, Search, Upload, Download, Eye, QrCode, ChevronDown, ChevronUp } from 'lucide-react'

interface Employee {
  employee_id: string
  name: string
  department: string
  phone: string
  wechat_name: string | null
  openid: string | null
  bind_status: number
  bind_time: string | null
  status: number
  created_at: string
  updated_at: string
}

interface WechatAccount {
  id: number
  account_name: string
  account_id: string
}

interface PromotionRecord {
  id: number
  employee_id: string
  account_id: number
  scene_str: string
  scan_count: number
  follow_count: number
  account_name?: string
}

const bindStatusOptions = [
  { value: -1, label: '全部状态' },
  { value: 1, label: '已绑定' },
  { value: 0, label: '未绑定' },
]

const departments = ['全部部门', '技术部', '市场部', '销售部', '运营部', '客服部', '人事部', '财务部']

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部部门')
  const [selectedBindStatus, setSelectedBindStatus] = useState(-1)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  
  // API数据
  const [employees, setEmployees] = useState<Employee[]>([])
  const [accounts, setAccounts] = useState<WechatAccount[]>([])
  const [promotionRecords, setPromotionRecords] = useState<PromotionRecord[]>([])
  const [loading, setLoading] = useState(true)

  // 获取API Token
  const getToken = () => {
    return localStorage.getItem('token') || ''
  }

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken()
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // 并行请求
        const [empRes, accRes, promoRes] = await Promise.all([
          fetch('/api/employees', { headers }),
          fetch('/api/accounts', { headers }),
          fetch('/api/promotion/records?pageSize=1000', { headers })
        ])

        const empData = await empRes.json()
        const accData = await accRes.json()
        const promoData = await promoRes.json()

        if (empData.success) {
          setEmployees(empData.data?.data?.list || empData.data?.list || [])
        }
        if (accData.success) {
          setAccounts(accData.data?.data || accData.data || [])
        }
        if (promoData.success) {
          setPromotionRecords(promoData.data?.data?.list || promoData.data?.list || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 计算每个员工的推广统计
  const getEmployeePromotionStats = (employeeId: string) => {
    const records = promotionRecords.filter(r => r.employee_id === employeeId)
    const totalScan = records.reduce((sum, r) => sum + (r.scan_count || 0), 0)
    const totalFollow = records.reduce((sum, r) => sum + (r.follow_count || 0), 0)
    return { totalScan, totalFollow, records }
  }

  // 获取员工在每个公众号的推广数据
  const getEmployeeAccountStats = (employeeId: string) => {
    const records = promotionRecords.filter(r => r.employee_id === employeeId)
    return accounts.map(account => {
      const record = records.find(r => r.account_id === account.id)
      return {
        account,
        scanCount: record?.scan_count || 0,
        followCount: record?.follow_count || 0
      }
    })
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.includes(searchTerm) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === '全部部门' || employee.department === selectedDepartment
    const matchesBindStatus =
      selectedBindStatus === -1 || employee.bind_status === selectedBindStatus

    return matchesSearch && matchesDepartment && matchesBindStatus
  })

  const toggleRow = (employeeId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedRows(newExpanded)
  }

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

  const stats = {
    total: employees.length,
    bound: employees.filter((e) => e.bind_status === 1).length,
    unbound: employees.filter((e) => e.bind_status === 0).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">员工管理</h1>
          <p className="text-muted-foreground">
            管理组织员工信息、绑定状态和推广情况
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
              绑定率 {stats.total > 0 ? ((stats.bound / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>未绑定员工</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.unbound}</div>
            <p className="text-xs text-muted-foreground">
              待绑定
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
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
          <CardDescription>
            共 {filteredEmployees.length} 名员工，点击展开查看各公众号推广详情
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>绑定状态</TableHead>
                  <TableHead>总扫码</TableHead>
                  <TableHead>总关注</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      没有找到符合条件的员工
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => {
                    const promoStats = getEmployeePromotionStats(employee.employee_id)
                    const isExpanded = expandedRows.has(employee.employee_id)
                    const accountStats = getEmployeeAccountStats(employee.employee_id)
                    
                    return (
                      <>
                        <TableRow key={employee.employee_id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRow(employee.employee_id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{employee.employee_id}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.phone || '-'}</TableCell>
                          <TableCell>{getBindStatusBadge(employee.bind_status)}</TableCell>
                          <TableCell className="font-medium text-blue-600">{promoStats.totalScan}</TableCell>
                          <TableCell className="font-medium text-green-600">{promoStats.totalFollow}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {employee.bind_status === 1 && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${employee.employee_id}-detail`} className="bg-muted/50">
                            <TableCell colSpan={9} className="p-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">各公众号推广详情</h4>
                                <div className="grid gap-2 md:grid-cols-3">
                                  {accountStats.map(({ account, scanCount, followCount }) => (
                                    <div key={account.id} className="bg-background rounded-lg p-3 border">
                                      <div className="font-medium text-sm mb-2">{account.account_name}</div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">扫码:</span>
                                        <span className="font-medium text-blue-600">{scanCount}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">关注:</span>
                                        <span className="font-medium text-green-600">{followCount}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">转化率:</span>
                                        <span className="font-medium">
                                          {scanCount > 0 ? ((followCount / scanCount) * 100).toFixed(1) : 0}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}