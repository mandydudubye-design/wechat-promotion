import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, CheckCircle } from 'lucide-react';

interface WechatAuthProps {
  onAuthSuccess: (openid: string, userInfo?: any) => void;
  onAuthError?: (error: string) => void;
  scope?: 'snsapi_base' | 'snsapi_userinfo';
  redirectUri?: string;
}

export function WechatAuth({
  onAuthSuccess,
  onAuthError,
  scope = 'snsapi_base',
  redirectUri
}: WechatAuthProps) {
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 检查URL中是否已有code（从微信回调回来）
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      // 有code，说明是从微信授权回调回来的
      handleCallback(code, state || '');
      // 清除URL中的code参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  /**
   * 步骤1：获取授权URL并跳转
   */
  const handleAuth = async () => {
    try {
      setLoading(true);
      setAuthStatus('loading');

      // 如果没有指定redirectUri，使用当前页面
      const currentUri = redirectUri || `${window.location.origin}${window.location.pathname}`;
      const state = Date.now().toString(); // 用于防止CSRF攻击

      // 调用后端接口获取授权URL
      const response = await fetch('/api/wechat-oauth/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '获取授权URL失败');
      }

      // 跳转到微信授权页面
      window.location.href = result.data.auth_url;

    } catch (error: any) {
      setAuthStatus('error');
      setErrorMessage(error.message || '授权失败');
      setLoading(false);
      onAuthError?.(error.message);
    }
  };

  /**
   * 步骤2：处理授权回调，用code换取openid
   */
  const handleCallback = async (code: string, state: string) => {
    try {
      setLoading(true);
      setAuthStatus('loading');

      // 调用后端接口，用code换取openid
      const response = await fetch(`/api/wechat-oauth/callback?code=${code}&state=${state}&scope=${scope}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '获取OpenID失败');
      }

      setAuthStatus('success');
      setLoading(false);

      // 返回openid和用户信息
      onAuthSuccess(result.data.openid, result.data);

    } catch (error: any) {
      setAuthStatus('error');
      setErrorMessage(error.message || '获取OpenID失败');
      setLoading(false);
      onAuthError?.(error.message);
    }
  };

  if (authStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <CardTitle>授权成功</CardTitle>
          <CardDescription>已成功获取您的微信授权</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => setAuthStatus('idle')} variant="outline">
            重新授权
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (authStatus === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">授权失败</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <Button onClick={handleAuth} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                授权中...
              </>
            ) : (
              '重新授权'
            )}
          </Button>
          <Button
            onClick={() => {
              setAuthStatus('idle');
              setErrorMessage('');
            }}
            variant="outline"
          >
            取消
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle>微信授权</CardTitle>
        <CardDescription>
          {scope === 'snsapi_base'
            ? '需要获取您的微信授权以完成身份验证（静默授权，无需点击同意）'
            : '需要获取您的微信授权以完成身份验证（需点击同意）'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={handleAuth} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              授权中...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.68-.06-.86.27l-1.9 3.26c-1.65-.76-3.5-1.18-5.42-1.18-1.95 0-3.82.43-5.48 1.2L3.7 5.72c-.18-.32-.57-.41-.86-.27-.3.15-.42.54-.26.85l1.88 3.24C2.09 11.23 0 14.56 0 18h24c0-3.49-2.12-6.82-5.72-8.52zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              微信授权登录
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          授权后，我们将仅用于身份验证，不会获取您的其他隐私信息
        </p>
      </CardContent>
    </Card>
  );
}

// 使用示例
export function WechatAuthExample() {
  const handleAuthSuccess = (openid: string, userInfo?: any) => {
    console.log('授权成功:', { openid, userInfo });
    // 保存openid到本地存储或发送到后端
    localStorage.setItem('openid', openid);
    // 跳转到绑定页面或推广页面
    window.location.href = '/bind';
  };

  const handleAuthError = (error: string) => {
    console.error('授权失败:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <WechatAuth
        onAuthSuccess={handleAuthSuccess}
        onAuthError={handleAuthError}
        scope="snsapi_base" // 使用静默授权，推荐
        // scope="snsapi_userinfo" // 如需获取用户信息，使用这个
      />
    </div>
  );
}
