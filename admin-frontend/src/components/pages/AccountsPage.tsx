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
  Settings,
  CheckCircle,
  XCircle,
  Copy,
  Save,
  MessageCircle
} from 'lucide-react'

interface Account {
  id: string
  accountName: string
  appId: string
  avatar: string
  description: string
  status: 'active' | 'inactive'
  createdAt: string
}

const mockAccounts: Account[] = [
  {
    id: 'acct_001',
    accountName: '企业服务号',
    appId: 'wx1234567890abcdef',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ES',
    description: '企业官方服务号',
    status: 'active',
    createdAt: '2026-01-15'
  },
  {
    id: 'acct_002',
    accountName: '产品动态号',
    appId: 'wx0987654321fedcba',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PD',
    description: '产品更新推送',
    status: 'active',
    createdAt: '2026-02-01'
  },
  {
    id: 'acct_003',
    accountName: '活动推广号',
    appId: 'wxabcdef1234567890',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AP',
    description: '营销活动专用',
    status: 'inactive',
    createdAt: '2026-02-20'
  }
]

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    appId: '',
    appSecret: '',
    description: ''
  })

  const handleAdd = () => {
    if (!newAccount.accountName || !newAccount.appId) {
      alert('请填写公众号名称和AppID')
      return
    }
    const account: Account = {
      id: `acct_${Date.now()}`,
      accountName: newAccount.accountName,
      appId: newAccount.appId,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newAccount.accountName}`,
      description: newAccount.description,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setAccounts([...accounts, account])
    setIsAddDialogOpen(false)
    setNewAccount({ accountName: '', appId: '', appSecret: '', description: '' })
  }

  const handleEdit = (account: Account) => {
    setSelectedAccount(account)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (accountId: string) => {
    if (confirm('确定要删除这个公众号吗？')) {
      setAccounts(accounts.filter(acc => acc.id !== accountId))
    }
  }

  const handleToggleStatus = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: acc.status === 'active' ? 'inactive' : 'active' }
        : acc
    ))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
                配置新的微信公众号信息
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">公众号名称 *</Label>
                <Input
                  id="accountName"
                  placeholder="企业服务号"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  placeholder="企业官方服务号"
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAdd}>
                <Save className="mr-2 h-4 w-4" />
                添加
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Simple Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公众号总数</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃公众号</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {accounts.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>公众号列表</CardTitle>
          <CardDescription>
            管理和配置所有微信公众号，点击启用/停用控制员工是否可推广
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{account.accountName}</h3>
                      <Badge variant={account.status === 'active' ? 'success' : 'secondary'}>
                        {account.status === 'active' ? '活跃' : '停用'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{account.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        AppID: {account.appId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => copyToClipboard(account.appId)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(account.id)}
                  >
                    {account.status === 'active' ? (
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
              </div>
            ))}
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
                <Label htmlFor="edit-accountName">公众号名称</Label>
                <Input
                  id="edit-accountName"
                  defaultValue={selectedAccount.accountName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-appId">AppID</Label>
                <Input
                  id="edit-appId"
                  defaultValue={selectedAccount.appId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">描述</Label>
                <Input
                  id="edit-description"
                  defaultValue={selectedAccount.description}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}