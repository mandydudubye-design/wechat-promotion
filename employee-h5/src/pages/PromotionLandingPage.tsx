import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './PromotionLandingPage.css';

const API_BASE = import.meta.env.PROD ? '' : 'http://192.168.100.200:3000';

interface Account {
  id: number;
  account_name: string;
  wechat_id?: string;
  account_type: string;
  verified: boolean | number;
  qr_code_url?: string;
  description?: string;
  avatar?: string;
}

export default function PromotionLandingPage() {
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState('');

  const accountId = searchParams.get('accountId');
  const employeeId = searchParams.get('employeeId');
  const employeeName = searchParams.get('employeeName') || '推广员';

  useEffect(() => {
    if (!accountId) {
      setError('参数缺失');
      setLoading(false);
      return;
    }

    fetchAccount();
    recordScan();
  }, [accountId, employeeId]);

  const fetchAccount = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/accounts/${accountId}`);
      const data = await res.json();

      if (data.code === 200 && data.data) {
        setAccount(data.data);
      } else {
        setError('公众号信息加载失败');
      }
    } catch (err) {
      setError('网络连接失败，请确认网络正常后重试');
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordScan = async () => {
    if (!employeeId) return;
    try {
      await fetch(`${API_BASE}/api/smart-promotion/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: parseInt(accountId!, 10),
          employeeId: employeeId,
          scanTime: new Date().toISOString()
        })
      });
    } catch (err) {
      // 扫码记录失败不影响页面展示
      console.error('记录扫码失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="promotion-landing-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="promotion-landing-page">
        <div className="error">
          <div className="error-icon">⚠️</div>
          <p>{error || '页面加载失败'}</p>
          <button className="retry-btn" onClick={fetchAccount}>点击重试</button>
        </div>
      </div>
    );
  }

  // 处理二维码 URL：blob URL 不可跨页面使用，需要跳过
  const validQrUrl = account.qr_code_url && !account.qr_code_url.startsWith('blob:')
    ? (account.qr_code_url.startsWith('http')
        ? account.qr_code_url
        : `${API_BASE}${account.qr_code_url}`)
    : null;

  const isVerified = account.verified === true || account.verified === 1;

  return (
    <div className="promotion-landing-page">
      <div className="landing-container">
        {/* 员工信息卡片 */}
        <div className="employee-card">
          <div className="employee-avatar">
            {employeeName.charAt(0)}
          </div>
          <div className="employee-info">
            <h3>{employeeName}</h3>
            <p>邀请您关注</p>
          </div>
        </div>

        {/* 公众号信息 */}
        <div className="account-card">
          {account.avatar && (
            <div className="account-avatar">
              <img src={account.avatar} alt={account.account_name} />
            </div>
          )}
          <h2>{account.account_name}</h2>
          {account.description && (
            <p className="account-description">{account.description}</p>
          )}
          
          <div className="account-tags">
            <span className={`tag ${isVerified ? 'verified' : 'unverified'}`}>
              {isVerified ? '✓ 已认证' : '未认证'}
            </span>
            <span className="tag type">
              {account.account_type === 'service' ? '服务号' : '订阅号'}
            </span>
          </div>
        </div>

        {/* 关注引导 */}
        <div className="guide-section">
          <div className="guide-title">👇 长按识别二维码关注 👇</div>
          
          {validQrUrl ? (
            <div className="qr-code-container">
              <img 
                src={validQrUrl} 
                alt="公众号二维码" 
                className="qr-code-image"
              />
            </div>
          ) : account.wechat_id ? (
            <div className="wechat-id-container">
              <div className="wechat-id-label">微信号</div>
              <div className="wechat-id-value">{account.wechat_id}</div>
              <div className="wechat-id-tip">打开微信搜索添加</div>
            </div>
          ) : (
            <div className="no-qr-code">
              暂无二维码，请联系管理员
            </div>
          )}

          <div className="guide-steps">
            <div className="step">
              <span className="step-number">1</span>
              <span>长按上方二维码</span>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <span>选择"识别图中二维码"</span>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <span>点击"关注"完成</span>
            </div>
            <div className="step highlight-step">
              <span className="step-number">4</span>
              <span>在公众号对话框回复推广码</span>
            </div>
          </div>

          {/* 推广码展示 */}
          {employeeId && (
            <div className="promo-code-section">
              <div className="promo-code-label">推广码</div>
              <div className="promo-code-value">{employeeId}</div>
              <div className="promo-code-tip">
                关注后在公众号对话框发送此推广码，即可完成推广归因
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="footer">
          <p>感谢您的关注和支持！</p>
        </div>
      </div>
    </div>
  );
}
