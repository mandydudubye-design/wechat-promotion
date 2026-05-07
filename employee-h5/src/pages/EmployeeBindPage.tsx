import { useState, useEffect } from 'react';
import { WechatAuth } from '@/components/WechatAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCheck, AlertCircle } from 'lucide-react';

/**
 * 员工绑定页面
 *
 * 流程：
 * 1. 先通过H5网页授权获取OpenID（静默授权，用户无感知）
 * 2. 用户输入工号和手机号后4位进行验证
 * 3. 验证成功后，将OpenID绑定到员工账号
 * 4. 生成推广二维码
 */
export function EmployeeBindPage() {
  const [step, setStep] = useState<'auth' | 'verify' | 'success' | 'error'>('auth');
  const [loading, setLoading] = useState(false);
  const [openid, setOpenid] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);

  // 员工信息表单
  const [formData, setFormData] = useState({
    employee_id: '',
    phone_suffix: '', // 手机号后4位
  });

  // 错误信息
  const [error, setError] = useState('');

  // 处理授权成功
  const handleAuthSuccess = (fetchedOpenid: string, fetchedUserInfo?: any) => {
    console.log('授权成功:', { openid: fetchedOpenid, userInfo: fetchedUserInfo });
    setOpenid(fetchedOpenid);
    setUserInfo(fetchedUserInfo);
    setStep('verify'); // 进入验证步骤
  };

  // 处理授权失败
  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage);
    setStep('error');
  };

  // 提交绑定信息
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!formData.employee_id) {
      setError('请输入工号');
      return;
    }

    if (!formData.phone_suffix || formData.phone_suffix.length !== 4) {
      setError('请输入正确的手机号后4位');
      return;
    }

    setLoading(true);

    try {
      // 调用后端接口进行绑定
      const response = await fetch('/api/employee/bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          openid: openid,
          employee_id: formData.employee_id,
          phone_suffix: formData.phone_suffix,
          nickname: userInfo?.nickname || '',
          avatar: userInfo?.headimgurl || '',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '绑定失败');
      }

      // 绑定成功
      setStep('success');

      // 保存员工信息到本地存储
      localStorage.setItem('employee', JSON.stringify(result.data));

    } catch (error: any) {
      setError(error.message || '绑定失败，请稍后重试');
      setLoading(false);
    }
  };

  // 重新绑定
  const handleRetry = () => {
    setStep('auth');
    setError('');
    setFormData({ employee_id: '', phone_suffix: '' });
  };

  // 跳转到推广页面
  const handleGoToPromotion = () => {
    window.location.href = '/my-promotion';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 步骤1：微信授权 */}
        {step === 'auth' && (
          <div className="mt-8">
            <WechatAuth
              onAuthSuccess={handleAuthSuccess}
              onAuthError={handleAuthError}
              scope="snsapi_base" // 使用静默授权
            />
          </div>
        )}

        {/* 步骤2：验证员工信息 */}
        {step === 'verify' && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-center">员工身份验证</CardTitle>
              <CardDescription className="text-center">
                请输入您的工号和手机号后4位，完成身份验证
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">工号 *</Label>
                  <Input
                    id="employee_id"
                    placeholder="请输入工号，如：EMP001"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })
                    }
                    disabled={loading}
                    className="uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_suffix">手机号后4位 *</Label>
                  <Input
                    id="phone_suffix"
                    placeholder="请输入手机号后4位"
                    value={formData.phone_suffix}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setFormData({ ...formData, phone_suffix: value });
                    }}
                    disabled={loading}
                    maxLength={4}
                    type="tel"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    '验证并绑定'
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="text-muted-foreground"
                >
                  重新授权
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤3：绑定成功 */}
        {step === 'success' && (
          <Card className="mt-8 border-green-200">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-green-600">绑定成功！</CardTitle>
              <CardDescription>
                恭喜您，已成功绑定员工身份
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  您的专属推广二维码已生成，现在可以开始推广公众号了！
                </p>
              </div>

              <Button onClick={handleGoToPromotion} className="w-full">
                查看我的推广码
              </Button>

              <Button
                variant="outline"
                onClick={handleRetry}
                className="w-full"
              >
                重新绑定
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 步骤4：授权失败 */}
        {step === 'error' && (
          <Card className="mt-8 border-red-200">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-red-600">授权失败</CardTitle>
              <CardDescription>
                {error || '无法获取您的微信授权，请稍后重试'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleRetry} className="w-full">
                重新授权
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
