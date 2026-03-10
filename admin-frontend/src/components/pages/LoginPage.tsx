import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Demo: accept any login
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 h-[200%] w-[200%] rounded-full border border-primary/10" />
        <div className="absolute -bottom-1/2 -left-1/2 h-[200%] w-[200%] rounded-full border border-primary/10" />
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md shadow-2xl animate-scale-in">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">公</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold">公众号推广追踪系统</h1>
          <p className="text-sm text-muted-foreground">管理员登录</p>
        </div>

        <CardHeader className="pb-4">
          <CardTitle>欢迎回来</CardTitle>
          <CardDescription>
            请输入您的账号和密码以继续
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 rounded border-input" />
                <span className="text-muted-foreground">记住我</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                忘记密码？
              </a>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-3 text-center text-sm">
            <p className="text-muted-foreground">
              演示账号：任意输入即可登录
            </p>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
          <p>© 2026 公众号推广追踪系统. All rights reserved.</p>
        </div>
      </Card>
    </div>
  )
}
