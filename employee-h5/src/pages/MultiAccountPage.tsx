import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PromotionCodeCard from '../components/PromotionCodeCard';
import { 
  mockOfficialAccounts, 
  mockPosterTemplates, 
  mockEmployeePromotionCodes,
  mockCurrentEmployee 
} from '../utils/mockData';
import { getLocalStorage } from '../utils/helpers';
import type { OfficialAccount, PosterTemplate, EmployeePromotionCode, Employee } from '../types';
import './MultiAccountPage.css';

const MultiAccountPage = () => {
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [accounts, setAccounts] = useState<OfficialAccount[]>([]);
  const [templates, setTemplates] = useState<PosterTemplate[]>([]);
  const [promotionCodes, setPromotionCodes] = useState<EmployeePromotionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'codes' | 'accounts'>('codes');

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

    // 模拟加载数据
    setTimeout(() => {
      setAccounts(mockOfficialAccounts);
      setTemplates(mockPosterTemplates);
      setPromotionCodes(mockEmployeePromotionCodes);
      setLoading(false);
    }, 500);
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="multi-account-page">
      {/* 顶部导航 */}
      <div className="navbar">
        <div className="navbar-left" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <div className="navbar-title">多公众号推广</div>
        <div className="navbar-right"></div>
      </div>

      {/* 标签切换 */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'codes' ? 'active' : ''}`}
          onClick={() => setActiveTab('codes')}
        >
          推广码
        </button>
        <button 
          className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          公众号列表
        </button>
      </div>

      {/* 内容区域 */}
      <div className="content-container">
        {activeTab === 'codes' ? (
          <div className="codes-section">
            {/* 统计概览 */}
            <div className="stats-overview">
              <div className="stats-item">
                <span className="stats-number">{promotionCodes.length}</span>
                <span className="stats-label">推广码数量</span>
              </div>
              <div className="stats-item">
                <span className="stats-number">{accounts.length}</span>
                <span className="stats-label">公众号数量</span>
              </div>
              <div className="stats-item">
                <span className="stats-number">{templates.filter(t => t.isActive).length}</span>
                <span className="stats-label">海报模板</span>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="info-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>点击展开查看推广码，可生成专属海报进行分享</span>
            </div>

            {/* 推广码列表 */}
            <div className="codes-list">
              {promotionCodes.map((code) => (
                <PromotionCodeCard
                  key={code.id}
                  promotionCode={code}
                  templates={templates}
                  employeeName={employee?.name || ''}
                  employeeDepartment={employee?.department || ''}
                />
              ))}
            </div>

            {promotionCodes.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>暂无推广码</h3>
                <p>请联系管理员分配推广码</p>
              </div>
            )}
          </div>
        ) : (
          <div className="accounts-section">
            {/* 公众号列表 */}
            <div className="accounts-list">
              {accounts.map((account) => (
                <div key={account.id} className={`account-card ${account.isPrimary ? 'is-primary' : ''}`}>
                  <div className="account-avatar">
                    {account.avatar ? (
                      <img src={account.avatar} alt={account.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {account.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="account-info">
                    <div className="account-name-row">
                      <h4 className="account-name">{account.name}</h4>
                      {account.isPrimary && (
                        <span className="primary-tag">主推</span>
                      )}
                    </div>
                    {account.description && (
                      <p className="account-desc">{account.description}</p>
                    )}
                  </div>
                  <div className="account-badge">已绑定</div>
                </div>
              ))}
            </div>

            {accounts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📱</div>
                <h3>暂无公众号</h3>
                <p>请联系管理员添加公众号</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 海报模板预览入口 */}
      <div className="templates-entry" onClick={() => navigate('/templates')}>
        <div className="entry-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <div className="entry-content">
          <div className="entry-title">海报模板库</div>
          <div className="entry-desc">{templates.length} 个模板可选</div>
        </div>
        <div className="entry-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      {/* 底部说明 */}
      <div className="footer-info">
        <h4>使用说明</h4>
        <ul>
          <li>每个公众号都有专属的推广二维码</li>
          <li>选择海报模板可生成带二维码的精美海报</li>
          <li>长按海报可保存到相册或分享给好友</li>
          <li>关注数据实时同步到系统后台</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiAccountPage;