import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Save, RefreshCw, Bell, Shield, QrCode, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [synced, setSynced] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSync = async () => {
    setSyncing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSyncing(false)
    setSynced(true)
    setTimeout(() => setSynced(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">
          配置数据同步、通知、推广和安全选项
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Sync Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>数据同步</CardTitle>
                <CardDescription>配置公众号数据同步参数</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>自动同步间隔</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>每30分钟</option>
                <option selected>每1小时</option>
                <option>每2小时</option>
                <option>每6小时</option>
                <option>手动同步</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>上次同步时间</Label>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm text-muted-foreground">2026-03-19 08:25:00</span>
                <Badge variant="secondary">5分钟前</Badge>
              </div>
            </div>
            <Button onClick={handleSync} disabled={syncing} className="w-full">
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  同步中...
                </>
              ) : synced ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  同步完成
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  立即同步
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle>通知设置</CardTitle>
                <CardDescription>配置系统通知方式</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">新关注通知</p>
                <p className="text-sm text-muted-foreground">员工获得新关注时发送通知</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">每日汇总</p>
                <p className="text-sm text-muted-foreground">每天发送推广数据汇总报告</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">异常提醒</p>
                <p className="text-sm text-muted-foreground">系统异常时立即发送提醒</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary cursor-pointer" />
            </div>
            <div className="space-y-2">
              <Label>通知邮箱</Label>
              <Input 
                type="email" 
                placeholder="admin@company.com"
                defaultValue="admin@company.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Promotion Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>推广设置</CardTitle>
                <CardDescription>配置员工推广相关参数</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>推广二维码有效期</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>7天</option>
                <option>30天</option>
                <option selected>永久有效</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>排行榜展示周期</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>日榜</option>
                <option selected>周榜</option>
                <option>月榜</option>
                <option>总榜</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>每日推广任务目标</Label>
              <Input 
                type="number" 
                placeholder="10"
                defaultValue="10"
              />
              <p className="text-xs text-muted-foreground">员工每日建议完成的推广关注数</p>
            </div>
            <div className="space-y-2">
              <Label>每月最低推广要求</Label>
              <Input 
                type="number"
                placeholder="5"
                defaultValue="5"
              />
              <p className="text-xs text-muted-foreground">员工每月需完成的最低关注数</p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle>安全设置</CardTitle>
                <CardDescription>配置系统安全选项</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">强制绑定验证</p>
                <p className="text-sm text-muted-foreground">员工绑定时需手机号验证</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP白名单</p>
                <p className="text-sm text-muted-foreground">仅允许特定IP访问管理后台</p>
              </div>
              <input type="checkbox" className="h-5 w-5 accent-primary cursor-pointer" />
            </div>
            <div className="space-y-2">
              <Label>会话超时时间</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>30分钟</option>
                <option selected>1小时</option>
                <option>2小时</option>
                <option>4小时</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>密码复杂度要求</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>低（6位以上）</option>
                <option selected>中（8位以上，含数字和字母）</option>
                <option>高（8位以上，含特殊字符）</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">重置默认</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              已保存
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
