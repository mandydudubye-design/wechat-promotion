import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Select } from '../ui/select'
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  QrCode,
  CheckCircle,
  XCircle,
  Copy,
  Save,
  Loader2
} from 'lucide-react'
import { 
  getAccounts, 
  createAccount, 
  updateAccount, 
  deleteAccount, 
  disableAccount, 
  enableAccount,
  type WechatAccount 
} from '../../lib/api'

export function AccountsPage() {
  const [accounts, setAccounts] = useState<WechatAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<WechatAccount | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_id: '',
    account_type: 'subscription',
    app_id: '',
    app_secret: '',
  })

  // 获取公众号列表
  const fetchAccounts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取公众号列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  // 添加公众号
  const handleAdd = async () => {
    if (!newAccount.account_name || !newAccount.account_id) {
      alert('请填写公众号名称和账号ID')
      return
    }

    setSaving(true)
    try {
      await createAccount({
        account_name: newAccount.account_name,
        account_id: newAccount.account_id,
        account_type: newAccount.account_type,
        app_id: newAccount.app_id || undefined,
        app_secret: newAccount.app_secret || undefined,
      })
      setIsAddDialogOpen(false)
      setNewAccount({ account_name: '', account_id: '', account_type: 'subscription', app_id: '', app_secret: '' })
      fetchAccounts()
      alert('添加成功！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '添加失败')
    } finally {
      setSaving(false)
    }
  }

  // 编辑公众号
  const handleEdit = (account: WechatAccount) => {
    setSelectedAccount(account)
    setIsEditDialogOpen(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!selectedAccount) return
    
    setSaving(true)
    try {
      await updateAccount(selectedAccount.id, {
        account_name: selectedAccount.account_name,
        app_id: selectedAccount.app_id || undefined,
      })
      setIsEditDialogOpen(false)
      fetchAccounts()
      alert('保存成功！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 删除公众号
  const handleDelete = async (accountDbId: number, accountName: string) => {
    if (!confirm(`确定要删除公众号"${accountName}"吗？`)) return
    
    try {
      await deleteAccount(accountDbId)
      fetchAccounts()
      alert('删除成功！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  // 切换状态
  const handleToggleStatus = async (account: WechatAccount) => {
    try {
      if (account.status === 1) {
        await disableAccount(account.id)
      } else {
        await enableAccount(account.id)
      }
      fetchAccounts()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">多公众号管理</h1>
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
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">公众号ID *</Label>
                <Input
                  id="accountId"
                  placeholder="gh_xxxxxx"
                  value={newAccount.account_id}
                  onChange={(e) => setNewAccount({ ...newAccount, account_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">公众号类型 *</Label>
                <Select
                  id="accountType"
                  value={newAccount.account_type}
                  onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value as 'subscription' | 'service' })}
                >
                  <option value="">选择公众号类型</option>
                  <option value="subscription">订阅号</option>
                  <option value="service">服务号</option>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {newAccount.account_type === 'service' ? '支持H5网页授权，用户体验更佳' : '通过识别码验证员工身份'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appId">AppID</Label>
                <Input
                  id="appId"
                  placeholder="wx1234567890abcdef"
                  value={newAccount.app_id}
                  onChange={(e) => setNewAccount({ ...newAccount, app_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appSecret">AppSecret</Label>
                <Input
                  id="appSecret"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={newAccount.app_secret}
                  onChange={(e) => setNewAccount({ ...newAccount, app_secret: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                添加
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公众号总数</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              系统中的所有公众号
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃公众号</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.filter(a => a.status === 1).length}
            </div>
            <p className="text-xs text-muted-foreground">
              当前可推广
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已停用</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.filter(a => a.status !== 1).length}
            </div>
            <p className="text-xs text-muted-foreground">
              停用状态
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总扫码数</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.reduce((sum, a) => sum + (a.qr_code_url ? 1 : 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              已配置二维码
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>公众号列表</CardTitle>
          <CardDescription>
            {loading ? '加载中...' : `共 ${accounts.length} 个公众号`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">加载中...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无公众号数据，点击上方按钮添加
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {account.account_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{account.account_name}</h3>
                        <Badge variant={account.status === 1 ? 'success' : 'secondary'}>
                          {account.status === 1 ? '活跃' : '停用'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        账号ID: {account.account_id}
                      </p>
                      {account.app_id && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            AppID: {account.app_id}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1"
                            onClick={() => copyToClipboard(account.app_id!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(account)}
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
                      onClick={() => handleDelete(account.id, account.account_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  value={selectedAccount.account_name}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, account_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-accountType">公众号类型</Label>
                <Select
                  id="edit-accountType"
                  value={selectedAccount.account_type || 'subscription'}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, account_type: e.target.value as 'subscription' | 'service' })}
                >
                  <option value="">选择公众号类型</option>
                  <option value="subscription">订阅号</option>
                  <option value="service">服务号</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-appId">AppID</Label>
                <Input
                  id="edit-appId"
                  value={selectedAccount.app_id || ''}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, app_id: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}