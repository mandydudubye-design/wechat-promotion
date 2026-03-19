import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Save, RefreshCw, Bell, Shield, Clock, Database, QrCode, Users } from 'lucide-react'
import { useState } from 'react'

export function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSyncing(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">
          配置系统参数、安全和数据同步选项
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>系统信息</CardTitle>
                <CardDescription>当前系统配置和运行状态</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">系统版本</span>
                  <Badge variant="secondary">v2.0</Badge>
                </div>
                <p className="mt-2 text-2xl font-bold">2.0.1</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">可用性</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold">99.9%</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">数据库</span>
                  <Badge variant="success">正常</Badge>
                </div>
                <p className="mt-2 text-2xl font-bold">正常</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API状态</span>
                  <Badge variant="success">正常</Badge>
                </div>
                <p className="mt-2 text-2xl font-bold">正常</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sync Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <RefreshCw className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>数据同步</CardTitle>
                <CardDescription>配置数据同步参数</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>自动同步间隔</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
                <span className="text-sm">2026-03-09 18:30:00</span>
                <Badge variant="secondary">刚刚</Badge>
              </div>
            </div>
            <Button onClick={handleSync} disabled={syncing} className="w-full">
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? '同步中...' : '立即同步'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
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
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">每日汇总</p>
                <p className="text-sm text-muted-foreground">每天发送推广数据汇总报告</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">异常提醒</p>
                <p className="text-sm text-muted-foreground">系统异常时立即发送提醒</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
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
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>7天</option>
                <option>30天</option>
                <option selected>永久有效</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>排行榜展示周期</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Shield className="h-5 w-5 text-destructive" />
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
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP白名单</p>
                <p className="text-sm text-muted-foreground">仅允许特定IP访问管理后台</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <Label>会话超时时间</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>30分钟</option>
                <option selected>1小时</option>
                <option>2小时</option>
                <option>4小时</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>密码复杂度要求</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>低（6位以上）</option>
                <option selected>中（8位以上，含数字和字母）</option>
                <option>高（8位以上，含特殊字符）</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Employee Management Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <CardTitle>员工管理设置</CardTitle>
                <CardDescription>配置员工注册和管理相关参数</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>员工ID前缀</Label>
                <Input 
                  placeholder="EMP"
                  defaultValue="EMP"
                />
              </div>
              <div className="space-y-2">
                <Label>默认员工角色</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option>普通员工</option>
                  <option selected>推广专员</option>
                  <option>团队组长</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>新员工试用期（天）</Label>
                <Input 
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
              <div className="space-y-2">
                <Label>每月最低推广要求</Label>
                <Input 
                  type="number"
                  placeholder="5"
                  defaultValue="5"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">重置</Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </div>
    </div>
  )
}
