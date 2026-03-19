import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Copy,
  Save,
  Building2,
  Search
} from 'lucide-react'
import { mockOfficialAccounts } from '../../data/mockData'
import type { OfficialAccount } from '../../types'

export function AccountsPage() {
  const [accounts, setAccounts] = useState<OfficialAccount[]>(mockOfficialAccounts)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<OfficialAccount | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: '',
    appId: '',
    appSecret: '',
  })

  // 过滤公众号
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.appId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 添加公众号
  const handleAdd = () => {
    const account: OfficialAccount = {
      id: `${Date.now()}`,
      name: newAccount.name,
      appId: newAccount.appId,
      totalFollowers: 0,
      employeeFollowers: 0,
      todayNewFollows: 0,
      monthNewFollows: 0,
      status: 1,
    }
    setAccounts([...accounts, account])
    setIsAddDialogOpen(false)
    setNewAccount({ name: '', appId: '', appSecret: '' })
  }

  // 编辑公众号
  const handleEdit = (account: OfficialAccount) => {
    setSelectedAccount(account)
    setIsEditDialogOpen(true)
  }

  // 删除公众号
  const handleDelete = (accountId: string) => {
    if (confirm('确定要删除这个公众号吗？删除后无法恢复。')) {
      setAccounts(accounts.filter(acc => acc.id !== accountId))
    }
  }

  // 切换状态
  const handleToggleStatus = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: acc.status === 1 ? 0 : 1 }
        : acc
    ))
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (selectedAccount) {
      setAccounts(accounts.map(acc => 
        acc.id === selectedAccount.id ? selectedAccount : acc
      ))
      setIsEditDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">公众号管理</h1>
          <p className="text-muted-foreground">
            管理员工可推广的微信公众号
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加公众号
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加公众号</DialogTitle>
              <DialogDescription>
                配置新的微信公众号，填写公众号基本信息
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">公众号名称 *</Label>
                <Input
                  id="name"
                  placeholder="请输入公众号名称"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appId">AppID *</Label>
                <Input
                  id="appId"
                  placeholder="wx1234567890abcdef"
                  value={newAccount.appId}
                  onChange={(e) => setNewAccount({ ...newAccount, appId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  在微信公众平台 → 开发 → 基本配置中获取
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appSecret">AppSecret</Label>
                <Input
                  id="appSecret"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={newAccount.appSecret}
                  onChange={(e) => setNewAccount({ ...newAccount, appSecret: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  用于调用微信API，请妥善保管
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAdd} disabled={!newAccount.name || !newAccount.appId}>
                <Save className="mr-2 h-4 w-4" />
                添加
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>共 {accounts.length} 个公众号</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>{accounts.filter(a => a.status === 1).length} 个启用中</span>
        </div>
      </div>

      {/* 公众号列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>公众号列表</CardTitle>
              <CardDescription>
                管理所有已接入的微信公众号
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索公众号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">公众号</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">AppID</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">状态</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {searchTerm ? '未找到匹配的公众号' : '暂无公众号，点击上方按钮添加'}
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {account.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                              关注者 {account.totalFollowers.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {account.appId.slice(0, 12)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(account.appId)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={account.status === 1 ? 'success' : 'secondary'}>
                          {account.status === 1 ? '已启用' : '已停用'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(account.id)}
                          >
                            {account.status === 1 ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                停用
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                启用
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑公众号</DialogTitle>
            <DialogDescription>
              修改公众号配置信息
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">公众号名称</Label>
                <Input
                  id="edit-name"
                  value={selectedAccount.name}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-appId">AppID</Label>
                <Input
                  id="edit-appId"
                  value={selectedAccount.appId}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, appId: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
