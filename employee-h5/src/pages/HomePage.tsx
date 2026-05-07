import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { mockCurrentEmployee, mockPromotionStats, mockOfficialAccounts } from '../utils/mockData';
import { getLocalStorage, removeLocalStorage, copyToClipboard, downloadImage } from '../utils/helpers';
import type { Employee, PromotionStats, OfficialAccount } from '../types';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [primaryAccount, setPrimaryAccount] = useState<OfficialAccount | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<OfficialAccount | null>(null);
  const [accounts, setAccounts] = useState<OfficialAccount[]>([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loadingQrCode, setLoadingQrCode] = useState(false);

  useEffect(() => {
    // 检查是否已绑定
    const isBound = getLocalStorage<boolean>('isBound', false);
    if (!isBound) {
      navigate('/bind');
      return;
    }

    // 加载员工信息
    const savedEmployee = getLocalStorage<Employee>('employee');
    if (savedEmployee) {
      setEmployee(savedEmployee);
    } else {
      setEmployee(mockCurrentEmployee);
    }

    // 加载统计数据
    setStats(mockPromotionStats);

    // 从后端 API 加载公众号列表（会自动设置 selectedAccount）
    fetchAccounts();
  }, [navigate]);

  // （生成推广码由 fetchAccounts 和 handleAccountSelect 主动调用，不依赖 useEffect）

  // 从后端获取公众号列表
  const fetchAccounts = async () => {
    // 同时读取本地员工数据（不依赖 state 异步更新）
    const savedEmployee = getLocalStorage<Employee>('employee') || mockCurrentEmployee;

    try {
      const response = await fetch('http://localhost:3000/api/employee-binding/accounts');
      const result = await response.json();

      if (result.code === 200 && result.data.length > 0) {
        setAccounts(result.data);
        const firstAccount = result.data[0];
        setPrimaryAccount(firstAccount);
        setSelectedAccount(firstAccount);

        // 直接用拿到的数据生成推广码，不等 state 更新
        generatePromotionCode(savedEmployee, firstAccount);
      } else {
        // 如果没有数据，使用 mock 数据（兼容旧数据）
        setAccounts(mockOfficialAccounts);
        const primary = mockOfficialAccounts.find(acc => acc.isPrimary) || mockOfficialAccounts[0];
        if (primary) {
          setPrimaryAccount(primary);
          setSelectedAccount(primary);
          generatePromotionCode(savedEmployee, primary);
        }
      }
    } catch (error) {
      console.error('获取公众号列表失败:', error);
      // 失败时使用 mock 数据
      setAccounts(mockOfficialAccounts);
      const primary = mockOfficialAccounts.find(acc => acc.isPrimary) || mockOfficialAccounts[0];
      if (primary) {
        setPrimaryAccount(primary);
        setSelectedAccount(primary);
        generatePromotionCode(savedEmployee, primary);
      }
    }
  };

  // 生成专属推广码
  const generatePromotionCode = async (emp?: typeof employee, acc?: typeof selectedAccount) => {
    const curEmployee = emp || employee;
    const curAccount = acc || selectedAccount;
    if (!curEmployee || !curAccount) return;

    // 确保 accountId 为数字
    const accountId = typeof curAccount.id === 'string' ? parseInt(curAccount.id, 10) : curAccount.id;
    if (!accountId || isNaN(accountId)) {
      console.error('无效的公众号ID:', curAccount.id);
      return;
    }

    setLoadingQrCode(true);
    try {
      const response = await fetch('http://localhost:3000/api/smart-promotion/employee-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: curEmployee.employeeId,
          employeeName: curEmployee.name,
          accountId: accountId
        })
      });

      const result = await response.json();
      console.log('推广码生成结果:', result);

      if (result.code === 200 && result.data?.qrCodeUrl) {
        setQrCodeUrl(result.data.qrCodeUrl);
      } else {
        console.error('推广码生成失败:', result);
        showToast(result.message || '生成推广码失败', 'error');
      }
    } catch (error) {
      console.error('请求推广码失败:', error);
      showToast('网络错误，无法连接到后端', 'error');
    } finally {
      setLoadingQrCode(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    removeLocalStorage('employee');
    removeLocalStorage('isBound');
    showToast('已退出登录', 'info');
    setTimeout(() => {
      navigate('/bind');
    }, 500);
    setShowLogoutConfirm(false);
  };

  const handleShare = async () => {
    if (!employee || !selectedAccount) return;

    setSharing(true);
    const shareText = `我是${employee.name}，邀请您关注【${selectedAccount.name}】！\n工号：${employee.employeeId}`;
    const success = await copyToClipboard(shareText);

    setSharing(false);
    if (success) {
      showToast('推广文案已复制，快去分享吧！', 'success');
    } else {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const handleDownloadQRCode = () => {
    if (!employee || !selectedAccount) return;

    setSaving(true);
    const svgElement = document.getElementById('qrcode');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        downloadImage(pngUrl, `推广码-${selectedAccount.name}-${employee.name}.png`);
        
        setSaving(false);
        showToast('二维码已保存', 'success');
      };

      img.onerror = () => {
        setSaving(false);
        showToast('保存失败，请重试', 'error');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  if (!employee || !stats) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  // 如果没有设置主推公众号，跳转到多号推广页
  if (!selectedAccount) {
    return (
      <div className="home-page">
        <div className="no-primary-account">
          <div className="empty-icon">📱</div>
          <h3>未设置主推公众号</h3>
          <p>请联系管理员设置主推公众号</p>
          <button 
            className="goto-multi-btn"
            onClick={() => navigate('/multi-account')}
          >
            查看所有公众号
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* 顶部导航 */}
      <div className="navbar">
        <div className="navbar-left" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div className="navbar-title">我的推广码</div>
        <div className="navbar-right" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="stats-container">
        <div className="stats-header">
          <div className="employee-info">
            <div className="employee-avatar">{employee.name.charAt(0)}</div>
            <div className="employee-details">
              <div className="employee-name">{employee.name}</div>
              <div className="employee-detail">{employee.department} | {employee.employeeId}</div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.scanCount}</div>
            <div className="stat-label">累计扫码</div>
          </div>
          <div className="stat-item highlight">
            <div className="stat-value">{stats.followCount}</div>
            <div className="stat-label">累计关注</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{(stats.followCount / stats.scanCount * 100).toFixed(1)}%</div>
            <div className="stat-label">转化率</div>
          </div>
        </div>

        <div className="stats-footer">
          <div className="mini-stat">
            <span className="mini-stat-label">今日扫码</span>
            <span className="mini-stat-value">{stats.todayScanCount}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">今日关注</span>
            <span className="mini-stat-value highlight">{stats.todayFollowCount}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">本月扫码</span>
            <span className="mini-stat-value">{stats.monthScanCount}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">本月关注</span>
            <span className="mini-stat-value">{stats.monthFollowCount}</span>
          </div>
        </div>
      </div>

      {/* 二维码卡片 */}
      <div className="qrcode-card">
        <div className="card-header">
          <h3 className="card-title">我的专属推广码</h3>
          {accounts.length > 1 && (
            <div className="account-selector-wrapper">
              <div 
                className="account-selector"
                onClick={() => setShowAccountSelector(!showAccountSelector)}
              >
                <span className="selected-account">{selectedAccount?.name}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`selector-arrow ${showAccountSelector ? 'rotated' : ''}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {showAccountSelector && (
                <div className="account-dropdown">
                  {accounts.map(account => (
                    <div 
                      key={account.id}
                      className={`account-option ${selectedAccount?.id === account.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowAccountSelector(false);
                        // 切换公众号后重新生成推广码
                        const savedEmployee = getLocalStorage<Employee>('employee') || mockCurrentEmployee;
                        generatePromotionCode(savedEmployee, account);
                      }}
                    >
                      <span className="account-name">{account.name}</span>
                      {account.isPrimary && <span className="primary-tag">主推</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {accounts.length === 1 && primaryAccount && (
            <div className="primary-badge">
              <span className="badge-icon">📌</span>
              {primaryAccount.name}
            </div>
          )}
        </div>

        {selectedAccount ? (
          <>
            <div className="qrcode-wrapper">
              <div className="qrcode-box">
                {loadingQrCode ? (
                  <div className="loading-qrcode">生成中...</div>
                ) : qrCodeUrl ? (
                  <img
                    id="qrcode"
                    src={qrCodeUrl}
                    alt="专属推广码"
                    className="qrcode-image"
                  />
                ) : (
                  <QRCodeSVG
                    id="qrcode"
                    value={`${selectedAccount.id}_${employee?.employeeId}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                  />
                )}
              </div>
              <p className="qrcode-tip">扫描二维码即可关注公众号</p>
              {selectedAccount.description && (
                <p className="account-desc">{selectedAccount.description}</p>
              )}
            </div>

            <div className="action-buttons">
              <button 
                className={`action-btn primary ${sharing ? 'loading' : ''}`} 
                onClick={handleShare}
                disabled={sharing}
              >
                {sharing ? (
                  <>
                    <span className="btn-spinner small white"></span>
                    复制中...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    复制推广文案
                  </>
                )}
              </button>
              <button 
                className={`action-btn secondary ${saving ? 'loading' : ''}`} 
                onClick={handleDownloadQRCode}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="btn-spinner small"></span>
                    保存中...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    保存二维码
                  </>
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* 功能入口 */}
      <div className="menu-grid">
        <div 
          className="menu-item featured" 
          onClick={() => navigate('/follow-task')}
        >
          <div className="menu-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="menu-content">
            <div className="menu-title">
              公众号关注任务
              <span className="follow-badge">2</span>
            </div>
            <div className="menu-desc">待关注 2 个公众号</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => navigate('/ranking')}>
          <div className="menu-icon-wrapper ranking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="menu-content">
            <div className="menu-title">推广榜单</div>
            <div className="menu-desc">查看排名</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => navigate('/records')}>
          <div className="menu-icon-wrapper records">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="menu-content">
            <div className="menu-title">推广记录</div>
            <div className="menu-desc">查看明细</div>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="footer-tip">
        <p>让更多人关注我们的公众号</p>
        <p>一起为组织发展贡献力量！</p>
      </div>

      {/* 退出确认弹窗 */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="退出登录"
        message="退出后需要重新绑定才能使用，确定要退出吗？"
        confirmText="退出"
        cancelText="取消"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default HomePage;