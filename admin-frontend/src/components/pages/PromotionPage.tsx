import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Input } from '../ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  TrendingUp,
  Users,
  Building2,
  MessageSquare,
  Search,
  Download,
  QrCode,
  UserPlus,
  UserCheck,
  BarChart3,
} from 'lucide-react'

import { mockOfficialAccounts, departments as allDepartments } from '../../data/mockData'

// 统一从 mockOfficialAccounts 获取公众号数据
const accounts = mockOfficialAccounts.map(acc => ({
  id: acc.id,
  name: acc.name
}))

// 根据公众号ID获取公众号名称
const getAccountName = (accountId: string) => {
  const account = accounts.find(acc => acc.id === accountId)
  return account ? account.name : '未知公众号'
}

// 模拟员工推广数据 - 使用统一的公众号ID
const employees = [
  { id: 1, name: '张三', department: '销售部', accountId: accounts[0].id, qrCode: 'qr_001' },
  { id: 2, name: '李四', department: '销售部', accountId: accounts[0].id, qrCode: 'qr_002' },
  { id: 3, name: '王五', department: '市场部', accountId: accounts[1].id, qrCode: 'qr_003' },
  { id: 4, name: '赵六', department: '市场部', accountId: accounts[0].id, qrCode: 'qr_004' },
  { id: 5, name: '钱七', department: '运营部', accountId: accounts[1].id, qrCode: 'qr_005' },
  { id: 6, name: '孙八', department: '运营部', accountId: accounts[2].id, qrCode: 'qr_006' },
]

// 模拟推广统计数据 - 动态使用公众号名称
const promotionStats = {
  byEmployee: [
    { employeeId: 1, name: '张三', department: '销售部', accountId: accounts[0].id, scans: 256, newFollows: 189, lostFollows: 12, netFollows: 177, conversionRate: 73.8 },
    { employeeId: 2, name: '李四', department: '销售部', accountId: accounts[0].id, scans: 198, newFollows: 145, lostFollows: 8, netFollows: 137, conversionRate: 73.2 },
    { employeeId: 3, name: '王五', department: '市场部', accountId: accounts[1].id, scans: 312, newFollows: 267, lostFollows: 23, netFollows: 244, conversionRate: 85.6 },
    { employeeId: 4, name: '赵六', department: '市场部', accountId: accounts[0].id, scans: 145, newFollows: 98, lostFollows: 5, netFollows: 93, conversionRate: 67.6 },
    { employeeId: 5, name: '钱七', department: '运营部', accountId: accounts[1].id, scans: 423, newFollows: 356, lostFollows: 31, netFollows: 325, conversionRate: 84.2 },
    { employeeId: 6, name: '孙八', department: '运营部', accountId: accounts[2].id, scans: 567, newFollows: 489, lostFollows: 45, netFollows: 444, conversionRate: 86.2 },
  ],
  byDepartment: [
    { department: '销售部', scans: 454, newFollows: 334, lostFollows: 20, netFollows: 314, conversionRate: 73.6, employeeCount: 2 },
    { department: '市场部', scans: 457, newFollows: 365, lostFollows: 28, netFollows: 337, conversionRate: 79.9, employeeCount: 2 },
    { department: '运营部', scans: 990, newFollows: 845, lostFollows: 76, netFollows: 769, conversionRate: 85.4, employeeCount: 2 },
  ],
  byAccount: accounts.map((acc, index) => ({
    accountId: acc.id,
    accountName: acc.name,
    scans: [599, 735, 567][index] || 500,
    newFollows: [432, 623, 489][index] || 400,
    lostFollows: [25, 54, 45][index] || 30,
    netFollows: [407, 569, 444][index] || 370,
    conversionRate: [72.1, 84.8, 86.2][index] || 80,
    employeeCount: [3, 2, 1][index] || 1,
  })),
}

// 部门列表（过滤掉"全部部门"选项）
const departments = allDepartments.filter(d => d !== '全部部门')

type ViewMode = 'employee' | 'department' | 'account'

