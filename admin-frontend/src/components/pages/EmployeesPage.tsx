import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Plus, Search, Upload, Download, QrCode, ChevronDown, ChevronUp, MessageCircle, UserCheck, UserX, Share2, Users, Link2 } from 'lucide-react'
import type { Employee } from '../../types'

const API_BASE = 'http://localhost:3001/api'

// 公众号类型
interface WechatAccount {
  id: number
  account_name: string
  account_id: string
  color: string
}

// 推广记录类型
interface PromotionRecord {
  id: number
  employee_id: string
  account_id: number
  scene_str: string
  scan_count: number
  follow_count: number
}

// 公众号颜色
const ACCOUNT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('全部')
  const [selectedBindStatus, setSelectedBindStatus] = useState<'all' | 'bound' | 'unbound'>('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())
  const [universalBindDialogOpen, setUniversalBindDialogOpen] = useState(false)
  
  // 真实数据状态
  const [wechatAccounts, setWechatAccounts] = useState<WechatAccount[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [promotionRecords, setPromotionRecords] = useState<PromotionRecord[]>([])
  const [departments, setDepartments] = useState<string[]>(['全部'])
  const [loading, setLoading] = useState(true)

  // 从API获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }
        
        // 获取公众号
        const accountsRes = await fetch(`${API_BASE}/accounts`, { headers })
        const accountsResult = await accountsRes.json()
        const accounts = (accountsResult.data || []).map((acc: any, index: number) => ({
          id: acc.id,
          account_name: acc.account_name,
          account_id: acc.account_id,
          color: ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]
        }))
        setWechatAccounts(accounts)
        
        // 获取员工
        const employeesRes = await fetch(`${API_BASE}/employees`, { headers })
        const employeesResult = await employeesRes.json()
        const employeesData = (employeesResult.data?.list || employeesResult.data || []).map((emp: any) => ({
          id: emp.employee_id,
          employeeNo: emp.employee_id,
          name: emp.name,
          department: emp.department || '未分配',
          phone: emp.phone || '',
          bindStatus: emp.bind_status || 0,
          bindTime: emp.bind_time,
          wechatName: emp.wechat_name,
          openid: emp.openid,
          followStatuses: []
        }))
        setEmployees(employeesData)
        
        // 提取部门列表
        const deptSet = new Set(['全部'])
        employeesData.forEach((emp: Employee) => {
          if (emp.department) deptSet.add(emp.department)
        })
        setDepartments(Array.from(deptSet))
        
        // 获取推广记录
        const promoRes = await fetch(`${API_BASE}/promotion/records?pageSize=1000`, { headers })
        const promoResult = await promoRes.json()
        setPromotionRecords(promoResult.data?.list || [])
        
        setLoading(false)
      } catch (error) {
        console.error('获取数据失败', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 切换员工详情展开/收起
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

  // 获取员工总推广数据
  const getTotalPromotion = (employeeId: string) => {
    const records = promotionRecords.filter(r => r.employee_id === employeeId)
    let scanCount = 0, followCount = 0
    records.forEach(r => {
      scanCount += r.scan_count || 0
      followCount += r.follow_count || 0
    })
    return { scanCount, followCount }
  }

  // 获取员工某公众号的推广数据
  const getPromotionForAccount = (employeeId: string, accountId: number) => {
    const record = promotionRecords.find(r => r.employee_id === employeeId && r.account_id === accountId)
    return {
      scanCount: record?.scan_count || 0,
      followCount: record?.follow_count || 0
    }
  }

  const totalAccounts = wechatAccounts.length

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.includes(searchTerm) || employee.employeeNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === '全部' || employee.department === selectedDepartment
    const matchesBindStatus = selectedBindStatus === 'all' || 
      (selectedBindStatus === 'bound' && employee.bindStatus === 1) ||
      (selectedBindStatus === 'unbound' && employee.bindStatus !== 1)
    return matchesSearch && matchesDepartment && matchesBindStatus
  })

  // 统计数据
  const totalEmployees = employees.length
  const boundEmployees = employees.filter(e => e.bindStatus === 1).length
  const unboundEmployees = totalEmployees - boundEmployees

  const handleAddEmployee = () => {
    setAddDialogOpen(false)
  }

  const handleImportEmployees = () => {
    setImportDialogOpen(false)
  }

  const handleDownloadTemplate = () => {
    const template = [
      ['工号', '姓名', '部门', '手机号'],
      ['EMP001', '张三', '技术部', '13800138000'],
      ['EMP002', '李四', '市场部', '13800138001'],
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

  const handleViewDetail = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDetailDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">员工管理</h1>
          <p className="text-muted-foreground">
            管理员工信息、绑定状态和推广数据
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={universalBindDialogOpen} onOpenChange={setUniversalBindDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Link2 className="mr-2 h-4 w-4" />
                通用绑定码
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>通用绑定码</DialogTitle>
                <DialogDescription>
                  员工扫码后自助填写信息并完成绑定
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-6">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  员工使用微信扫描此二维码<br/>
                  即可自助绑定并填写个人信息
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">员工扫码后需填写：</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• 工号</li>
                  <li>• 姓名</li>
                  <li>• 部门</li>
                  <li>• 手机号</li>
                </ul>
              </div>
              <DialogFooter>
                <Button variant="outline">下载二维码</Button>
                <Button>复制链接</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                导入
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
                <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  下载模板
                </Button>
                <div>
                  <Label htmlFor="file">选择文件</Label>
                  <Input id="file" type="file" accept=".csv,.xlsx" />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <p>模板字段：工号、姓名、部门、手机号</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleImportEmployees}>导入</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  添加员工后可生成专属绑定二维码
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeNo">工号 *</Label>
                    <Input id="employeeNo" placeholder="EMP001" />
                  </div>
                  <div>
                    <Label htmlFor="name">姓名 *</Label>
                    <Input id="name" placeholder="张三" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">部门 *</Label>
                    <Input id="department" placeholder="技术部" />
                  </div>
                  <div>
                    <Label htmlFor="phone">手机号</Label>
                    <Input id="phone" placeholder="13800138000" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEmployee}>添加</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总员工数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已绑定</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{boundEmployees}</div>
            <p className="text-xs text-muted-foreground">
              绑定率 {totalEmployees > 0 ? ((boundEmployees / totalEmployees) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未绑定</CardTitle>
            <UserX className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{unboundEmployees}</div>
            <p className="text-xs text-muted-foreground">
              待绑定
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 员工列表 */}
      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
          <CardDescription>
            点击展开查看每个公众号的关注和推广详情
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 筛选 */}
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
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={selectedBindStatus}
              onChange={(e) => setSelectedBindStatus(e.target.value as 'all' | 'bound' | 'unbound')}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">全部状态</option>
              <option value="bound">已绑定</option>
              <option value="unbound">未绑定</option>
            </select>
          </div>

          {/* 表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead className="text-center">绑定状态</TableHead>
                  <TableHead className="text-center">推广数据</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      暂无员工数据，请先添加员工
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => {
                    const isExpanded = expandedEmployees.has(employee.id)
                    const promotion = getTotalPromotion(employee.id)
                    
                    return (
                      <>
                        <TableRow key={employee.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{employee.employeeNo}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={employee.bindStatus === 1 ? 'success' : 'secondary'}>
                              {employee.bindStatus === 1 ? '已绑定' : '未绑定'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => toggleEmployeeExpand(employee.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors hover:opacity-80 bg-muted"
                            >
                              <span className="text-success font-bold">+{promotion.followCount}</span>
                              <span className="text-muted-foreground">关注</span>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetail(employee)}
                              >
                                详情
                              </Button>
                              {employee.bindStatus !== 1 && (
                                <Button size="sm" variant="outline">
                                  <QrCode className="h-4 w-4 mr-1" />
                                  绑定码
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* 展开的详情行 */}
                        {isExpanded && (
                          <TableRow key={`${employee.id}-details`} className="bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4">
                                <div className="text-sm font-medium text-muted-foreground mb-3">
                                  每个公众号的推广详情
                                </div>
                                <div className="grid gap-3">
                                  {wechatAccounts.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-4">
                                      暂无公众号数据
                                    </div>
                                  ) : (
                                    wechatAccounts.map(account => {
                                      const promo = getPromotionForAccount(employee.id, account.id)
                                      
                                      return (
                                        <div
                                          key={account.id}
                                          className="flex items-center justify-between py-3 px-4 rounded-lg bg-background border"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div 
                                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                                              style={{ backgroundColor: account.color }}
                                            >
                                              <MessageCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="font-medium">{account.account_name}</div>
                                          </div>
                                          <div className="flex items-center gap-6">
                                            <div className="text-center">
                                              <div className="text-lg font-bold">{promo.scanCount}</div>
                                              <div className="text-xs text-muted-foreground">扫码</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-lg font-bold text-success">+{promo.followCount}</div>
                                              <div className="text-xs text-muted-foreground">关注</div>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                            >
                                              <Share2 className="h-4 w-4 mr-1" />
                                              推广码
                                            </Button>
                                          </div>
                                        </div>
                                      )
                                    })
                                  )}
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

      {/* 员工详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>员工详情</DialogTitle>
            <DialogDescription>
              {selectedEmployee?.name}（{selectedEmployee?.employeeNo}）- {selectedEmployee?.department}
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="follow">关注状态</TabsTrigger>
                <TabsTrigger value="promotion">推广数据</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <Label className="text-muted-foreground">工号</Label>
                    <p className="font-medium">{selectedEmployee.employeeNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">姓名</Label>
                    <p className="font-medium">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">部门</Label>
                    <p className="font-medium">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">手机号</Label>
                    <p className="font-medium">{selectedEmployee.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">绑定状态</Label>
                    <p className="font-medium">
                      <Badge variant={selectedEmployee.bindStatus === 1 ? 'success' : 'secondary'}>
                        {selectedEmployee.bindStatus === 1 ? '已绑定' : '未绑定'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">绑定时间</Label>
                    <p className="font-medium">
                      {selectedEmployee.bindTime ? new Date(selectedEmployee.bindTime).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="follow" className="space-y-4">
                <div className="pt-4 space-y-3">
                  {wechatAccounts.map(account => {
                    return (
                      <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: account.color }}
                          >
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="font-medium">{account.account_name}</div>
                        </div>
                        <Badge variant="secondary">
                          待检测
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="promotion" className="space-y-4">
                <div className="pt-4 space-y-3">
                  {wechatAccounts.map(account => {
                    const promo = getPromotionForAccount(selectedEmployee.id, account.id)
                    
                    return (
                      <div key={account.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: account.color }}
                            >
                              <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium">{account.account_name}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4 mr-1" />
                            推广码
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-2 rounded bg-muted">
                            <div className="text-2xl font-bold">{promo.scanCount}</div>
                            <div className="text-xs text-muted-foreground">扫码次数</div>
                          </div>
                          <div className="p-2 rounded bg-muted">
                            <div className="text-2xl font-bold text-success">+{promo.followCount}</div>
                            <div className="text-xs text-muted-foreground">带来关注</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* 总计 */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-sm font-medium text-muted-foreground mb-2">推广总计</div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{getTotalPromotion(selectedEmployee.id).scanCount}</div>
                        <div className="text-xs text-muted-foreground">总扫码</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-success">+{getTotalPromotion(selectedEmployee.id).followCount}</div>
                        <div className="text-xs text-muted-foreground">总关注</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}