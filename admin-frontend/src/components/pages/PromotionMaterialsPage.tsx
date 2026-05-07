import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  Image,
  FileText,
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Star,
  StarOff,
  Loader2,
  X,
  CheckCircle,
} from 'lucide-react'
import { posterTemplateApi, circleTextApi, promotionKitApi, accountApi, uploadApi } from '../../lib/api'
import type { ApiResponse } from '../../lib/api'

// Tab 类型
type TabValue = 'poster' | 'text' | 'kit'

export function PromotionMaterialsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('poster')
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>('')

  // 数据状态
  const [posters, setPosters] = useState<any[]>([])
  const [texts, setTexts] = useState<any[]>([])
  const [kits, setKits] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 加载公众号列表
  useEffect(() => {
    loadAccounts()
  }, [])

  // 加载公众号列表
  const loadAccounts = async () => {
    try {
      const response = await accountApi.getList()
      console.log('公众号列表响应:', response)
      if (response.code === 200) {
        console.log('公众号数据:', response.data)
        setAccounts(response.data || [])
      }
    } catch (error) {
      console.error('加载公众号列表失败:', error)
    }
  }

  // 加载海报模板列表
  const loadPosters = async () => {
    setLoading(true)
    try {
      const response = await posterTemplateApi.getList({
        keyword: searchTerm || undefined,
        account_id: accountFilter !== 'all' ? parseInt(accountFilter) : undefined,
      })
      if (response.code === 200) {
        setPosters(response.data)
      }
    } catch (error) {
      console.error('加载海报模板失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载文案列表
  const loadTexts = async () => {
    setLoading(true)
    try {
      const response = await circleTextApi.getList({
        keyword: searchTerm || undefined,
        category: accountFilter !== 'all' ? accountFilter : undefined,
      })
      if (response.code === 200) {
        setTexts(response.data)
      }
    } catch (error) {
      console.error('加载文案失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载推广套装列表
  const loadKits = async () => {
    setLoading(true)
    try {
      const response = await promotionKitApi.getList({
        keyword: searchTerm || undefined,
        account_id: accountFilter !== 'all' ? parseInt(accountFilter) : undefined,
      })
      if (response.code === 200) {
        setKits(response.data)
      }
    } catch (error) {
      console.error('加载推广套装失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 根据当前 Tab 加载对应数据
  useEffect(() => {
    if (activeTab === 'poster') {
      loadPosters()
    } else if (activeTab === 'text') {
      loadTexts()
    } else if (activeTab === 'kit') {
      loadKits()
    }
  }, [activeTab, searchTerm, accountFilter])

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  // 编辑海报
  const handleEditPoster = async (poster: any) => {
    setSelectedItem(poster)
    setFormData({
      name: poster.name,
      description: poster.description,
      account_id: poster.account_id,
      image_url: poster.image_url,
      width: poster.width,
      height: poster.height,
      qr_x: poster.qr_x,
      qr_y: poster.qr_y,
      qr_size: poster.qr_size,
    })
    // 设置预览图片
    if (poster.image_url) {
      setPreviewImage(`http://localhost:3000${poster.image_url}`)
    } else {
      setPreviewImage('')
    }
    setIsEditDialogOpen(true)
  }

  // 删除海报
  const handleDeletePoster = async (posterId: number) => {
    if (!confirm('确定要删除这个海报模板吗？')) return

    try {
      const response = await posterTemplateApi.delete(posterId.toString())
      if (response.code === 200) {
        alert('删除成功')
        loadPosters()
      }
    } catch (error: any) {
      alert(`删除失败: ${error.message}`)
    }
  }

  // 复制海报
  const handleCopyPoster = async (poster: any) => {
    alert('复制功能待实现')
  }

  // 编辑文案
  const handleEditText = async (text: any) => {
    setSelectedItem(text)
    setFormData({
      name: text.name,
      category: text.category,
      content: text.content,
      variables: Array.isArray(text.variables) ? text.variables : [],
    })
    setIsEditDialogOpen(true)
  }

  // 删除文案
  const handleDeleteText = async (textId: number) => {
    if (!confirm('确定要删除这个文案模板吗？')) return

    try {
      const response = await circleTextApi.delete(textId.toString())
      if (response.code === 200) {
        alert('删除成功')
        loadTexts()
      }
    } catch (error: any) {
      alert(`删除失败: ${error.message}`)
    }
  }

  // 复制文案
  const handleCopyText = (text: any) => {
    copyToClipboard(text.content)
  }

  // 编辑套装
  const handleEditKit = async (kit: any) => {
    setSelectedItem(kit)
    setFormData({
      name: kit.name,
      account_id: kit.account_id,
      poster_template_id: kit.poster_template_id,
      text_template_id: kit.text_template_id,
    })
    setIsEditDialogOpen(true)
  }

  // 删除套装
  const handleDeleteKit = async (kitId: number) => {
    if (!confirm('确定要删除这个推广套装吗？')) return

    try {
      const response = await promotionKitApi.delete(kitId.toString())
      if (response.code === 200) {
        alert('删除成功')
        loadKits()
      }
    } catch (error: any) {
      alert(`删除失败: ${error.message}`)
    }
  }

  // 复制套装
  const handleCopyKit = async (kit: any) => {
    alert('复制功能待实现')
  }

  // 设为默认套装
  const handleSetDefault = async (kitId: number) => {
    try {
      const response = await promotionKitApi.setDefault(kitId.toString())
      if (response.code === 200) {
        alert('设置成功')
        loadKits()
      }
    } catch (error: any) {
      alert(`设置失败: ${error.message}`)
    }
  }

  // 处理图片文件选择
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('只支持 JPEG、JPG、PNG、GIF、WEBP 格式的图片')
      return
    }

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    // 设置预览
    setPreviewImage(URL.createObjectURL(file))

    // 上传图片
    setUploading(true)
    try {
      const response = await uploadApi.uploadImage(file)
      console.log('📸 上传响应:', response)
      if (response.code === 200) {
        const imageUrl = response.data.url
        console.log('✅ 图片上传成功，URL:', imageUrl)
        // 使用函数式更新确保获取最新状态
        setFormData(prev => {
          const newFormData = { ...prev, image_url: imageUrl }
          console.log('📝 更新后的 formData:', newFormData)
          return newFormData
        })
        alert('图片上传成功')
      } else {
        throw new Error(response.message || '上传失败')
      }
    } catch (error: any) {
      console.error('❌ 图片上传失败:', error)
      alert(`图片上传失败: ${error.message}`)
      setPreviewImage('')
      setFormData(prev => ({ ...prev, image_url: undefined }))
    } finally {
      setUploading(false)
    }
  }

  // 添加素材
  const handleAdd = () => {
    setFormData({})
    setPreviewImage('')
    setIsAddDialogOpen(true)
  }

  // 创建套装
  const handleCreateKit = () => {
    setFormData({})
    setPreviewImage('')
    setIsAddDialogOpen(true)
  }

  // 提交表单
  const handleSubmit = async () => {
    console.log('📤 开始提交表单，当前 formData:', formData)
    console.log('📤 当前 activeTab:', activeTab)

    // 验证海报模板必填字段
    if (activeTab === 'poster') {
      console.log('📤 验证海报模板字段:')
      console.log('  - name:', formData.name)
      console.log('  - account_id:', formData.account_id)
      console.log('  - image_url:', formData.image_url)
      console.log('  - qr_x, qr_y, qr_size:', formData.qr_x, formData.qr_y, formData.qr_size)

      if (!formData.name) {
        alert('请输入模板名称')
        return
      }
      if (!formData.account_id) {
        alert('请选择所属公众号')
        return
      }
      if (!formData.image_url) {
        alert('请上传海报图片')
        return
      }
      if (!formData.qr_x || !formData.qr_y || !formData.qr_size) {
        alert('请填写二维码坐标和尺寸')
        return
      }
    }

    // 验证朋友圈文案必填字段
    if (activeTab === 'text') {
      if (!formData.name) {
        alert('请输入文案名称')
        return
      }
      if (!formData.content) {
        alert('请输入文案内容')
        return
      }
    }

    // 验证推广套装必填字段
    if (activeTab === 'kit') {
      if (!formData.name) {
        alert('请输入套装名称')
        return
      }
      if (!formData.account_id) {
        alert('请选择所属公众号')
        return
      }
      if (!formData.poster_template_id) {
        alert('请选择海报模板')
        return
      }
      if (!formData.text_template_id) {
        alert('请选择文案模板')
        return
      }
    }

    setSubmitting(true)
    try {
      if (activeTab === 'poster') {
        if (selectedItem) {
          // 编辑
          const response = await posterTemplateApi.update(selectedItem.id, formData)
          if (response.code === 200) {
            alert('更新成功')
            loadPosters()
          }
        } else {
          // 添加
          const response = await posterTemplateApi.add(formData)
          if (response.code === 200) {
            alert('添加成功')
            loadPosters()
          }
        }
      } else if (activeTab === 'text') {
        if (selectedItem) {
          // 编辑
          const response = await circleTextApi.update(selectedItem.id, formData)
          if (response.code === 200) {
            alert('更新成功')
            loadTexts()
          }
        } else {
          // 添加
          const response = await circleTextApi.add(formData)
          if (response.code === 200) {
            alert('添加成功')
            loadTexts()
          }
        }
      } else if (activeTab === 'kit') {
        if (selectedItem) {
          // 编辑
          const response = await promotionKitApi.update(selectedItem.id, formData)
          if (response.code === 200) {
            alert('更新成功')
            loadKits()
          }
        } else {
          // 添加
          const response = await promotionKitApi.add(formData)
          if (response.code === 200) {
            alert('添加成功')
            loadKits()
          }
        }
      }
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setSelectedItem(null)
      setFormData({})
    } catch (error: any) {
      alert(`操作失败: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // 过滤后的数据
  const filteredPosters = posters
  const filteredTexts = texts
  const filteredKits = kits

  // 文案分类
  const textCategories = [
    { value: 'formal', label: '正式风格' },
    { value: 'casual', label: '轻松风格' },
    { value: 'general', label: '通用风格' },
    { value: 'promotion', label: '促销风格' },
  ]

  // 表单字段渲染
  const renderFormFields = () => {
    if (activeTab === 'poster') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">模板名称 *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入模板名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入描述"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_id">所属公众号 *</Label>
            <select
              id="account_id"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.account_id || ''}
              onChange={(e) => setFormData({ ...formData, account_id: parseInt(e.target.value) })}
            >
              <option value="">请选择公众号</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_file">海报图片 *</Label>
            <input
              id="image_file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              disabled={uploading}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              支持格式：JPEG、JPG、PNG、GIF、WEBP | 最大大小：5MB
            </p>
            {formData.image_url && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>图片已上传</span>
              </div>
            )}
            {previewImage && (
              <div className="mt-2">
                <img
                  src={previewImage}
                  alt="预览"
                  className="max-w-full h-40 object-contain border rounded"
                />
              </div>
            )}
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                上传中...
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">宽度 *</Label>
              <Input
                id="width"
                type="number"
                value={formData.width || ''}
                onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                placeholder="1080"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">高度 *</Label>
              <Input
                id="height"
                type="number"
                value={formData.height || ''}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                placeholder="1920"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 尺寸要求：建议使用 1080×1920（竖版）或 1920×1080（横版），确保二维码位置清晰可见
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qr_x">二维码 X 坐标 *</Label>
              <Input
                id="qr_x"
                type="number"
                value={formData.qr_x || ''}
                onChange={(e) => setFormData({ ...formData, qr_x: parseInt(e.target.value) })}
                placeholder="X"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr_y">二维码 Y 坐标 *</Label>
              <Input
                id="qr_y"
                type="number"
                value={formData.qr_y || ''}
                onChange={(e) => setFormData({ ...formData, qr_y: parseInt(e.target.value) })}
                placeholder="Y"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr_size">二维码尺寸 *</Label>
              <Input
                id="qr_size"
                type="number"
                value={formData.qr_size || ''}
                onChange={(e) => setFormData({ ...formData, qr_size: parseInt(e.target.value) })}
                placeholder="300"
              />
            </div>
          </div>
        </>
      )
    } else if (activeTab === 'text') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">文案名称 *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入文案名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">分类 *</Label>
            <select
              id="category"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">请选择分类</option>
              {textCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">文案内容 *</Label>
            <textarea
              id="content"
              className="w-full px-3 py-2 border rounded-md min-h-[120px]"
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请输入文案内容，可以使用 {姓名}、{部门} 等变量"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variables">变量（逗号分隔）</Label>
            <Input
              id="variables"
              value={Array.isArray(formData.variables) ? formData.variables.join(', ') : ''}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
              placeholder="姓名, 部门, 日期"
            />
          </div>
        </>
      )
    } else if (activeTab === 'kit') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">套装名称 *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入套装名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_id">所属公众号 *</Label>
            <select
              id="account_id"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.account_id || ''}
              onChange={(e) => setFormData({ ...formData, account_id: parseInt(e.target.value) })}
            >
              <option value="">请选择公众号</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="poster_template_id">海报模板 *</Label>
            <select
              id="poster_template_id"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.poster_template_id || ''}
              onChange={(e) => setFormData({ ...formData, poster_template_id: parseInt(e.target.value) })}
            >
              <option value="">请选择海报模板</option>
              {posters.map((poster) => (
                <option key={poster.id} value={poster.id}>
                  {poster.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_template_id">文案模板 *</Label>
            <select
              id="text_template_id"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.text_template_id || ''}
              onChange={(e) => setFormData({ ...formData, text_template_id: parseInt(e.target.value) })}
            >
              <option value="">请选择文案模板</option>
              {texts.map((text) => (
                <option key={text.id} value={text.id}>
                  {text.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">推广素材管理</h1>
          <p className="text-muted-foreground">管理海报模板、朋友圈文案和推广套装</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加素材
        </Button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'poster' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('poster')}
        >
          <Image className="mr-2 h-4 w-4" />
          海报模板
        </Button>
        <Button
          variant={activeTab === 'text' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('text')}
        >
          <FileText className="mr-2 h-4 w-4" />
          朋友圈文案
        </Button>
        <Button
          variant={activeTab === 'kit' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('kit')}
        >
          <Package className="mr-2 h-4 w-4" />
          推广套装
        </Button>
      </div>

      {/* 海报模板 Tab */}
      {activeTab === 'poster' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>海报模板管理</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索海报模板..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                >
                  <option value="all">所有公众号</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模板信息</TableHead>
                    <TableHead>所属公众号</TableHead>
                    <TableHead>尺寸</TableHead>
                    <TableHead>二维码位置</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosters.map((poster) => (
                    <TableRow key={poster.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{poster.name}</div>
                          <div className="text-sm text-muted-foreground">{poster.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{poster.account_name}</TableCell>
                      <TableCell>{poster.width} × {poster.height}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>X: {poster.qr_x}, Y: {poster.qr_y}</div>
                          <div>尺寸: {poster.qr_size} × {poster.qr_size}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={poster.status === 'active' ? 'default' : 'secondary'}>
                          {poster.status === 'active' ? '启用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPoster(poster)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyPoster(poster)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePoster(poster.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 朋友圈文案 Tab */}
      {activeTab === 'text' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>朋友圈文案管理</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索文案模板..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                >
                  <option value="all">所有分类</option>
                  {textCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead>变量</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTexts.map((text) => (
                    <TableRow key={text.id}>
                      <TableCell className="font-medium">{text.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {textCategories.find(c => c.value === text.category)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate text-sm text-muted-foreground">
                          {text.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(text.variables) && text.variables.map((variable: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{text.usage_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={text.status === 'active' ? 'default' : 'secondary'}>
                          {text.status === 'active' ? '启用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleEditText(text)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyText(text)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteText(text.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 推广套装 Tab */}
      {activeTab === 'kit' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>推广套装管理</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索推广套装..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                >
                  <option value="all">所有公众号</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name}
                    </option>
                  ))}
                </select>
                <Button onClick={handleCreateKit}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建套装
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>套装名称</TableHead>
                    <TableHead>所属公众号</TableHead>
                    <TableHead>海报模板</TableHead>
                    <TableHead>文案模板</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead>默认套装</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKits.map((kit) => (
                    <TableRow key={kit.id}>
                      <TableCell className="font-medium">{kit.name}</TableCell>
                      <TableCell>{kit.account_name}</TableCell>
                      <TableCell>{kit.poster_template_name}</TableCell>
                      <TableCell>{kit.text_template_name}</TableCell>
                      <TableCell>{kit.usage_count || 0}</TableCell>
                      <TableCell>
                        {kit.is_default ? (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            默认
                          </Badge>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleSetDefault(kit.id)}>
                            <StarOff className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleEditKit(kit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyKit(kit)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteKit(kit.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 添加弹窗 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'poster' && '添加海报模板'}
              {activeTab === 'text' && '添加文案模板'}
              {activeTab === 'kit' && '创建推广套装'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'poster' && '填写海报模板信息'}
              {activeTab === 'text' && '填写文案模板信息'}
              {activeTab === 'kit' && '选择海报和文案组合成推广套装'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {renderFormFields()}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                '确认'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑弹窗 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'poster' && '编辑海报模板'}
              {activeTab === 'text' && '编辑文案模板'}
              {activeTab === 'kit' && '编辑推广套装'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'poster' && '修改海报模板信息'}
              {activeTab === 'text' && '修改文案模板信息'}
              {activeTab === 'kit' && '修改推广套装配置'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {renderFormFields()}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