export function PromotionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('employee')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  // 根据视图模式筛选数据
  const filteredData = useMemo(() => {
    if (viewMode === 'employee') {
      return promotionStats.byEmployee.filter(item => {
        const matchesSearch = item.name.includes(searchTerm)
        const matchesDept = departmentFilter === 'all' || item.department === departmentFilter
        const matchesAccount = accountFilter === 'all' || item.accountId === accountFilter
        return matchesSearch && matchesDept && matchesAccount
      })
    } else if (viewMode === 'department') {
      return promotionStats.byDepartment.filter(item => {
        const matchesSearch = item.department.includes(searchTerm)
        const matchesDept = departmentFilter === 'all' || item.department === departmentFilter
        return matchesSearch && matchesDept
      })
    } else {
      return promotionStats.byAccount.filter(item => {
        const matchesSearch = item.accountName.includes(searchTerm)
        const matchesAccount = accountFilter === 'all' || item.accountId === accountFilter
        return matchesSearch && matchesAccount
      })
    }
  }, [viewMode, searchTerm, departmentFilter, accountFilter])

  // 计算汇总数据
  const summary = useMemo(() => {
    const data = viewMode === 'employee' ? promotionStats.byEmployee 
      : viewMode === 'department' ? promotionStats.byDepartment 
      : promotionStats.byAccount
    
    return {
      totalScans: data.reduce((sum, item) => sum + item.scans, 0),
      totalNewFollows: data.reduce((sum, item) => sum + item.newFollows, 0),
      totalLostFollows: data.reduce((sum, item) => sum + item.lostFollows, 0),
      totalNetFollows: data.reduce((sum, item) => sum + item.netFollows, 0),
      avgConversionRate: (data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length).toFixed(1),
    }
  }, [viewMode])

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">推广统计</h1>
          <p className="text-muted-foreground">查看员工、部门、公众号的推广数据</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          导出报表
        </Button>
      </div>

      {/* 汇总卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总扫描次数</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalScans.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新增关注</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{summary.totalNewFollows.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">取消关注</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">-{summary.totalLostFollows.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">净增关注</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.totalNetFollows.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均转化率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgConversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 视图切换和筛选 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'employee' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('employee')}
              >
                <Users className="mr-2 h-4 w-4" />
                按员工
              </Button>
              <Button
                variant={viewMode === 'department' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('department')}
              >
                <Building2 className="mr-2 h-4 w-4" />
                按部门
              </Button>
              <Button
                variant={viewMode === 'account' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('account')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                按公众号
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={viewMode === 'employee' ? '搜索员工...' : viewMode === 'department' ? '搜索部门...' : '搜索公众号...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-40"
                />
              </div>
              
              {/* 部门筛选 */}
              {(viewMode === 'employee' || viewMode === 'department') && (
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-28"
                >
                  <option value="all">全部部门</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              )}
              
              {/* 公众号筛选 */}
              {(viewMode === 'employee' || viewMode === 'account') && (
                <Select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="w-32"
                >
                  <option value="all">全部公众号</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              )}
              
              {/* 时间范围 */}
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-28"
              >
                <option value="today">今日</option>
                <option value="7d">近7天</option>
                <option value="30d">近30天</option>
                <option value="90d">近90天</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* 员工视图表格 */}
          {viewMode === 'employee' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>员工</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>推广公众号</TableHead>
                  <TableHead className="text-right">扫描次数</TableHead>
                  <TableHead className="text-right">新增关注</TableHead>
                  <TableHead className="text-right">取消关注</TableHead>
                  <TableHead className="text-right">净增关注</TableHead>
                  <TableHead className="text-right">转化率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item: any) => (
                  <TableRow key={item.employeeId}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{getAccountName(item.accountId)}</TableCell>
                    <TableCell className="text-right">{item.scans}</TableCell>
                    <TableCell className="text-right text-green-600">+{item.newFollows}</TableCell>
                    <TableCell className="text-right text-red-500">-{item.lostFollows}</TableCell>
                    <TableCell className="text-right font-medium text-blue-600">{item.netFollows}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.conversionRate >= 80 ? 'bg-green-100 text-green-700' :
                        item.conversionRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.conversionRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* 部门视图表格 */}
          {viewMode === 'department' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>部门</TableHead>
                  <TableHead className="text-right">员工数</TableHead>
                  <TableHead className="text-right">扫描次数</TableHead>
                  <TableHead className="text-right">新增关注</TableHead>
                  <TableHead className="text-right">取消关注</TableHead>
                  <TableHead className="text-right">净增关注</TableHead>
                  <TableHead className="text-right">转化率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item: any) => (
                  <TableRow key={item.department}>
                    <TableCell className="font-medium">{item.department}</TableCell>
                    <TableCell className="text-right">{item.employeeCount}</TableCell>
                    <TableCell className="text-right">{item.scans}</TableCell>
                    <TableCell className="text-right text-green-600">+{item.newFollows}</TableCell>
                    <TableCell className="text-right text-red-500">-{item.lostFollows}</TableCell>
                    <TableCell className="text-right font-medium text-blue-600">{item.netFollows}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.conversionRate >= 80 ? 'bg-green-100 text-green-700' :
                        item.conversionRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.conversionRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* 公众号视图表格 */}
          {viewMode === 'account' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>公众号</TableHead>
                  <TableHead className="text-right">推广员工数</TableHead>
                  <TableHead className="text-right">扫描次数</TableHead>
                  <TableHead className="text-right">新增关注</TableHead>
                  <TableHead className="text-right">取消关注</TableHead>
                  <TableHead className="text-right">净增关注</TableHead>
                  <TableHead className="text-right">转化率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item: any) => (
                  <TableRow key={item.accountId}>
                    <TableCell className="font-medium">{item.accountName}</TableCell>
                    <TableCell className="text-right">{item.employeeCount}</TableCell>
                    <TableCell className="text-right">{item.scans}</TableCell>
                    <TableCell className="text-right text-green-600">+{item.newFollows}</TableCell>
                    <TableCell className="text-right text-red-500">-{item.lostFollows}</TableCell>
                    <TableCell className="text-right font-medium text-blue-600">{item.netFollows}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.conversionRate >= 80 ? 'bg-green-100 text-green-700' :
                        item.conversionRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.conversionRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}