import { useState, useRef, useEffect } from 'react'
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
  Search,
  Upload,
  QrCode,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { accountApi } from '../../lib/api'

// 推广模式说明
function getPromotionMode(account: Pick<any, 'account_type' | 'verified'>) {
  if (account.account_type === 'service' || account.verified) {
    return { label: '二维码模式', desc: '扫码即记录', color: 'text-green-600', bg: 'bg-green-50' }
  }
  return { label: '验证码模式', desc: '用户回复验证码', color: 'text-orange-600', bg: 'bg-orange-50' }
}

// 账号类型标签
function AccountTypeBadge({ accountType, verified }: { accountType: string; verified: boolean }) {
  if (accountType === 'service') {
    return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">服务号</Badge>
  }
  if (verified) {
    return <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">已认证订阅号</Badge>
  }
  return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">未认证订阅号</Badge>
}

const emptyForm = {
  name: '',
  wechatId: '',
  appId: '',
  appSecret: '',
  accountType: 'service' as 'service' | 'subscription',
  verified: false,
  qrCodeUrl: '',
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [newAccount, setNewAccount] = useState({ ...emptyForm })
  const [showSecret, setShowSecret] = useState(false)
  const [showEditSecret, setShowEditSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const qrInputRef = useRef<HTMLInputElement>(null)
  const editQrInputRef = useRef<HTMLInputElement>(null)

  // 加载公众号列表
  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const response = await accountApi.getList({ status: 1 })
      if (response.code === 200) {
        setAccounts(response.data)
      }
    } catch (error) {
      console.error('加载公众号列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.app_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.wechat_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 添加公众号
  const handleAdd = async () => {
    try {
      const response = await accountApi.add({
        account_name: newAccount.name,
        wechat_id: newAccount.wechatId,
        app_id: newAccount.appId,
        app_secret: newAccount.appSecret,
        account_type: newAccount.accountType,
        verified: newAccount.verified,
        qr_code_url: newAccount.qrCodeUrl,
      })
      if (response.code === 200) {
        alert('添加成功')
        setIsAddDialogOpen(false)
        setNewAccount({ ...emptyForm })
        setShowSecret(false)
        loadAccounts()
      }
    } catch (error: any) {
      alert(`添加失败: ${error.message}`)
    }
  }

  // 编辑
  const handleEdit = (account: any) => {
    setSelectedAccount({ ...account })
    setIsEditDialogOpen(true)
    setShowEditSecret(false)
  }

  // 删除
  const handleDelete = async (accountId: number) => {
    if (!confirm('确定要删除这个公众号吗？删除后无法恢复。')) return

    try {
      const response = await accountApi.delete(accountId.toString())
      if (response.code === 200) {
        alert('删除成功')
        loadAccounts()
      }
    } catch (error: any) {
      alert(`删除失败: ${error.message}`)
    }
  }

  // 切换启用/停用
  const handleToggleStatus = async (accountId: number, currentStatus: number) => {
    try {
      if (currentStatus === 1) {
        await accountApi.disable(accountId.toString())
      } else {
        await accountApi.enable(accountId.toString())
      }
      loadAccounts()
    } catch (error: any) {
      alert(`操作失败: ${error.message}`)
    }
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!selectedAccount) return

    try {
      const response = await accountApi.update(selectedAccount.id, {
        account_name: selectedAccount.account_name,
        wechat_id: selectedAccount.wechat_id,
        app_secret: selectedAccount.app_secret,
        account_type: selectedAccount.account_type,
        verified: selectedAccount.verified,
        qr_code_url: selectedAccount.qr_code_url,
      })
      if (response.code === 200) {
        alert('保存成功')
        setIsEditDialogOpen(false)
        loadAccounts()
      }
    } catch (error: any) {
      alert(`保存失败: ${error.message}`)
    }
  }

  // 上传二维码到后端，返回可访问的 URL
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.code === 200 && data.data?.url) {
        // 后端返回相对路径如 /uploads/xxx.png，拼接后端地址
        return `http://192.168.100.200:3000${data.data.url}`
      }
      alert('上传失败: ' + (data.message || '未知错误'))
      return null
    } catch (err) {
      console.error('上传失败:', err)
      alert('上传失败，请检查网络连接')
      return null
    }
  }

  // 上传二维码（新增表单）
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url) {
      setNewAccount({ ...newAccount, qrCodeUrl: url })
    }
  }

  // 上传二维码（编辑表单）
  const handleEditQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url && selectedAccount) {
      setSelectedAccount({ ...selectedAccount, qr_code_url: url })
    }
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  // 查看二维码
  const handleViewQr = (account: any) => {
    setSelectedAccount(account)
    setIsQrDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">公众号管理</h1>
          <p className="text-muted-foreground">管理员工可推广的微信公众号</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加公众号
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>添加公众号</DialogTitle>
              <DialogDescription>配置微信公众号基本信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">

              {/* 公众号名称 */}
              <div className="space-y-1.5">
                <Label htmlFor="name">公众号名称 <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="请输入公众号名称" value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} />
              </div>

              {/* 微信号 */}
              <div className="space-y-1.5">
                <Label htmlFor="wechatId">微信号（公众号ID）</Label>
                <Input id="wechatId" placeholder="如：gh_xxxxxxxx" value={newAccount.wechatId}
                  onChange={(e) => setNewAccount({ ...newAccount, wechatId: e.target.value })} />
                <p className="text-xs text-muted-foreground">在公众号主页显示的 ID，格式通常为 gh_ 开头</p>
              </div>

              {/* 公众号类型 + 认证状态 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>公众号类型 <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAccount({ ...newAccount, accountType: 'subscription' })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${newAccount.accountType === 'subscription' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      订阅号
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccount({ ...newAccount, accountType: 'service' })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${newAccount.accountType === 'service' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      服务号
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>认证状态</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAccount({ ...newAccount, verified: false })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${!newAccount.verified ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      未认证
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccount({ ...newAccount, verified: true })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${newAccount.verified ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      已认证
                    </button>
                  </div>
                </div>
              </div>

              {/* 推广模式提示 */}
              {(() => {
                const mode = getPromotionMode(newAccount)
                return (
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${mode.bg} ${mode.color}`}>
                    <QrCode className="h-3.5 w-3.5 shrink-0" />
                    <span>推广模式：<strong>{mode.label}</strong> — {mode.desc}</span>
                  </div>
                )
              })()}

              {/* AppID */}
              <div className="space-y-1.5">
                <Label htmlFor="appId">AppID <span className="text-red-500">*</span></Label>
                <Input id="appId" placeholder="wx1234567890abcdef" value={newAccount.appId}
                  onChange={(e) => setNewAccount({ ...newAccount, appId: e.target.value })} />
                <p className="text-xs text-muted-foreground">公众平台 → 开发 → 基本配置中获取</p>
              </div>

              {/* AppSecret */}
              <div className="space-y-1.5">
                <Label htmlFor="appSecret">AppSecret</Label>
                <div className="relative">
                  <Input id="appSecret" type={showSecret ? 'text' : 'password'}
                    placeholder="请输入 AppSecret" value={newAccount.appSecret}
                    onChange={(e) => setNewAccount({ ...newAccount, appSecret: e.target.value })} />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowSecret(!showSecret)}>
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">用于调用微信 API，请妥善保管</p>
              </div>

              {/* 上传二维码 */}
              <div className="space-y-1.5">
                <Label>公众号二维码</Label>
                <div className="flex items-center gap-3">
                  <input ref={qrInputRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                  <Button type="button" variant="outline" size="sm" onClick={() => qrInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    上传二维码
                  </Button>
                  {newAccount.qrCodeUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      已上传
                      <img src={newAccount.qrCodeUrl} alt="QR" className="h-10 w-10 rounded border object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">用于员工推广时展示，建议上传清晰二维码图片</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setNewAccount({ ...emptyForm }); setShowSecret(false) }}>
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

      {/* 统计 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>共 {accounts.length} 个公众号</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>{accounts.filter(a => a.status === 1).length} 个启用中</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <ShieldCheck className="h-4 w-4" />
          <span>{accounts.filter(a => a.verified || a.account_type === 'service').length} 个支持二维码推广</span>
        </div>
      </div>

      {/* 列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>公众号列表</CardTitle>
              <CardDescription>管理所有已接入的微信公众号</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索公众号名称 / AppID / 微信号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">公众号</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">类型 / 认证</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">AppID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">推广模式</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">二维码</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">状态</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        {searchTerm ? '未找到匹配的公众号' : '暂无公众号，点击上方按钮添加'}
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((account) => {
                      const mode = getPromotionMode(account)
                      return (
                        <tr key={account.id} className="hover:bg-muted/30 transition-colors">
                          {/* 公众号名称 + 微信号 */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                                {account.account_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{account.account_name}</p>
                                {account.wechat_id && (
                                  <p className="text-xs text-muted-foreground">{account.wechat_id}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 类型 + 认证 */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <AccountTypeBadge accountType={account.account_type} verified={account.verified} />
                              <div className={`flex items-center gap-1 text-xs ${account.verified ? 'text-green-600' : 'text-gray-400'}`}>
                                {account.verified
                                  ? <><ShieldCheck className="h-3 w-3" />已认证</>
                                  : <><ShieldOff className="h-3 w-3" />未认证</>
                                }
                              </div>
                            </div>
                          </td>

                          {/* AppID */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                {account.app_id.slice(0, 10)}...
                              </code>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(account.app_id)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>

                          {/* 推广模式 */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${mode.bg} ${mode.color}`}>
                              <QrCode className="h-3 w-3" />
                              {mode.label}
                            </span>
                          </td>

                          {/* 二维码 */}
                          <td className="p-4 text-center">
                            {account.qr_code_url ? (
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700"
                                onClick={() => handleViewQr(account)}>
                                <QrCode className="mr-1 h-4 w-4" />
                                查看
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">未上传</span>
                            )}
                          </td>

                          {/* 状态 */}
                          <td className="p-4 text-center">
                            <Badge variant={account.status === 1 ? 'success' : 'secondary'}>
                              {account.status === 1 ? '已启用' : '已停用'}
                            </Badge>
                          </td>

                          {/* 操作 */}
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="outline" size="sm" onClick={() => handleToggleStatus(account.id, account.status)}>
                                {account.status === 1
                                  ? <><XCircle className="mr-1 h-4 w-4" />停用</>
                                  : <><CheckCircle className="mr-1 h-4 w-4" />启用</>
                                }
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(account)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(account.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑公众号</DialogTitle>
            <DialogDescription>修改公众号配置信息</DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <Label>公众号名称 <span className="text-red-500">*</span></Label>
                <Input value={selectedAccount.account_name}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, account_name: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>微信号（公众号ID）</Label>
                <Input placeholder="如：gh_xxxxxxxx" value={selectedAccount.wechat_id || ''}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, wechat_id: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>公众号类型</Label>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setSelectedAccount({ ...selectedAccount, account_type: 'subscription' })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${selectedAccount.account_type === 'subscription' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      订阅号
                    </button>
                    <button type="button"
                      onClick={() => setSelectedAccount({ ...selectedAccount, account_type: 'service' })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${selectedAccount.account_type === 'service' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      服务号
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>认证状态</Label>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setSelectedAccount({ ...selectedAccount, verified: false })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${!selectedAccount.verified ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      未认证
                    </button>
                    <button type="button"
                      onClick={() => setSelectedAccount({ ...selectedAccount, verified: true })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${selectedAccount.verified ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      已认证
                    </button>
                  </div>
                </div>
              </div>

              {/* 推广模式提示 */}
              {(() => {
                const mode = getPromotionMode(selectedAccount)
                return (
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${mode.bg} ${mode.color}`}>
                    <QrCode className="h-3.5 w-3.5 shrink-0" />
                    <span>推广模式：<strong>{mode.label}</strong> — {mode.desc}</span>
                  </div>
                )
              })()}

              <div className="space-y-1.5">
                <Label>AppID</Label>
                <Input value={selectedAccount.app_id}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, app_id: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>AppSecret</Label>
                <div className="relative">
                  <Input type={showEditSecret ? 'text' : 'password'}
                    placeholder="不修改则留空" value={selectedAccount.app_secret || ''}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, app_secret: e.target.value })} />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowEditSecret(!showEditSecret)}>
                    {showEditSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>公众号二维码</Label>
                <div className="flex items-center gap-3">
                  <input ref={editQrInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditQrUpload} />
                  <Button type="button" variant="outline" size="sm" onClick={() => editQrInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedAccount.qr_code_url ? '更换二维码' : '上传二维码'}
                  </Button>
                  {selectedAccount.qr_code_url && (
                    <img src={selectedAccount.qr_code_url} alt="QR" className="h-12 w-12 rounded border object-cover" />
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看二维码对话框 */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>公众号二维码</DialogTitle>
            <DialogDescription>{selectedAccount?.account_name}</DialogDescription>
          </DialogHeader>
          {selectedAccount?.qr_code_url && (
            <div className="flex flex-col items-center gap-3 py-4">
              <img src={selectedAccount.qr_code_url} alt="QR Code" className="w-48 h-48 object-contain rounded-lg border" />
              <p className="text-xs text-muted-foreground">用于员工推广分享</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
